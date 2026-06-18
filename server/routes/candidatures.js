const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload');
const { validateCandidature } = require('../middleware/validate');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/candidatures.log' })
  ]
});

// Champs de fichiers acceptés pour le formulaire de candidature
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

// ==================== ROUTES CANDIDATURES ====================

// POST /api/candidatures - Soumettre une nouvelle candidature
router.post(
  '/',
  upload.fields(fileFields),
  handleMulterError,
  validateCandidature,
  async (req, res) => {
    try {
      // Récupérer les fichiers uploadés
      const files = {};
      if (req.files) {
        for (const [fieldName, fileArray] of Object.entries(req.files)) {
          files[fieldName] = fileArray.map(f => ({
            originalName: f.originalname,
            filename: f.filename,
            size: f.size,
            mimetype: f.mimetype
          }));
        }
      }

      // Créer l'objet candidature
      const candidature = {
        ...req.validatedData,
        files,
        status: 'reçue',
        submitted_at: new Date().toISOString()
      };

      // TODO: Enregistrer dans la base de données
      logger.info('Nouvelle candidature reçue', {
        candidate: `${candidature.last_name} ${candidature.first_name}`,
        program: candidature.program_id,
        center: candidature.center_id
      });

      // TODO: Envoyer un email de confirmation au candidat
      // TODO: Envoyer une notification au service de scolarité

      res.status(201).json({
        success: true,
        message: 'Candidature soumise avec succès',
        candidature_id: Date.now(), // À remplacer par l'ID de la BDD
        status: candidature.status,
        files_count: Object.keys(files).length
      });
    } catch (error) {
      logger.error('Erreur lors de la soumission de candidature', {
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors du traitement de la candidature'
      });
    }
  }
);

// GET /api/candidatures - Lister toutes les candidatures (admin uniquement)
router.get('/', async (req, res) => {
  // TODO: Ajouter un middleware d'authentification admin
  try {
    // TODO: Récupérer depuis la base de données
    const candidatures = []; // Placeholder
    
    res.json({
      success: true,
      count: candidatures.length,
      data: candidatures
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des candidatures', {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des candidatures'
    });
  }
});

// GET /api/candidatures/:id - Voir le détail d'une candidature (admin uniquement)
router.get('/:id', async (req, res) => {
  // TODO: Ajouter un middleware d'authentification admin
  try {
    const { id } = req.params;
    
    // TODO: Récupérer depuis la base de données
    res.json({
      success: true,
      data: { id, message: 'Détail de la candidature (à implémenter avec BDD)' }
    });
  } catch (error) {
    logger.error(`Erreur lors de la récupération de la candidature ${req.params.id}`, {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de la candidature'
    });
  }
});

// PATCH /api/candidatures/:id/status - Changer le statut d'une candidature (admin uniquement)
router.patch('/:id/status', async (req, res) => {
  // TODO: Ajouter un middleware d'authentification admin
  try {
    const { status } = req.body;
    const validStatuses = ['reçue', 'en_cours', 'validée', 'refusée'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`
      });
    }
    
    // TODO: Mettre à jour dans la base de données
    logger.info(`Statut de la candidature ${req.params.id} changé en: ${status}`);
    
    res.json({
      success: true,
      message: `Statut de la candidature ${req.params.id} mis à jour`,
      new_status: status
    });
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du statut de la candidature ${req.params.id}`, {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du statut'
    });
  }
});

// DELETE /api/candidatures/:id - Supprimer une candidature (admin uniquement)
router.delete('/:id', async (req, res) => {
  // TODO: Ajouter un middleware d'authentification admin
  try {
    const { id } = req.params;
    
    // TODO: Supprimer de la base de données
    logger.info(`Candidature ${id} supprimée`);
    
    res.json({
      success: true,
      message: `Candidature ${id} supprimée avec succès`
    });
  } catch (error) {
    logger.error(`Erreur lors de la suppression de la candidature ${req.params.id}`, {
      error: error.message
    });
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la candidature'
    });
  }
});

module.exports = router;