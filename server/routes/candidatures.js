const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload');
const { validateCandidature } = require('../middleware/validate');
const prisma = require('../db'); // 🆕 On importe la base de données
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/candidatures.log' }),
    new winston.transports.Console()
  ]
});

const fileFields = [
  { name: 'handwritten_request', maxCount: 1 },
  { name: 'identification_form', maxCount: 1 },
  { name: 'birth_certificate', maxCount: 1 },
  { name: 'diplomas_copy', maxCount: 1 },
  { name: 'transcripts', maxCount: 1 },
  { name: 'medical_certificate', maxCount: 1 },
  { name: 'stamped_envelopes_proof', maxCount: 1 },
  { name: 'identity_photos', maxCount: 5 },
  { name: 'payment_receipt', maxCount: 1 },
  { name: 'civil_servant_authorization', maxCount: 1 },
  { name: 'training_order', maxCount: 1 }
];

// POST /api/candidatures
router.post('/', upload.fields(fileFields), handleMulterError, validateCandidature, async (req, res) => {
  try {
    // 1. Préparer les infos des fichiers uploadés
    const files = {};
    if (req.files) {
      for (const [fieldName, fileArray] of Object.entries(req.files)) {
        files[fieldName] = fileArray.map(f => f.filename);
      }
    }

    // 2. Créer la candidature dans la Base de Données (Prisma)
    const savedCandidature = await prisma.candidature.create({
      data: {
        last_name: req.validatedData.last_name,
        first_name: req.validatedData.first_name,
        birth_date: req.validatedData.birth_date,
        birth_place: req.validatedData.birth_place,
        gender: req.validatedData.gender,
        nationality: req.validatedData.nationality,
        email: req.validatedData.email,
        phone: req.validatedData.phone,
        address: req.validatedData.address,
        cycle_id: req.validatedData.cycle_id,
        program_id: req.validatedData.program_id,
        center_id: req.validatedData.center_id,
        // ⚠️ Mapping spécial : Le formulaire envoie 'payment_receipt_number', la BDD attend 'receipt_number'
        receipt_number: req.validatedData.payment_receipt_number, 
        last_degree: req.validatedData.last_degree,
        school: req.validatedData.school,
        graduation_year: req.validatedData.graduation_year,
        is_civil_servant: req.validatedData.is_civil_servant || false,
        civil_servant_details: req.validatedData.civil_servant_details || null,
        files: JSON.stringify(files), // On stocke la liste des fichiers en texte
        status: 'reçue'
      }
    });

    logger.info('✅ Candidature sauvegardée en BDD', { id: savedCandidature.id });

    // 3. Répondre au client
    res.status(201).json({
      success: true,
      message: 'Candidature soumise avec succès',
      candidature_id: savedCandidature.id,
      status: savedCandidature.status
    });

  } catch (error) {
    logger.error('❌ Erreur lors de la sauvegarde', { error: error.message });
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de l\'enregistrement de la candidature.' 
    });
  }
});

// GET /api/candidatures
router.get('/', async (req, res) => {
  try {
    const candidatures = await prisma.candidature.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, count: candidatures.length, data: candidatures });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;