const crypto = require('node:crypto');

const db = require('../db/connection');

function generateReference() {
  const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const exists = db.prepare('SELECT id FROM applications WHERE reference_number = ?');

  for (let index = 0; index < 20; index += 1) {
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const reference = `IBA-${dateKey}-${random}`;
    if (!exists.get(reference)) {
      return reference;
    }
  }

  throw new Error('Impossible de generer un numero de dossier unique.');
}

module.exports = { generateReference };
