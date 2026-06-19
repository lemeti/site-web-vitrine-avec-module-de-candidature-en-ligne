-- ============================================================
-- SCRIPT SQL COMPLET - PLATEFORME IBA (Institut Universitaire
-- des Beaux-Arts, Université de Douala à Nkongsamba)
-- Année académique 2026-2027
-- Version : 1.0 | Normalisée 3NF | MySQL 8.0+
-- ============================================================

-- ============================================================
-- CREATION DE LA BASE DE DONNÉES
-- ============================================================

CREATE DATABASE IF NOT EXISTS iba_plateforme
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE iba_plateforme;

-- ============================================================
-- DÉSACTIVATION DES CLÉS ÉTRANGÈRES PENDANT LA CRÉATION
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLE : roles
-- Description : Rôles du système (admin, superadmin, scolarite)
-- ============================================================
CREATE TABLE roles (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nom             VARCHAR(50)     NOT NULL,
    description     VARCHAR(255)        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_roles         PRIMARY KEY (id),
    CONSTRAINT uq_roles_nom     UNIQUE (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Rôles du système';

-- ============================================================
-- TABLE : administrateurs
-- Description : Comptes du personnel administratif (scolarité)
-- ============================================================
CREATE TABLE administrateurs (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    role_id             INT UNSIGNED    NOT NULL,
    nom                 VARCHAR(100)    NOT NULL,
    prenom              VARCHAR(100)    NOT NULL,
    email               VARCHAR(191)    NOT NULL,
    password_hash       VARCHAR(255)    NOT NULL,
    telephone           VARCHAR(20)         NULL,
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    last_login_at       DATETIME            NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          DATETIME            NULL,
    created_by          INT UNSIGNED        NULL,
    updated_by          INT UNSIGNED        NULL,

    CONSTRAINT pk_administrateurs       PRIMARY KEY (id),
    CONSTRAINT uq_admin_email           UNIQUE (email),
    CONSTRAINT fk_admin_role            FOREIGN KEY (role_id)     REFERENCES roles(id) ON UPDATE CASCADE,
    CONSTRAINT fk_admin_created_by      FOREIGN KEY (created_by)  REFERENCES administrateurs(id) ON DELETE SET NULL,
    CONSTRAINT fk_admin_updated_by      FOREIGN KEY (updated_by)  REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_admin_email       (email),
    INDEX idx_admin_role        (role_id),
    INDEX idx_admin_deleted     (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Comptes administrateurs (service scolarité)';

-- ============================================================
-- TABLE : cycles
-- Description : Cycles d'entrée : Licence 1, Licence 3, Master
-- ============================================================
CREATE TABLE cycles (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    code        VARCHAR(20)     NOT NULL,
    libelle     VARCHAR(100)    NOT NULL,
    description TEXT                NULL,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_cycles        PRIMARY KEY (id),
    CONSTRAINT uq_cycles_code   UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Cycles d''entrée (L1, L3, Master)';

-- ============================================================
-- TABLE : filieres
-- Description : Filières de formation de l'IBA
-- ============================================================
CREATE TABLE filieres (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    code        VARCHAR(10)     NOT NULL,
    libelle     VARCHAR(200)    NOT NULL,
    description TEXT                NULL,
    debouches   TEXT                NULL,
    duree_ans   TINYINT UNSIGNED    NULL,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by  INT UNSIGNED        NULL,
    updated_by  INT UNSIGNED        NULL,

    CONSTRAINT pk_filieres          PRIMARY KEY (id),
    CONSTRAINT uq_filieres_code     UNIQUE (code),
    CONSTRAINT fk_filieres_created  FOREIGN KEY (created_by) REFERENCES administrateurs(id) ON DELETE SET NULL,
    CONSTRAINT fk_filieres_updated  FOREIGN KEY (updated_by) REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_filieres_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Filières de formation de l''IBA';

-- ============================================================
-- TABLE : cycle_filiere
-- Description : Association cycles ↔ filières (quelles filières
--               sont ouvertes à quel cycle)
-- ============================================================
CREATE TABLE cycle_filiere (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    cycle_id    INT UNSIGNED    NOT NULL,
    filiere_id  INT UNSIGNED    NOT NULL,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,

    CONSTRAINT pk_cycle_filiere         PRIMARY KEY (id),
    CONSTRAINT uq_cycle_filiere         UNIQUE (cycle_id, filiere_id),
    CONSTRAINT fk_cf_cycle              FOREIGN KEY (cycle_id)   REFERENCES cycles(id)   ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cf_filiere            FOREIGN KEY (filiere_id) REFERENCES filieres(id) ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_cf_cycle      (cycle_id),
    INDEX idx_cf_filiere    (filiere_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Associations cycles / filières disponibles';

-- ============================================================
-- TABLE : centres_composition
-- Description : Centres de composition disponibles pour le concours
-- ============================================================
CREATE TABLE centres_composition (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nom         VARCHAR(100)    NOT NULL,
    ville       VARCHAR(100)    NOT NULL,
    adresse     VARCHAR(255)        NULL,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_centres   PRIMARY KEY (id),
    CONSTRAINT uq_centre    UNIQUE (nom, ville)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Centres de composition pour les concours';

-- ============================================================
-- TABLE : diplomes_requis
-- Description : Diplômes requis par cycle pour candidater
-- ============================================================
CREATE TABLE diplomes_requis (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    cycle_id    INT UNSIGNED    NOT NULL,
    libelle     VARCHAR(200)    NOT NULL,
    description TEXT                NULL,

    CONSTRAINT pk_diplomes_requis   PRIMARY KEY (id),
    CONSTRAINT fk_dr_cycle          FOREIGN KEY (cycle_id) REFERENCES cycles(id) ON DELETE CASCADE ON UPDATE CASCADE,

    INDEX idx_dr_cycle (cycle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Diplômes requis par cycle d''entrée';

-- ============================================================
-- TABLE : types_documents
-- Description : Types de pièces justificatives exigées
-- ============================================================
CREATE TABLE types_documents (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    code            VARCHAR(50)     NOT NULL,
    libelle         VARCHAR(200)    NOT NULL,
    description     TEXT                NULL,
    formats_acceptes VARCHAR(100)   NOT NULL DEFAULT 'pdf,jpg,png',
    taille_max_mo   DECIMAL(5,2)    NOT NULL DEFAULT 5.00,
    obligatoire     TINYINT(1)      NOT NULL DEFAULT 1,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    CONSTRAINT pk_types_docs    PRIMARY KEY (id),
    CONSTRAINT uq_types_docs    UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Types de documents requis pour la candidature';

-- ============================================================
-- TABLE : types_docs_par_cycle
-- Description : Documents requis selon le cycle
-- ============================================================
CREATE TABLE types_docs_par_cycle (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    type_doc_id     INT UNSIGNED    NOT NULL,
    cycle_id        INT UNSIGNED    NOT NULL,
    obligatoire     TINYINT(1)      NOT NULL DEFAULT 1,

    CONSTRAINT pk_tdpc              PRIMARY KEY (id),
    CONSTRAINT uq_tdpc              UNIQUE (type_doc_id, cycle_id),
    CONSTRAINT fk_tdpc_type_doc     FOREIGN KEY (type_doc_id) REFERENCES types_documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_tdpc_cycle        FOREIGN KEY (cycle_id)    REFERENCES cycles(id)           ON DELETE CASCADE,

    INDEX idx_tdpc_cycle (cycle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Documents requis par cycle d''entrée';

-- ============================================================
-- TABLE : candidats
-- Description : Informations personnelles des candidats
-- ============================================================
CREATE TABLE candidats (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    -- Identité
    nom                 VARCHAR(100)        NOT NULL,
    prenom              VARCHAR(100)        NOT NULL,
    date_naissance      DATE                NOT NULL,
    lieu_naissance      VARCHAR(150)        NOT NULL,
    sexe                ENUM('M','F')       NOT NULL,
    nationalite         VARCHAR(100)        NOT NULL DEFAULT 'Camerounaise',
    -- Contact
    telephone           VARCHAR(20)         NOT NULL,
    email               VARCHAR(191)        NOT NULL,
    adresse             VARCHAR(255)            NULL,
    -- Parcours académique
    dernier_diplome     VARCHAR(200)        NOT NULL,
    etablissement       VARCHAR(255)        NOT NULL,
    annee_obtention     YEAR                    NULL,
    -- Statut fonctionnaire
    est_fonctionnaire   TINYINT(1)          NOT NULL DEFAULT 0,
    -- Audit
    created_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          DATETIME                NULL,

    CONSTRAINT pk_candidats         PRIMARY KEY (id),
    CONSTRAINT uq_candidats_email   UNIQUE (email),

    INDEX idx_candidats_nom         (nom, prenom),
    INDEX idx_candidats_email       (email),
    INDEX idx_candidats_deleted     (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Informations personnelles des candidats';

-- ============================================================
-- TABLE : sessions_concours
-- Description : Sessions académiques de concours (ex: 2026-2027)
-- ============================================================
CREATE TABLE sessions_concours (
    id                      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    annee_academique        VARCHAR(20)     NOT NULL,
    date_limite_depot       DATE            NOT NULL,
    date_concours_l1        DATE                NULL,
    date_concours_l3        DATE                NULL,
    date_concours_master    DATE                NULL,
    is_active               TINYINT(1)      NOT NULL DEFAULT 0,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              INT UNSIGNED        NULL,

    CONSTRAINT pk_sessions          PRIMARY KEY (id),
    CONSTRAINT uq_sessions_annee    UNIQUE (annee_academique),
    CONSTRAINT fk_sessions_created  FOREIGN KEY (created_by) REFERENCES administrateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Sessions de concours par année académique';

-- ============================================================
-- TABLE : candidatures
-- Description : Dossiers de candidature soumis
-- ============================================================
CREATE TABLE candidatures (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    candidat_id         INT UNSIGNED    NOT NULL,
    session_id          INT UNSIGNED    NOT NULL,
    cycle_id            INT UNSIGNED    NOT NULL,
    filiere_id          INT UNSIGNED    NOT NULL,
    centre_id           INT UNSIGNED    NOT NULL,
    -- Référence unique
    numero_dossier      VARCHAR(30)     NOT NULL,
    -- Statut du dossier
    statut              ENUM(
                            'brouillon',
                            'soumis',
                            'recu',
                            'incomplet',
                            'valide',
                            'rejete'
                        )               NOT NULL DEFAULT 'brouillon',
    -- Infos soumission
    submitted_at        DATETIME            NULL,
    -- Commentaire administrateur
    commentaire_admin   TEXT                NULL,
    traite_par          INT UNSIGNED        NULL,
    traite_le           DATETIME            NULL,
    -- Audit
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at          DATETIME            NULL,
    created_by          INT UNSIGNED        NULL,
    updated_by          INT UNSIGNED        NULL,

    CONSTRAINT pk_candidatures          PRIMARY KEY (id),
    CONSTRAINT uq_candidatures_dossier  UNIQUE (numero_dossier),
    -- Un candidat ne peut soumettre qu'une candidature par session et cycle
    CONSTRAINT uq_candidature_session   UNIQUE (candidat_id, session_id, cycle_id),
    CONSTRAINT fk_cand_candidat         FOREIGN KEY (candidat_id) REFERENCES candidats(id)             ON UPDATE CASCADE,
    CONSTRAINT fk_cand_session          FOREIGN KEY (session_id)  REFERENCES sessions_concours(id)     ON UPDATE CASCADE,
    CONSTRAINT fk_cand_cycle            FOREIGN KEY (cycle_id)    REFERENCES cycles(id)                ON UPDATE CASCADE,
    CONSTRAINT fk_cand_filiere          FOREIGN KEY (filiere_id)  REFERENCES filieres(id)              ON UPDATE CASCADE,
    CONSTRAINT fk_cand_centre           FOREIGN KEY (centre_id)   REFERENCES centres_composition(id)   ON UPDATE CASCADE,
    CONSTRAINT fk_cand_traite_par       FOREIGN KEY (traite_par)  REFERENCES administrateurs(id)       ON DELETE SET NULL,
    CONSTRAINT fk_cand_updated_by       FOREIGN KEY (updated_by)  REFERENCES administrateurs(id)       ON DELETE SET NULL,

    INDEX idx_cand_candidat     (candidat_id),
    INDEX idx_cand_session      (session_id),
    INDEX idx_cand_statut       (statut),
    INDEX idx_cand_cycle        (cycle_id),
    INDEX idx_cand_filiere      (filiere_id),
    INDEX idx_cand_centre       (centre_id),
    INDEX idx_cand_dossier      (numero_dossier),
    INDEX idx_cand_deleted      (deleted_at),
    INDEX idx_cand_submitted    (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Dossiers de candidature soumis';

-- ============================================================
-- TABLE : paiements
-- Description : Informations de paiement des frais de concours
-- ============================================================
CREATE TABLE paiements (
    id                      INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    candidature_id          INT UNSIGNED        NOT NULL,
    numero_recu             VARCHAR(100)            NULL,
    montant                 DECIMAL(10,2)       NOT NULL DEFAULT 20000.00,
    devise                  VARCHAR(10)         NOT NULL DEFAULT 'FCFA',
    statut_paiement         ENUM('en_attente','confirme','rejete')
                                                NOT NULL DEFAULT 'en_attente',
    fichier_recu_path       VARCHAR(500)            NULL,
    fichier_recu_nom        VARCHAR(255)            NULL,
    est_fonctionnaire       TINYINT(1)          NOT NULL DEFAULT 0,
    created_at              DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verifie_par             INT UNSIGNED            NULL,
    verifie_le              DATETIME                NULL,

    CONSTRAINT pk_paiements             PRIMARY KEY (id),
    CONSTRAINT uq_paiement_candidature  UNIQUE (candidature_id),
    CONSTRAINT fk_pmt_candidature       FOREIGN KEY (candidature_id) REFERENCES candidatures(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pmt_verifie_par       FOREIGN KEY (verifie_par)    REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_pmt_candidature   (candidature_id),
    INDEX idx_pmt_statut        (statut_paiement)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Paiements des frais de concours (reçu téléversé)';

-- ============================================================
-- TABLE : infos_fonctionnaire
-- Description : Informations complémentaires pour les fonctionnaires
-- ============================================================
CREATE TABLE infos_fonctionnaire (
    id                      INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    candidature_id          INT UNSIGNED    NOT NULL,
    administration          VARCHAR(255)        NULL,
    numero_matricule        VARCHAR(100)        NULL,
    -- Fichiers spécifiques fonctionnaires
    fichier_autorisation_path   VARCHAR(500)    NULL,
    fichier_autorisation_nom    VARCHAR(255)    NULL,
    fichier_arrete_path         VARCHAR(500)    NULL,
    fichier_arrete_nom          VARCHAR(255)    NULL,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_infos_fonctionnaire   PRIMARY KEY (id),
    CONSTRAINT uq_infos_fonct_cand      UNIQUE (candidature_id),
    CONSTRAINT fk_fonct_candidature     FOREIGN KEY (candidature_id) REFERENCES candidatures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Infos complémentaires candidats fonctionnaires';

-- ============================================================
-- TABLE : documents_candidature
-- Description : Pièces justificatives téléversées par le candidat
-- ============================================================
CREATE TABLE documents_candidature (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    candidature_id      INT UNSIGNED    NOT NULL,
    type_doc_id         INT UNSIGNED    NOT NULL,
    nom_fichier_original VARCHAR(255)   NOT NULL,
    nom_fichier_stocke   VARCHAR(500)   NOT NULL,
    chemin_stockage     VARCHAR(500)    NOT NULL,
    mime_type           VARCHAR(100)    NOT NULL,
    taille_octets       INT UNSIGNED    NOT NULL,
    statut_verification ENUM('en_attente','valide','rejete')
                                        NOT NULL DEFAULT 'en_attente',
    commentaire         TEXT                NULL,
    uploaded_at         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    verifie_par         INT UNSIGNED        NULL,
    verifie_le          DATETIME            NULL,
    deleted_at          DATETIME            NULL,

    CONSTRAINT pk_docs_cand         PRIMARY KEY (id),
    CONSTRAINT fk_doc_candidature   FOREIGN KEY (candidature_id) REFERENCES candidatures(id)  ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_doc_type          FOREIGN KEY (type_doc_id)    REFERENCES types_documents(id) ON UPDATE CASCADE,
    CONSTRAINT fk_doc_verifie_par   FOREIGN KEY (verifie_par)    REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_doc_candidature   (candidature_id),
    INDEX idx_doc_type          (type_doc_id),
    INDEX idx_doc_statut        (statut_verification),
    INDEX idx_doc_deleted       (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Pièces justificatives téléversées';

-- ============================================================
-- TABLE : historique_statuts
-- Description : Journal des changements de statut d'un dossier
-- ============================================================
CREATE TABLE historique_statuts (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    candidature_id      INT UNSIGNED    NOT NULL,
    statut_avant        VARCHAR(50)         NULL,
    statut_apres        VARCHAR(50)     NOT NULL,
    commentaire         TEXT                NULL,
    modifie_par         INT UNSIGNED        NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_historique        PRIMARY KEY (id),
    CONSTRAINT fk_hist_candidature  FOREIGN KEY (candidature_id) REFERENCES candidatures(id) ON DELETE CASCADE,
    CONSTRAINT fk_hist_modifie_par  FOREIGN KEY (modifie_par)    REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_hist_candidature  (candidature_id),
    INDEX idx_hist_date         (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Journal des changements de statut des dossiers';

-- ============================================================
-- TABLE : notifications
-- Description : Notifications envoyées aux candidats
-- ============================================================
CREATE TABLE notifications (
    id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    candidature_id      INT UNSIGNED    NOT NULL,
    type                ENUM('email','sms','systeme')
                                        NOT NULL DEFAULT 'email',
    sujet               VARCHAR(255)        NULL,
    contenu             TEXT            NOT NULL,
    statut_envoi        ENUM('en_attente','envoye','echec')
                                        NOT NULL DEFAULT 'en_attente',
    envoye_le           DATETIME            NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_notifications         PRIMARY KEY (id),
    CONSTRAINT fk_notif_candidature     FOREIGN KEY (candidature_id) REFERENCES candidatures(id) ON DELETE CASCADE,

    INDEX idx_notif_candidature (candidature_id),
    INDEX idx_notif_statut      (statut_envoi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Notifications envoyées aux candidats';

-- ============================================================
-- TABLE : actualites
-- Description : Actualités et annonces publiées sur le site
-- ============================================================
CREATE TABLE actualites (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    titre           VARCHAR(255)    NOT NULL,
    slug            VARCHAR(255)    NOT NULL,
    contenu         LONGTEXT        NOT NULL,
    extrait         TEXT                NULL,
    image_path      VARCHAR(500)        NULL,
    is_published    TINYINT(1)      NOT NULL DEFAULT 0,
    published_at    DATETIME            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME            NULL,
    created_by      INT UNSIGNED        NULL,
    updated_by      INT UNSIGNED        NULL,

    CONSTRAINT pk_actualites        PRIMARY KEY (id),
    CONSTRAINT uq_actualites_slug   UNIQUE (slug),
    CONSTRAINT fk_actu_created      FOREIGN KEY (created_by) REFERENCES administrateurs(id) ON DELETE SET NULL,
    CONSTRAINT fk_actu_updated      FOREIGN KEY (updated_by) REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_actu_published    (is_published, published_at),
    INDEX idx_actu_deleted      (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Actualités et annonces du site';

-- ============================================================
-- TABLE : medias_galerie
-- Description : Galerie de médias (photos, vidéos) de l'IBA
-- ============================================================
CREATE TABLE medias_galerie (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    titre           VARCHAR(255)    NOT NULL,
    description     TEXT                NULL,
    type_media      ENUM('photo','video')
                                    NOT NULL DEFAULT 'photo',
    fichier_path    VARCHAR(500)        NULL,
    url_externe     VARCHAR(500)        NULL,
    ordre           INT UNSIGNED    NOT NULL DEFAULT 0,
    is_published    TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME            NULL,
    created_by      INT UNSIGNED        NULL,

    CONSTRAINT pk_medias            PRIMARY KEY (id),
    CONSTRAINT fk_medias_created    FOREIGN KEY (created_by) REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_media_published   (is_published),
    INDEX idx_media_ordre       (ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Galerie photos et vidéos de l''IBA';

-- ============================================================
-- TABLE : faq
-- Description : Foire aux questions affichée sur le site
-- ============================================================
CREATE TABLE faq (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    question        TEXT            NOT NULL,
    reponse         TEXT            NOT NULL,
    categorie       VARCHAR(100)        NULL,
    ordre           INT UNSIGNED    NOT NULL DEFAULT 0,
    is_published    TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by      INT UNSIGNED        NULL,

    CONSTRAINT pk_faq           PRIMARY KEY (id),
    CONSTRAINT fk_faq_created   FOREIGN KEY (created_by) REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_faq_published (is_published, ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Foire aux questions';

-- ============================================================
-- TABLE : logs_activite_admin
-- Description : Journal d'activité des administrateurs (audit)
-- ============================================================
CREATE TABLE logs_activite_admin (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    admin_id        INT UNSIGNED        NULL,
    action          VARCHAR(100)    NOT NULL,
    entite          VARCHAR(100)        NULL,
    entite_id       INT UNSIGNED        NULL,
    details         JSON                NULL,
    ip_address      VARCHAR(45)         NULL,
    user_agent      VARCHAR(500)        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_logs          PRIMARY KEY (id),
    CONSTRAINT fk_logs_admin    FOREIGN KEY (admin_id) REFERENCES administrateurs(id) ON DELETE SET NULL,

    INDEX idx_logs_admin    (admin_id),
    INDEX idx_logs_action   (action),
    INDEX idx_logs_date     (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Journal d''activité des administrateurs';

-- ============================================================
-- TABLE : sessions_admin
-- Description : Sessions d'authentification des administrateurs
-- ============================================================
CREATE TABLE sessions_admin (
    id              VARCHAR(128)    NOT NULL,
    admin_id        INT UNSIGNED    NOT NULL,
    ip_address      VARCHAR(45)         NULL,
    user_agent      TEXT                NULL,
    payload         TEXT            NOT NULL,
    last_activity   INT UNSIGNED    NOT NULL,

    CONSTRAINT pk_sessions_admin    PRIMARY KEY (id),
    CONSTRAINT fk_sa_admin          FOREIGN KEY (admin_id) REFERENCES administrateurs(id) ON DELETE CASCADE,

    INDEX idx_sa_admin          (admin_id),
    INDEX idx_sa_last_activity  (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Sessions actives des administrateurs';

-- ============================================================
-- TABLE : tokens_verification
-- Description : Tokens pour confirmation e-mail, reset mot de passe
-- ============================================================
CREATE TABLE tokens_verification (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    admin_id        INT UNSIGNED        NULL,
    type            ENUM('reset_password','email_verification')
                                    NOT NULL,
    token           VARCHAR(255)    NOT NULL,
    expires_at      DATETIME        NOT NULL,
    used_at         DATETIME            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_tokens            PRIMARY KEY (id),
    CONSTRAINT uq_tokens_token      UNIQUE (token),
    CONSTRAINT fk_tokens_admin      FOREIGN KEY (admin_id) REFERENCES administrateurs(id) ON DELETE CASCADE,

    INDEX idx_tokens_token      (token),
    INDEX idx_tokens_expires    (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tokens de vérification et de réinitialisation';

-- ============================================================
-- TABLE : parametres_site
-- Description : Paramètres globaux configurables du site
-- ============================================================
CREATE TABLE parametres_site (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    cle             VARCHAR(100)    NOT NULL,
    valeur          TEXT                NULL,
    description     VARCHAR(255)        NULL,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by      INT UNSIGNED        NULL,

    CONSTRAINT pk_parametres        PRIMARY KEY (id),
    CONSTRAINT uq_parametres_cle    UNIQUE (cle),
    CONSTRAINT fk_params_updated    FOREIGN KEY (updated_by) REFERENCES administrateurs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Paramètres globaux du site (clé-valeur)';

-- ============================================================
-- RÉACTIVATION DES CLÉS ÉTRANGÈRES
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
-- DONNÉES INITIALES (SEED)
-- ============================================================

-- Rôles
INSERT INTO roles (nom, description) VALUES
('superadmin',  'Accès total au système'),
('admin',       'Administrateur scolarité standard'),
('operateur',   'Opérateur de saisie / consultation');

-- Cycles
INSERT INTO cycles (code, libelle, description, is_active) VALUES
('L1',      'Licence 1ère année',   'Entrée en première année de licence (Baccalauréat requis)',   1),
('L3',      'Licence 3ème année',   'Admission directe en troisième année de licence',              1),
('MASTER',  'Master',               'Admission en cycle Master (Licence requis)',                   1);

-- Filières
INSERT INTO filieres (code, libelle, description, is_active) VALUES
('ARU',  'Architecture et Urbanisme',                   'Formation en architecture et aménagement urbain',                  1),
('APHA', 'Arts Plastiques et Histoire de l''Art',       'Peinture, sculpture, histoire et théorie de l''art',              1),
('CAV',  'Cinéma et Audiovisuel',                       'Réalisation, montage, production audiovisuelle',                   1),
('PMU',  'Patrimoine et Muséologie',                    'Conservation, gestion du patrimoine culturel et des musées',       1),
('ET',   'Études Théâtrales',                           'Art dramatique, mise en scène, scénographie',                      1),
('AMH',  'Arts et Métiers de l''Habillement',           'Mode, stylisme, création vestimentaire',                           1),
('MC',   'Musicologie et Chorégraphie',                 'Musicologie, théorie musicale, danse et chorégraphie',             1);

-- Centres de composition
INSERT INTO centres_composition (nom, ville, is_active) VALUES
('Centre de Nkongsamba',    'Nkongsamba',   1),
('Centre de Bafoussam',     'Bafoussam',    1),
('Centre de Douala',        'Douala',       1),
('Centre de Yaoundé',       'Yaoundé',      1);

-- Session académique 2026-2027
INSERT INTO sessions_concours
    (annee_academique, date_limite_depot, date_concours_l1, date_concours_l3, date_concours_master, is_active)
VALUES
    ('2026-2027', '2026-09-08', '2026-09-10', '2026-09-11', '2026-09-12', 1);

-- Types de documents requis
INSERT INTO types_documents (code, libelle, formats_acceptes, taille_max_mo, obligatoire) VALUES
('DEMANDE_MANUSCRITE',  'Demande manuscrite timbrée',                               'pdf,jpg,png',  5.00, 1),
('FICHE_IDENTIFICATION','Fiche d''identification',                                   'pdf,jpg,png',  5.00, 1),
('ACTE_NAISSANCE',      'Copie certifiée conforme de l''acte de naissance (< 3 mois)','pdf,jpg,png', 5.00, 1),
('DIPLOMES_COPIES',     'Copies certifiées conformes des diplômes requis',           'pdf,jpg,png',  10.00, 1),
('RELEVE_PROBA_BAC',    'Relevés de notes Probatoire / GCE O-Level et Baccalauréat / GCE A-Level',
                                                                                     'pdf,jpg,png',  10.00, 1),
('CERT_MEDICAL',        'Certificat médical d''aptitude aux études universitaires',  'pdf,jpg,png',  5.00,  1),
('ENVELOPPES_TIMBREES', 'Preuve des deux enveloppes A4 timbrées à 500 FCFA',        'pdf,jpg,png',  5.00,  1),
('PHOTOS_IDENTITE',     'Cinq photos d''identité 4x4 (scan ou photo groupée)',       'jpg,png',      5.00,  1),
('RECU_PAIEMENT',       'Reçu de paiement des frais de concours (20 000 FCFA)',      'pdf,jpg,png',  5.00,  1),
('AUTORISATION_CONC',   'Autorisation à concourir (fonctionnaires uniquement)',      'pdf,jpg,png',  5.00,  0),
('ARRETE_STAGE',        'Arrêté de mise en stage (fonctionnaires concernés)',        'pdf,jpg,png',  5.00,  0);

-- Liaison cycles / filières (toutes filières disponibles pour tous les cycles)
INSERT INTO cycle_filiere (cycle_id, filiere_id)
SELECT c.id, f.id
FROM cycles c
CROSS JOIN filieres f;

-- Documents requis par cycle (les 9 premiers sont communs à tous les cycles)
INSERT INTO types_docs_par_cycle (type_doc_id, cycle_id, obligatoire)
SELECT td.id, c.id, 1
FROM types_documents td
CROSS JOIN cycles c
WHERE td.code NOT IN ('AUTORISATION_CONC', 'ARRETE_STAGE');

-- Documents fonctionnaires (optionnels par cycle)
INSERT INTO types_docs_par_cycle (type_doc_id, cycle_id, obligatoire)
SELECT td.id, c.id, 0
FROM types_documents td
CROSS JOIN cycles c
WHERE td.code IN ('AUTORISATION_CONC', 'ARRETE_STAGE');

-- Paramètres du site
INSERT INTO parametres_site (cle, valeur, description) VALUES
('site_nom',                'IBA - Institut Universitaire des Beaux-Arts',  'Nom complet de l''établissement'),
('site_sous_titre',         'Université de Douala | Nkongsamba',            'Sous-titre affiché dans l''en-tête'),
('frais_concours',          '20000',                                        'Montant des frais de concours en FCFA'),
('email_contact',           'contact@iba.univ-douala.cm',                   'Email de contact principal'),
('telephone_contact',       '',                                             'Téléphone de contact principal'),
('adresse_iba',             'Nkongsamba, Cameroun',                         'Adresse physique de l''IBA'),
('date_limite_depot',       '2026-09-08',                                   'Date limite de dépôt des dossiers'),
('candidatures_ouvertes',   '1',                                            '1 = ouvertes, 0 = fermées'),
('taille_max_fichier_mo',   '10',                                           'Taille maximale en Mo par fichier');

-- Compte superadmin par défaut
-- Mot de passe : Admin@IBA2026! (à changer impérativement en production)
-- Hash bcrypt (coût 12) — remplacer par le vrai hash généré par l'application
INSERT INTO administrateurs (role_id, nom, prenom, email, password_hash, is_active)
VALUES (
    1,
    'ADMIN',
    'Système',
    'admin@iba.univ-douala.cm',
    '$2y$12$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    1
);


-- ============================================================
-- VUES UTILES
-- ============================================================

-- Vue liste candidatures avec toutes les informations jointes
CREATE OR REPLACE VIEW v_candidatures_detail AS
SELECT
    ca.id                       AS candidature_id,
    ca.numero_dossier,
    ca.statut,
    ca.submitted_at,
    -- Candidat
    cd.nom                      AS candidat_nom,
    cd.prenom                   AS candidat_prenom,
    cd.email                    AS candidat_email,
    cd.telephone                AS candidat_telephone,
    cd.sexe,
    cd.nationalite,
    cd.est_fonctionnaire,
    -- Cycle, filière, centre
    cy.code                     AS cycle_code,
    cy.libelle                  AS cycle_libelle,
    fi.code                     AS filiere_code,
    fi.libelle                  AS filiere_libelle,
    cc.nom                      AS centre_nom,
    cc.ville                    AS centre_ville,
    -- Session
    sc.annee_academique,
    -- Paiement
    pm.statut_paiement,
    pm.numero_recu,
    -- Traitement
    CONCAT(ad.prenom, ' ', ad.nom) AS traite_par_nom,
    ca.traite_le,
    ca.commentaire_admin
FROM candidatures ca
JOIN candidats          cd ON cd.id = ca.candidat_id
JOIN sessions_concours  sc ON sc.id = ca.session_id
JOIN cycles             cy ON cy.id = ca.cycle_id
JOIN filieres           fi ON fi.id = ca.filiere_id
JOIN centres_composition cc ON cc.id = ca.centre_id
LEFT JOIN paiements     pm ON pm.candidature_id = ca.id
LEFT JOIN administrateurs ad ON ad.id = ca.traite_par
WHERE ca.deleted_at IS NULL;

-- Vue statistiques par filière et cycle
CREATE OR REPLACE VIEW v_stats_candidatures AS
SELECT
    sc.annee_academique,
    cy.code                 AS cycle,
    fi.code                 AS filiere,
    fi.libelle              AS filiere_libelle,
    cc.ville                AS centre,
    COUNT(ca.id)            AS total_candidatures,
    SUM(CASE WHEN ca.statut = 'soumis'      THEN 1 ELSE 0 END) AS soumis,
    SUM(CASE WHEN ca.statut = 'valide'      THEN 1 ELSE 0 END) AS valides,
    SUM(CASE WHEN ca.statut = 'rejete'      THEN 1 ELSE 0 END) AS rejetes,
    SUM(CASE WHEN ca.statut = 'incomplet'   THEN 1 ELSE 0 END) AS incomplets
FROM candidatures ca
JOIN sessions_concours  sc ON sc.id = ca.session_id
JOIN cycles             cy ON cy.id = ca.cycle_id
JOIN filieres           fi ON fi.id = ca.filiere_id
JOIN centres_composition cc ON cc.id = ca.centre_id
WHERE ca.deleted_at IS NULL
GROUP BY sc.annee_academique, cy.code, fi.code, fi.libelle, cc.ville;


-- ============================================================
-- PROCÉDURES STOCKÉES
-- ============================================================

DELIMITER $$

-- Génération du numéro de dossier unique
CREATE PROCEDURE sp_generer_numero_dossier(
    IN  p_annee_academique  VARCHAR(20),
    IN  p_cycle_code        VARCHAR(20),
    OUT p_numero_dossier    VARCHAR(30)
)
BEGIN
    DECLARE v_annee     CHAR(4);
    DECLARE v_sequence  INT;

    SET v_annee = LEFT(p_annee_academique, 4);

    SELECT COUNT(*) + 1
    INTO v_sequence
    FROM candidatures ca
    JOIN sessions_concours sc ON sc.id = ca.session_id
    JOIN cycles cy ON cy.id = ca.cycle_id
    WHERE sc.annee_academique = p_annee_academique
      AND cy.code = p_cycle_code;

    SET p_numero_dossier = CONCAT(
        'IBA-',
        v_annee,
        '-',
        p_cycle_code,
        '-',
        LPAD(v_sequence, 4, '0')
    );
END$$

-- Changer le statut d'une candidature et enregistrer l'historique
CREATE PROCEDURE sp_changer_statut_candidature(
    IN p_candidature_id     INT UNSIGNED,
    IN p_nouveau_statut     VARCHAR(50),
    IN p_commentaire        TEXT,
    IN p_admin_id           INT UNSIGNED
)
BEGIN
    DECLARE v_ancien_statut VARCHAR(50);

    SELECT statut INTO v_ancien_statut
    FROM candidatures
    WHERE id = p_candidature_id;

    UPDATE candidatures SET
        statut              = p_nouveau_statut,
        commentaire_admin   = p_commentaire,
        traite_par          = p_admin_id,
        traite_le           = NOW(),
        updated_at          = NOW(),
        updated_by          = p_admin_id
    WHERE id = p_candidature_id;

    INSERT INTO historique_statuts
        (candidature_id, statut_avant, statut_apres, commentaire, modifie_par)
    VALUES
        (p_candidature_id, v_ancien_statut, p_nouveau_statut, p_commentaire, p_admin_id);
END$$

DELIMITER ;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
