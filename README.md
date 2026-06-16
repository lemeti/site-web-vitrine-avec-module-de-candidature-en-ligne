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

## Collaboration publique par fork

Le depot est public. Les contributeurs n'ont pas besoin d'etre ajoutes comme collaborateurs directs pour proposer des modifications.

La methode retenue est :

1. Le contributeur fait un fork du depot sur son compte GitHub.
2. Il clone son fork sur son ordinateur.
3. Il cree une branche de travail dans son fork.
4. Il fait ses modifications.
5. Il pousse sa branche dans son fork.
6. Il ouvre une Pull Request vers la branche adaptee du depot principal.

Lien du depot principal :

```text
https://github.com/lemeti/site-web-vitrine-avec-module-de-candidature-en-ligne
```

## Etapes pour contribuer

Sur GitHub, cliquer sur `Fork` en haut a droite du depot principal.

Cloner ensuite le fork sur son ordinateur :

```bash
git clone https://github.com/VOTRE-PSEUDO/site-web-vitrine-avec-module-de-candidature-en-ligne.git
cd site-web-vitrine-avec-module-de-candidature-en-ligne
```

Ajouter le depot principal comme source de reference :

```bash
git remote add upstream https://github.com/lemeti/site-web-vitrine-avec-module-de-candidature-en-ligne.git
git fetch upstream
```

Creer une branche de travail depuis la branche adaptee :

```bash
git checkout -b nom-de-votre-tache upstream/branche-cible
```

Exemple pour une modification frontend :

```bash
git checkout -b amelioration-menu-mobile upstream/frontend/interface-vitrine
```

Apres modification :

```bash
git add .
git commit -m "Ameliore le menu mobile"
git push origin amelioration-menu-mobile
```

Sur GitHub, ouvrir ensuite une Pull Request :

- `base repository` : `lemeti/site-web-vitrine-avec-module-de-candidature-en-ligne`
- `base branch` : la branche cible du projet
- `compare` : la branche du fork du contributeur

## Quelle branche choisir

- Pour les pages publiques, le style, le responsive, la navigation et la galerie : Pull Request vers `frontend/interface-vitrine`.
- Pour le serveur, la logique metier, les validations, la securite et les uploads : Pull Request vers `backend/serveur-application`.
- Pour les routes API, candidatures, contact, actualites, filieres, cycles et centres : Pull Request vers `api/candidatures-contact`.
- Pour le schema SQL, les migrations, les relations et les donnees initiales : Pull Request vers `database/schema-donnees`.
- Pour le tableau de bord, la gestion des candidatures, des statuts, des actualites et des parametres : Pull Request vers `admin/espace-gestion`.
- Pour connecter plusieurs parties ensemble avant validation finale : Pull Request vers `integration/fullstack`.
- Pour `main` : uniquement les versions stables deja verifiees.

## Garder son fork a jour

Avant de commencer une nouvelle tache, recuperer la derniere version du depot principal :

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

Puis creer une nouvelle branche de tache depuis la bonne branche cible.
