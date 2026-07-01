const express = require('express');
const router = express.Router();
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/api.log' })
  ]
});

// ==================== ROUTES API GÉNÉRALES ====================

// GET /api/health - Vérifier l'état du serveur
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// GET /api/info - Informations sur l'API
router.get('/info', (req, res) => {
  res.json({
    name: 'IBA Nkongsamba API',
    version: '1.0.0',
    description: 'API pour le site vitrine et le module de candidature en ligne de l\'IBA',
    endpoints: {
      candidatures: '/api/candidatures',
      contact: '/api/contact',
      health: '/api/health'
    }
  });
});

module.exports = router;