const path = require('node:path');

const bcrypt = require('bcryptjs');
const express = require('express');

const db = require('../db/connection');
const { applicationStatuses, rootDir } = require('../config/app');
const { requireAdmin, redirectIfLoggedIn } = require('../middleware/auth');
const { getSetting, setSetting } = require('../services/settings');
const { toCsv } = require('../utils/csv');
const { slugify } = require('../utils/format');

const router = express.Router();

function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}

function getReferenceData() {
  return {
    programs: all('SELECT * FROM programs ORDER BY name'),
    cycles: all('SELECT * FROM cycles ORDER BY id'),
    centers: all('SELECT * FROM centers ORDER BY name')
  };
}

function parseFilters(query) {
  return {
    cycle_id: query.cycle_id ? Number(query.cycle_id) : null,
    program_id: query.program_id ? Number(query.program_id) : null,
    center_id: query.center_id ? Number(query.center_id) : null,
    status: query.status || '',
    search: String(query.search || '').trim()
  };
}

function applicationWhere(filters) {
  const clauses = [];
  const params = [];

  if (filters.cycle_id) {
    clauses.push('a.cycle_id = ?');
    params.push(filters.cycle_id);
  }
  if (filters.program_id) {
    clauses.push('a.program_id = ?');
    params.push(filters.program_id);
  }
  if (filters.center_id) {
    clauses.push('a.center_id = ?');
    params.push(filters.center_id);
  }
  if (filters.status) {
    clauses.push('a.status = ?');
    params.push(filters.status);
  }
  if (filters.search) {
    clauses.push(
      `(a.reference_number LIKE ? OR c.last_name LIKE ? OR c.first_name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)`
    );
    const token = `%${filters.search}%`;
    params.push(token, token, token, token, token);
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

function listApplications(filters) {
  const where = applicationWhere(filters);
  return all(
    `SELECT
      a.id, a.reference_number, a.status, a.submitted_at, a.payment_receipt_number,
      c.last_name, c.first_name, c.email, c.phone,
      cy.name AS cycle_name,
      p.name AS program_name,
      p.code AS program_code,
      ce.name AS center_name
     FROM applications a
     JOIN candidates c ON c.id = a.candidate_id
     JOIN cycles cy ON cy.id = a.cycle_id
     JOIN programs p ON p.id = a.program_id
     JOIN centers ce ON ce.id = a.center_id
     ${where.sql}
     ORDER BY a.submitted_at DESC, a.id DESC`,
    where.params
  );
}

function getApplication(id) {
  return db
    .prepare(
      `SELECT
        a.*,
        c.*,
        c.id AS candidate_id,
        cy.name AS cycle_name,
        p.name AS program_name,
        p.code AS program_code,
        ce.name AS center_name
       FROM applications a
       JOIN candidates c ON c.id = a.candidate_id
       JOIN cycles cy ON cy.id = a.cycle_id
       JOIN programs p ON p.id = a.program_id
       JOIN centers ce ON ce.id = a.center_id
       WHERE a.id = ?`
    )
    .get(id);
}

function uniqueSlug(title, currentId = null) {
  const base = slugify(title) || `actualite-${Date.now()}`;
  let slug = base;
  let index = 2;
  const exists = db.prepare('SELECT id FROM news WHERE slug = ? AND id != ?');

  while (exists.get(slug, currentId || 0)) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

router.get('/login', redirectIfLoggedIn, (_req, res) => {
  res.render('admin/login', {
    title: 'Connexion administrateur',
    active: 'login'
  });
});

router.post('/login', redirectIfLoggedIn, (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);

  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    req.session.flash = { type: 'error', message: 'Identifiants administrateur invalides.' };
    res.redirect('/admin/login');
    return;
  }

  req.session.adminId = admin.id;
  req.session.admin = {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role
  };
  req.session.flash = { type: 'success', message: `Bienvenue ${admin.name}.` };
  res.redirect(req.session.returnTo || '/admin');
  delete req.session.returnTo;
});

router.post('/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

router.use(requireAdmin);

router.get('/', (_req, res) => {
  const statusCounts = all('SELECT status, COUNT(*) AS total FROM applications GROUP BY status');
  const cycleCounts = all(
    `SELECT cy.name, COUNT(a.id) AS total
     FROM cycles cy
     LEFT JOIN applications a ON a.cycle_id = cy.id
     GROUP BY cy.id
     ORDER BY cy.id`
  );
  const latest = listApplications({}).slice(0, 6);

  res.render('admin/dashboard', {
    title: 'Tableau de bord',
    active: 'dashboard',
    totalApplications: db.prepare('SELECT COUNT(*) AS total FROM applications').get().total,
    statusCounts,
    cycleCounts,
    latest
  });
});

router.get('/candidatures', (req, res) => {
  const filters = parseFilters(req.query);
  res.render('admin/applications', {
    title: 'Candidatures',
    active: 'applications',
    filters,
    applications: listApplications(filters),
    ...getReferenceData()
  });
});

router.get('/candidatures/export.csv', (req, res) => {
  const filters = parseFilters(req.query);
  const rows = listApplications(filters);
  const csv = toCsv(rows, [
    { key: 'reference_number', label: 'Numero de dossier' },
    { key: 'last_name', label: 'Nom' },
    { key: 'first_name', label: 'Prenom' },
    { key: 'email', label: 'E-mail' },
    { key: 'phone', label: 'Telephone' },
    { key: 'cycle_name', label: 'Cycle' },
    { key: 'program_name', label: 'Filiere' },
    { key: 'center_name', label: 'Centre' },
    { key: 'status', label: 'Statut' },
    { key: 'submitted_at', label: 'Date de soumission' }
  ]);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="candidatures-iba.csv"');
  res.send(`\uFEFF${csv}`);
});

router.get('/candidatures/:id', (req, res, next) => {
  const application = getApplication(req.params.id);
  if (!application) {
    next();
    return;
  }
  const documents = all('SELECT * FROM documents WHERE application_id = ? ORDER BY id', [application.id]);
  res.render('admin/application-detail', {
    title: `Dossier ${application.reference_number}`,
    active: 'applications',
    application,
    documents
  });
});

router.post('/candidatures/:id/statut', (req, res, next) => {
  const application = getApplication(req.params.id);
  if (!application) {
    next();
    return;
  }

  const status = String(req.body.status || '');
  if (!applicationStatuses.some((item) => item.value === status)) {
    req.session.flash = { type: 'error', message: 'Statut invalide.' };
    res.redirect(`/admin/candidatures/${application.id}`);
    return;
  }

  db.prepare(
    `UPDATE applications
     SET status = ?, admin_comment = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(status, String(req.body.admin_comment || '').trim(), application.id);

  req.session.flash = { type: 'success', message: 'Statut du dossier mis a jour.' };
  res.redirect(`/admin/candidatures/${application.id}`);
});

router.get('/pieces/:documentId', (req, res, next) => {
  const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.documentId);
  if (!document) {
    next();
    return;
  }

  const absolutePath = path.join(rootDir, document.relative_path);
  res.download(absolutePath, document.original_name);
});

router.get('/actualites', (_req, res) => {
  res.render('admin/news', {
    title: 'Gestion des actualites',
    active: 'news',
    news: all('SELECT * FROM news ORDER BY published_at DESC, id DESC')
  });
});

router.get('/actualites/nouveau', (_req, res) => {
  res.render('admin/news-form', {
    title: 'Nouvelle actualite',
    active: 'news',
    item: {},
    action: '/admin/actualites/nouveau'
  });
});

router.post('/actualites/nouveau', (req, res) => {
  const title = String(req.body.title || '').trim();
  const excerpt = String(req.body.excerpt || '').trim();
  const body = String(req.body.body || '').trim();
  const publishedAt = String(req.body.published_at || new Date().toISOString().slice(0, 10));

  if (!title || !excerpt || !body) {
    req.session.flash = { type: 'error', message: 'Le titre, le resume et le contenu sont obligatoires.' };
    res.redirect('/admin/actualites/nouveau');
    return;
  }

  db.prepare(
    `INSERT INTO news (title, slug, excerpt, body, published_at, is_published)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(title, uniqueSlug(title), excerpt, body, publishedAt, req.body.is_published === 'on' ? 1 : 0);

  req.session.flash = { type: 'success', message: 'Actualite publiee.' };
  res.redirect('/admin/actualites');
});

router.get('/actualites/:id/modifier', (req, res, next) => {
  const item = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!item) {
    next();
    return;
  }
  res.render('admin/news-form', {
    title: 'Modifier une actualite',
    active: 'news',
    item,
    action: `/admin/actualites/${item.id}/modifier`
  });
});

router.post('/actualites/:id/modifier', (req, res, next) => {
  const item = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!item) {
    next();
    return;
  }

  const title = String(req.body.title || '').trim();
  const excerpt = String(req.body.excerpt || '').trim();
  const body = String(req.body.body || '').trim();
  const publishedAt = String(req.body.published_at || item.published_at);

  if (!title || !excerpt || !body) {
    req.session.flash = { type: 'error', message: 'Le titre, le resume et le contenu sont obligatoires.' };
    res.redirect(`/admin/actualites/${item.id}/modifier`);
    return;
  }

  db.prepare(
    `UPDATE news
     SET title = ?, slug = ?, excerpt = ?, body = ?, published_at = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(title, uniqueSlug(title, item.id), excerpt, body, publishedAt, req.body.is_published === 'on' ? 1 : 0, item.id);

  req.session.flash = { type: 'success', message: 'Actualite mise a jour.' };
  res.redirect('/admin/actualites');
});

router.post('/actualites/:id/supprimer', (req, res) => {
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  req.session.flash = { type: 'success', message: 'Actualite supprimee.' };
  res.redirect('/admin/actualites');
});

router.get('/parametres', (_req, res) => {
  res.render('admin/settings', {
    title: 'Parametres admissions',
    active: 'settings',
    settings: {
      application_deadline: getSetting('application_deadline'),
      admission_message: getSetting('admission_message'),
      contact_email: getSetting('contact_email'),
      contact_phone: getSetting('contact_phone'),
      contact_address: getSetting('contact_address')
    }
  });
});

router.post('/parametres', (req, res) => {
  const keys = ['application_deadline', 'admission_message', 'contact_email', 'contact_phone', 'contact_address'];
  for (const key of keys) {
    setSetting(key, String(req.body[key] || '').trim());
  }
  req.session.flash = { type: 'success', message: 'Parametres mis a jour.' };
  res.redirect('/admin/parametres');
});

router.get('/comptes', (_req, res) => {
  res.render('admin/accounts', {
    title: 'Comptes administrateurs',
    active: 'accounts',
    admins: all('SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC')
  });
});

router.post('/comptes', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = String(req.body.role || 'admin').trim();

  if (!name || !email || password.length < 8) {
    req.session.flash = { type: 'error', message: 'Nom, e-mail et mot de passe de 8 caracteres minimum requis.' };
    res.redirect('/admin/comptes');
    return;
  }

  try {
    db.prepare('INSERT INTO admins (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(
      name,
      email,
      bcrypt.hashSync(password, 12),
      role
    );
    req.session.flash = { type: 'success', message: 'Compte administrateur cree.' };
  } catch (error) {
    req.session.flash = { type: 'error', message: "Impossible de creer le compte. L'e-mail existe peut-etre deja." };
  }

  res.redirect('/admin/comptes');
});

router.post('/comptes/:id/supprimer', (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.adminId) {
    req.session.flash = { type: 'error', message: 'Vous ne pouvez pas supprimer votre propre compte.' };
  } else {
    db.prepare('DELETE FROM admins WHERE id = ?').run(id);
    req.session.flash = { type: 'success', message: 'Compte supprime.' };
  }
  res.redirect('/admin/comptes');
});

module.exports = router;
