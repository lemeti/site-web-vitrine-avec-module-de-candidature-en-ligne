const express = require('express');
const router = express.Router();
const { validateContact } = require('../middleware/validate');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/contact.log' })
  ]
});

// ==================== ROUTES CONTACT ====================

// POST /api/contact - Envoyer un message via le formulaire de contact
router.post('/', validateContact, async (req, res) => {
  try {
    const { name, email, message } = req.validatedData;

    // TODO: Enregistrer dans la base de données
    logger.info('Nouveau message de contact reçu', { name, email });

    // TODO: Envoyer un email au service de scolarité
    // TODO: Envoyer un email de confirmation au candidat

    res.status(200).json({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
    });
  } catch (error) {
    logger.error('Erreur lors de l\'envoi du message de contact', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi du message'
    });
  }
});

module.exports = router;