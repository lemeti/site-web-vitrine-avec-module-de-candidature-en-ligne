require('dotenv').config();

// Configuration de la base de données (sera activée quand la BDD sera prête)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'iba_nkongsamba',
  user: process.env.DB_USER || 'iba_user',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production'
};

// Fonction pour tester la connexion (à activer quand la BDD sera configurée)
async function testConnection() {
  try {
    // TODO: Importer le client DB et tester
    console.log('Configuration DB prête (connexion à activer plus tard)');
    return true;
  } catch (error) {
    console.error('Erreur de connexion DB:', error.message);
    return false;
  }
}

module.exports = { dbConfig, testConnection };