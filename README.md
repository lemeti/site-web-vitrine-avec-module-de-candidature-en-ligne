# IBA Nkongsamba - Site vitrine frontend

Projet frontend statique pour l'Institut Universitaire des Beaux-Arts de l'Universite de Douala a Nkongsamba, avec pages vitrines et formulaire de candidature en ligne.

## Fonctionnalites

- Pages vitrines : accueil, a propos, filieres, admissions, diplomes, debouches, actualites, galerie, contact, FAQ, confidentialite.
- Formulaire de candidature avec identite, contact, cycle, filiere, centre, parcours, paiement et situation fonctionnaire.
- Ajout des pieces justificatives en PDF, JPG ou PNG depuis le formulaire frontend.
- Controle HTML des champs obligatoires et affichage automatique de la date limite.
- Formulaires statiques compatibles avec un hebergement frontend comme Netlify.
- Actualites et donnees de reference stockees dans des fichiers JavaScript statiques.

## Prerequis

- Node.js 18 ou plus recent.
- npm.

Aucun serveur Express, aucune base de donnees et aucun stockage local de candidatures ne sont inclus.

## Installation

```bash
npm install
```

## Build frontend

Le projet peut generer une version frontend uniquement, compatible avec Netlify :

```bash
npm run build
```

La sortie statique est generee dans :

```text
dist/
```

Cette version contient uniquement des fichiers frontend statiques.

Configuration Netlify deja fournie dans `netlify.toml` :

```text
Build command: npm run build
Publish directory: dist
Node version: 18
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

## Structure

```text
scripts/
  build-static.js  Generation des pages HTML
  site-data.js     Donnees statiques du site
views/          Templates EJS
public/         CSS et JavaScript client
dist/           Sortie statique generee
```

## Tests manuels recommandes

1. Ouvrir les pages vitrines principales sur desktop et mobile.
2. Verifier le menu responsive.
3. Remplir le formulaire de candidature et verifier les champs obligatoires.
4. Verifier les pages actualites, contact, FAQ et confidentialite.
