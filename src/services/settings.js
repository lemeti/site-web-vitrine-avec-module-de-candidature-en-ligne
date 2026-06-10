const db = require('../db/connection');

function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row?.value ?? fallback;
}

function getSettings(keys = []) {
  const values = {};
  for (const key of keys) {
    values[key] = getSetting(key);
  }
  return values;
}

function setSetting(key, value) {
  db.prepare(
    `INSERT INTO settings (key, value, updated_at)
     VALUES (?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
  ).run(key, value);
}

module.exports = {
  getSetting,
  getSettings,
  setSetting
};
