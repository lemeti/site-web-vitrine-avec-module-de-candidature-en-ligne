# IBA Nkongsamba - Projet web

Projet web pour l'Institut Universitaire des Beaux-Arts de l'Universite de Douala a Nkongsamba.

La version actuelle contient le frontend statique. Elle sert de structure principale pour brancher ensuite un backend, une API, une base de donnees et les fonctionnalites de gestion.

## Fonctionnalites frontend actuelles

- Page d'accueil institutionnelle avec presentation de l'IBA, acces rapide aux admissions et mise en avant des filieres.
- Page de presentation de l'institut avec mission, objectifs et parties prenantes.
- Catalogue des filieres avec code, description, diplomes associes et debouches professionnels.
- Page admissions avec cycles ouverts, centres de composition, calendrier et pieces demandees.
- Formulaire de candidature en ligne avec sections identite, contact, choix de cycle, filiere, centre, parcours academique, paiement et situation fonctionnaire.
- Champs obligatoires controles cote navigateur pour guider le candidat pendant la saisie.
- Ajout de pieces justificatives au format PDF, JPG ou PNG depuis le formulaire.
- Pages diplomes et debouches pour presenter les parcours et orientations professionnelles.
- Rubrique actualites avec liste des annonces et pages detaillees.
- Galerie visuelle des domaines artistiques representes par l'institut.
- Page contact avec coordonnees et formulaire de message.
- Pages FAQ et confidentialite pour informer les candidats.
- Navigation responsive avec menu adapte aux ecrans mobiles.
- Interface frontend generee en HTML, CSS et JavaScript statiques.

## Preparation pour le backend

- Les champs du formulaire de candidature utilisent des noms stables et exploitables par une API : `last_name`, `first_name`, `cycle_id`, `program_id`, `center_id`, `payment_receipt_number`, etc.
- Les pieces justificatives ont des noms de champs fixes, ce qui facilitera leur traitement cote serveur.
- Les formulaires exposent des attributs d'integration : `data-api-endpoint` et `data-success-url`.
- Les donnees temporaires du frontend sont regroupees dans `scripts/site-data.js`, ce qui permettra de les remplacer progressivement par des donnees venant de la base.

## Branches du projet

- `main` : version stable. Elle ne doit recevoir que du code valide apres verification ou Pull Request.
- `frontend/interface-vitrine` : pages publiques, templates, styles, responsive, galerie, navigation et experience utilisateur.
- `backend/serveur-application` : serveur applicatif, validation serveur, traitement des formulaires, uploads, securite et logique metier.
- `api/candidatures-contact` : endpoints API pour candidatures, contact, actualites, filieres, centres et cycles.
- `database/schema-donnees` : schema de base de donnees, tables, migrations, donnees initiales et relations.
- `admin/espace-gestion` : espace d'administration pour consulter les candidatures, gerer les statuts, les actualites et les parametres.
- `integration/fullstack` : branche d'assemblage pour connecter frontend, backend, API et base de donnees avant fusion dans `main`.

## Utilisation des branches

Avant de commencer une tache, revenir sur `main` et recuperer la derniere version :

```bash
git checkout main
git pull origin main
```

Pour travailler sur l'interface :

```bash
git checkout frontend/interface-vitrine
git pull origin frontend/interface-vitrine
```

Pour travailler sur le serveur :

```bash
git checkout backend/serveur-application
git pull origin backend/serveur-application
```

Pour travailler sur l'API :

```bash
git checkout api/candidatures-contact
git pull origin api/candidatures-contact
```

Pour travailler sur la base de donnees :

```bash
git checkout database/schema-donnees
git pull origin database/schema-donnees
```

Pour travailler sur l'administration :

```bash
git checkout admin/espace-gestion
git pull origin admin/espace-gestion
```

Pour tester l'ensemble du projet connecte :

```bash
git checkout integration/fullstack
git pull origin integration/fullstack
```

Apres chaque modification :

```bash
git add .
git commit -m "Description courte de la tache"
git push origin nom-de-la-branche
```

Une fois la tache terminee, ouvrir une Pull Request vers `main` sur GitHub.
