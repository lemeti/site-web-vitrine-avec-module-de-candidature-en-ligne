const bcrypt = require('bcryptjs');

const db = require('./connection');
const { migrate } = require('./schema');
const { defaultDeadline } = require('../config/app');

const cycles = [
  ['licence-1', 'Licence 1ere annee'],
  ['licence-3', 'Licence 3eme annee'],
  ['master', 'Master']
];

const centers = ['Nkongsamba', 'Bafoussam', 'Douala', 'Yaounde'];

const programs = [
  [
    'ARU',
    'Architecture et Urbanisme',
    "Formation orientee vers la conception architecturale, l'amenagement urbain, la representation spatiale et les enjeux contemporains des villes.",
    'Licence, Master',
    'Architecte assistant, urbaniste junior, dessinateur projeteur, consultant en amenagement, poursuite en master specialise.'
  ],
  [
    'APHA',
    "Arts Plastiques et Histoire de l'Art",
    "Parcours dedie a la creation plastique, a l'analyse des oeuvres, aux pratiques d'atelier et a la mediation artistique.",
    'Licence, Master',
    "Artiste plasticien, enseignant, critique d'art, galeriste, mediateur culturel, responsable d'atelier."
  ],
  [
    'CAV',
    'Cinema et Audiovisuel',
    "Formation aux langages cinematographiques, a l'ecriture, a la prise de vue, au montage et a la production audiovisuelle.",
    'Licence, Master',
    'Realisateur, monteur, cadreur, assistant de production, technicien audiovisuel, createur de contenus.'
  ],
  [
    'PMU',
    'Patrimoine et Museologie',
    "Etude, conservation, valorisation et mediation du patrimoine culturel materiel et immateriel.",
    'Licence, Master',
    'Charge de patrimoine, assistant conservateur, mediateur museal, gestionnaire de collections, consultant culturel.'
  ],
  [
    'ET',
    'Etudes Theatrales',
    "Formation aux arts de la scene, a la dramaturgie, a l'interpretation, a la mise en scene et a la gestion des projets theatrals.",
    'Licence, Master',
    'Comedien, dramaturge, metteur en scene, animateur culturel, administrateur de compagnie.'
  ],
  [
    'AMH',
    "Arts et Metiers de l'Habillement",
    'Parcours consacre au design vestimentaire, a la confection, au stylisme, aux techniques textiles et a la production de mode.',
    'Licence, Master',
    'Styliste, modeliste, costumier, entrepreneur mode, responsable atelier, createur textile.'
  ],
  [
    'MC',
    'Musicologie et Choregraphie',
    "Formation en pratiques musicales, analyse, danse, choregraphie et valorisation des expressions performatives.",
    'Licence, Master',
    'Musicien, choregraphe, enseignant artistique, producteur culturel, animateur de troupe.'
  ]
];

const settings = [
  ['application_deadline', defaultDeadline],
  [
    'admission_message',
    "Les admissions 2026-2027 se font par concours pour la Licence 1ere annee, la Licence 3eme annee et le Master. Le depot des dossiers est ouvert jusqu'au 08 septembre 2026."
  ],
  ['contact_email', 'scolarite@iba-douala.cm'],
  ['contact_phone', '+237 6 99 00 00 00'],
  ['contact_address', "Institut Universitaire des Beaux-Arts, Universite de Douala a Nkongsamba"]
];

const news = [
  [
    'Ouverture des candidatures 2026-2027',
    'ouverture-candidatures-2026-2027',
    "Les candidatures en ligne pour l'annee academique 2026-2027 sont ouvertes.",
    "Les candidats aux cycles Licence 1ere annee, Licence 3eme annee et Master peuvent desormais renseigner le formulaire en ligne, choisir leur filiere et leur centre de composition, puis televerser les pieces exigees.",
    '2026-06-10'
  ],
  [
    'Calendrier des concours',
    'calendrier-concours-2026',
    'Les epreuves se derouleront du 10 au 12 septembre 2026 selon le cycle choisi.',
    'Licence 1ere annee : 10 septembre 2026. Licence 3eme annee : 11 septembre 2026. Master : 12 septembre 2026. Les candidats doivent verifier leur centre de composition avant la soumission definitive.',
    '2026-06-10'
  ]
];

function insertMissing(table, uniqueColumn, values, sql, uniqueIndex = 0) {
  const exists = db.prepare(`SELECT 1 FROM ${table} WHERE ${uniqueColumn} = ?`);
  const insert = db.prepare(sql);
  for (const row of values) {
    if (!exists.get(row[uniqueIndex])) {
      insert.run(...row);
    }
  }
}

function seedDefaults() {
  migrate();

  insertMissing('cycles', 'slug', cycles, 'INSERT INTO cycles (slug, name) VALUES (?, ?)');
  insertMissing('centers', 'name', centers.map((name) => [name]), 'INSERT INTO centers (name) VALUES (?)');
  insertMissing(
    'programs',
    'code',
    programs,
    'INSERT INTO programs (code, name, description, degrees, careers) VALUES (?, ?, ?, ?, ?)'
  );
  insertMissing('settings', 'key', settings, 'INSERT INTO settings (key, value) VALUES (?, ?)');
  insertMissing(
    'news',
    'slug',
    news,
    'INSERT INTO news (title, slug, excerpt, body, published_at) VALUES (?, ?, ?, ?, ?)',
    1
  );

  const adminExists = db.prepare('SELECT id FROM admins WHERE email = ?').get('admin@iba.local');
  if (!adminExists) {
    const passwordHash = bcrypt.hashSync('AdminIBA2026!', 12);
    db.prepare('INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
      'Administrateur IBA',
      'admin@iba.local',
      passwordHash,
      'super_admin'
    );
  }
}

if (require.main === module) {
  seedDefaults();
  console.log('Base de donnees initialisee.');
  console.log('Compte admin par defaut : admin@iba.local / AdminIBA2026!');
}

module.exports = {
  seedDefaults
};
