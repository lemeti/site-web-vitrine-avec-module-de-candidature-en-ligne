require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const winston = require('winston');

const candidatureRoutes = require('./routes/candidatures');
const contactRoutes = require('./routes/contact');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Création des dossiers nécessaires
const requiredDirs = ['uploads', 'logs'];
requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      connectSrc: ["'self'"],
      formAction: ["'self'"]
    }
  }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend généré)
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes API
app.use('/api/candidatures', candidatureRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', apiRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, '..', 'dist', '404.html'));
  } else {
    res.status(404).json({ error: 'Route non trouvée' });
  }
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  logger.error('Erreur serveur:', { error: err.message, stack: err.stack });
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Requête malformée' });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erreur interne du serveur' 
      : err.message
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  logger.info(`🚀 Serveur IBA démarré sur http://localhost:${PORT}`);
  logger.info(`📁 Environnement: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API disponible sur http://localhost:${PORT}/api`);
});

module.exports = app;