const path = require('node:path');

require('dotenv').config({ quiet: true });

const rootDir = path.resolve(__dirname, '..', '..');

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

const applicationStatuses = [
  { value: 'recu', label: 'Recu' },
  { value: 'incomplet', label: 'Incomplet' },
  { value: 'valide', label: 'Valide' },
  { value: 'rejete', label: 'Rejete' }
];

module.exports = {
  rootDir,
  appName: 'IBA Nkongsamba',
  academicYear: '2026-2027',
  port: Number(process.env.PORT || 3000),
  sessionSecret: process.env.SESSION_SECRET || 'change-me-iba-session-secret',
  databasePath: process.env.DATABASE_PATH || path.join(rootDir, 'storage', 'database', 'iba.sqlite'),
  uploadDir: process.env.UPLOAD_DIR || path.join(rootDir, 'storage', 'uploads'),
  uploadMaxFileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE || 5 * 1024 * 1024),
  defaultDeadline: process.env.APPLICATION_DEADLINE || '2026-09-08',
  documentTypes,
  applicationStatuses
};
