# IBA Nkongsamba - Site vitrine et candidatures en ligne

Projet realise a partir du cahier des charges : site institutionnel pour l'Institut Universitaire des Beaux-Arts de l'Universite de Douala a Nkongsamba, avec module de candidature en ligne et espace administrateur.

## Fonctionnalites

- Pages vitrines : accueil, a propos, filieres, admissions, diplomes, debouches, actualites, galerie, contact, FAQ, confidentialite.
- Formulaire de candidature avec identite, contact, cycle, filiere, centre, parcours, paiement et situation fonctionnaire.
- Upload des pieces justificatives en PDF, JPG ou PNG avec limite de taille.
- Controle de dossier incomplet et controle automatique de la date limite.
- Generation d'un numero de dossier unique.
- Recapitulatif imprimable apres soumission.
- Espace administrateur securise.
- Liste des candidatures avec filtres par cycle, filiere, centre, statut et recherche.
- Detail d'un dossier, telechargement des pieces, changement de statut et observations.
- Export CSV des candidatures.
- Gestion des actualites, des parametres d'admission et des comptes administrateurs.

## Prerequis

- Node.js 24 ou plus recent.
- npm.

Le projet utilise `node:sqlite`, la base SQLite native de Node 24. Aucun serveur MySQL n'est requis pour la demonstration locale.

## Installation

```bash
npm install
```

Optionnel : copier `.env.example` vers `.env` puis modifier `SESSION_SECRET`, `PORT` ou la date limite.

## Lancement

```bash
npm start
```

Mode developpement avec redemarrage automatique :

```bash
npm run dev
```

L'application demarre par defaut sur :

```text
http://localhost:3000
```

## Frontend statique pour Netlify

Le projet peut generer une version frontend uniquement, compatible avec Netlify :

```bash
npm run build
```

La sortie statique est generee dans :

```text
dist/
```

Cette version contient les pages vitrines, les actualites, la galerie, le contact et une page candidature de presentation. La soumission definitive des candidatures, l'espace administrateur, la base SQLite et les uploads necessitent le backend Express et ne sont pas inclus dans l'hebergement Netlify statique.

Configuration Netlify deja fournie dans `netlify.toml` :

```text
Build command: npm run build
Publish directory: dist
Node version: 24
```

Pour deployer avec Netlify CLI :

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --build
netlify deploy --prod --build
```

Pour deployer via GitHub, poussez le depot sur GitHub puis importez-le dans Netlify. Netlify utilisera automatiquement `netlify.toml`.

## Acces administrateur

Compte cree automatiquement au premier lancement :

```text
E-mail : admin@iba.local
Mot de passe : AdminIBA2026!
```

Changez ce mot de passe ou creez un autre compte depuis `Administration > Comptes` avant une utilisation reelle.

## Structure

```text
src/
  config/       Configuration metier et technique
  db/           Connexion SQLite, schema, seed
  middleware/   Authentification et variables de vues
  routes/       Routes publiques et administrateur
  services/     Parametres, references, uploads
  utils/        Formatage et export CSV
views/          Templates EJS
public/         CSS et JavaScript client
storage/        Base locale et fichiers televerses
```

## Donnees et fichiers

- Base locale : `storage/database/iba.sqlite`
- Fichiers candidats : `storage/uploads/<numero-de-dossier>/`

Ces fichiers sont ignores par Git pour eviter de versionner les donnees personnelles.

## Tests manuels recommandes

1. Ouvrir les pages vitrines principales sur desktop et mobile.
2. Soumettre une candidature complete avec fichiers PDF/JPG/PNG.
3. Verifier que le numero de dossier et le recapitulatif sont generes.
4. Se connecter a l'administration.
5. Filtrer les candidatures, ouvrir un dossier et telecharger une piece.
6. Changer le statut du dossier et ajouter une observation.
7. Exporter les candidatures en CSV.
