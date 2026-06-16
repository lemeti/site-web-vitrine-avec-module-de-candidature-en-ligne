const academicYear = '2026-2027';
const applicationDeadline = '2026-09-08';

const documentTypes = [
  {
    key: 'handwritten_request',
    label: 'Demande manuscrite timbree',
    requiredFor: 'all'
  },
  {
    key: 'identification_form',
    label: "Fiche d'identification",
    requiredFor: 'all'
  },
  {
    key: 'birth_certificate',
    label: "Copie certifiee conforme de l'acte de naissance",
    requiredFor: 'all'
  },
  {
    key: 'diplomas_copy',
    label: 'Copie certifiee conforme des diplomes requis',
    requiredFor: 'all'
  },
  {
    key: 'transcripts',
    label: 'Releves de notes Probatoire/GCE O-Level et Baccalaureat/GCE A-Level',
    requiredFor: 'all'
  },
  {
    key: 'medical_certificate',
    label: "Certificat medical d'aptitude aux etudes universitaires",
    requiredFor: 'all'
  },
  {
    key: 'stamped_envelopes_proof',
    label: 'Preuve des deux enveloppes A4 timbrees a 500 FCFA',
    requiredFor: 'all'
  },
  {
    key: 'identity_photos',
    label: "Cinq photos d'identite 4x4",
    requiredFor: 'all'
  },
  {
    key: 'payment_receipt',
    label: 'Recu de paiement des frais de concours de 20 000 FCFA',
    requiredFor: 'all'
  },
  {
    key: 'civil_servant_authorization',
    label: 'Autorisation a concourir pour les fonctionnaires',
    requiredFor: 'civil_servant'
  },
  {
    key: 'training_order',
    label: 'Arrete de mise en stage pour les fonctionnaires concernes',
    requiredFor: 'civil_servant'
  }
];

const cycles = [
  { id: 1, slug: 'licence-1', name: 'Licence 1ere annee' },
  { id: 2, slug: 'licence-3', name: 'Licence 3eme annee' },
  { id: 3, slug: 'master', name: 'Master' }
];

const centers = [
  { id: 1, name: 'Nkongsamba' },
  { id: 2, name: 'Bafoussam' },
  { id: 3, name: 'Douala' },
  { id: 4, name: 'Yaounde' }
];

const programs = [
  {
    id: 1,
    code: 'ARU',
    name: 'Architecture et Urbanisme',
    description:
      "Formation orientee vers la conception architecturale, l'amenagement urbain, la representation spatiale et les enjeux contemporains des villes.",
    degrees: 'Licence, Master',
    careers: 'Architecte assistant, urbaniste junior, dessinateur projeteur, consultant en amenagement, poursuite en master specialise.'
  },
  {
    id: 2,
    code: 'APHA',
    name: "Arts Plastiques et Histoire de l'Art",
    description:
      "Parcours dedie a la creation plastique, a l'analyse des oeuvres, aux pratiques d'atelier et a la mediation artistique.",
    degrees: 'Licence, Master',
    careers: "Artiste plasticien, enseignant, critique d'art, galeriste, mediateur culturel, responsable d'atelier."
  },
  {
    id: 3,
    code: 'CAV',
    name: 'Cinema et Audiovisuel',
    description:
      "Formation aux langages cinematographiques, a l'ecriture, a la prise de vue, au montage et a la production audiovisuelle.",
    degrees: 'Licence, Master',
    careers: 'Realisateur, monteur, cadreur, assistant de production, technicien audiovisuel, createur de contenus.'
  },
  {
    id: 4,
    code: 'PMU',
    name: 'Patrimoine et Museologie',
    description:
      'Etude, conservation, valorisation et mediation du patrimoine culturel materiel et immateriel.',
    degrees: 'Licence, Master',
    careers: 'Charge de patrimoine, assistant conservateur, mediateur museal, gestionnaire de collections, consultant culturel.'
  },
  {
    id: 5,
    code: 'ET',
    name: 'Etudes Theatrales',
    description:
      "Formation aux arts de la scene, a la dramaturgie, a l'interpretation, a la mise en scene et a la gestion des projets theatrals.",
    degrees: 'Licence, Master',
    careers: 'Comedien, dramaturge, metteur en scene, animateur culturel, administrateur de compagnie.'
  },
  {
    id: 6,
    code: 'AMH',
    name: "Arts et Metiers de l'Habillement",
    description:
      'Parcours consacre au design vestimentaire, a la confection, au stylisme, aux techniques textiles et a la production de mode.',
    degrees: 'Licence, Master',
    careers: 'Styliste, modeliste, costumier, entrepreneur mode, responsable atelier, createur textile.'
  },
  {
    id: 7,
    code: 'MC',
    name: 'Musicologie et Choregraphie',
    description:
      'Formation en pratiques musicales, analyse, danse, choregraphie et valorisation des expressions performatives.',
    degrees: 'Licence, Master',
    careers: 'Musicien, choregraphe, enseignant artistique, producteur culturel, animateur de troupe.'
  }
];

const news = [
  {
    id: 1,
    title: 'Ouverture des candidatures 2026-2027',
    slug: 'ouverture-candidatures-2026-2027',
    excerpt: "Les candidatures en ligne pour l'annee academique 2026-2027 sont ouvertes.",
    body:
      "Les candidats aux cycles Licence 1ere annee, Licence 3eme annee et Master peuvent renseigner le formulaire en ligne, choisir leur filiere et leur centre de composition, puis joindre les pieces exigees.",
    published_at: '2026-06-10'
  },
  {
    id: 2,
    title: 'Calendrier des concours',
    slug: 'calendrier-concours-2026',
    excerpt: 'Les epreuves se derouleront du 10 au 12 septembre 2026 selon le cycle choisi.',
    body:
      'Licence 1ere annee : 10 septembre 2026. Licence 3eme annee : 11 septembre 2026. Master : 12 septembre 2026. Les candidats doivent verifier leur centre de composition avant la soumission definitive.',
    published_at: '2026-06-10'
  }
];

module.exports = {
  academicYear,
  appName: 'IBA Nkongsamba',
  applicationDeadline,
  admissionMessage:
    "Les admissions 2026-2027 se font par concours pour la Licence 1ere annee, la Licence 3eme annee et le Master. Le depot des dossiers est ouvert jusqu'au 08 septembre 2026.",
  contactAddress: "Institut Universitaire des Beaux-Arts, Universite de Douala a Nkongsamba",
  contactEmail: 'scolarite@iba-douala.cm',
  contactPhone: '+237 6 99 00 00 00',
  uploadMaxMegaBytes: 5,
  documentTypes,
  cycles,
  centers,
  programs,
  news
};
