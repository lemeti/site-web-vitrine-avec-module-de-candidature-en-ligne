const express = require('express');
const { z } = require('zod');

const db = require('../db/connection');
const { documentTypes, uploadMaxFileSize } = require('../config/app');
const { getSetting } = require('../services/settings');
const { generateReference } = require('../services/reference');
const { applicationUpload, cleanupFiles, moveApplicationFiles } = require('../services/uploads');
const { isApplicationOpen } = require('../utils/format');

const router = express.Router();

const applicationSchema = z.object({
  last_name: z.string().trim().min(2, 'Le nom est obligatoire.'),
  first_name: z.string().trim().min(2, 'Le prenom est obligatoire.'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La date de naissance est obligatoire.'),
  birth_place: z.string().trim().min(2, 'Le lieu de naissance est obligatoire.'),
  gender: z.enum(['Femme', 'Homme', 'Autre'], 'Le sexe est obligatoire.'),
  nationality: z.string().trim().min(2, 'La nationalite est obligatoire.'),
  phone: z.string().trim().min(6, 'Le telephone est obligatoire.'),
  email: z.string().trim().email("L'adresse e-mail est invalide."),
  address: z.string().trim().min(4, "L'adresse est obligatoire."),
  cycle_id: z.coerce.number().int().positive('Veuillez choisir un cycle.'),
  program_id: z.coerce.number().int().positive('Veuillez choisir une filiere.'),
  center_id: z.coerce.number().int().positive('Veuillez choisir un centre.'),
  last_degree: z.string().trim().min(2, 'Le dernier diplome est obligatoire.'),
  school: z.string().trim().min(2, "L'etablissement d'origine est obligatoire."),
  graduation_year: z.coerce.number().int().min(1980, "L'annee est invalide.").max(2026, "L'annee est invalide."),
  payment_receipt_number: z.string().trim().min(2, 'Le numero du recu de paiement est obligatoire.'),
  civil_servant_details: z.string().trim().optional().default('')
});

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

function getHomeData() {
  return {
    programs: all('SELECT * FROM programs ORDER BY name LIMIT 4'),
    news: all('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC, id DESC LIMIT 3')
  };
}

function getApplication(reference) {
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
       WHERE a.reference_number = ?`
    )
    .get(reference);
}

function exists(table, id) {
  return Boolean(db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id));
}

function renderApplicationForm(res, options = {}) {
  const deadline = getSetting('application_deadline');
  res.status(options.status || 200).render('public/application', {
    title: 'Candidature en ligne',
    active: 'candidature',
    ...getReferenceData(),
    documentTypes,
    uploadMaxMegaBytes: Math.round(uploadMaxFileSize / (1024 * 1024)),
    deadline,
    isOpen: isApplicationOpen(deadline),
    errors: options.errors || {},
    old: options.old || {}
  });
}

function collectValidationErrors(body, files) {
  const parsed = applicationSchema.safeParse(body);
  const errors = {};

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (key && !errors[key]) {
        errors[key] = issue.message;
      }
    }
  }

  const data = parsed.success ? parsed.data : null;
  if (data) {
    if (!exists('cycles', data.cycle_id)) {
      errors.cycle_id = 'Le cycle choisi est invalide.';
    }
    if (!exists('programs', data.program_id)) {
      errors.program_id = 'La filiere choisie est invalide.';
    }
    if (!exists('centers', data.center_id)) {
      errors.center_id = 'Le centre choisi est invalide.';
    }
  }

  const isCivilServant = body.is_civil_servant === 'on';
  const requiredDocuments = documentTypes.filter(
    (item) => item.requiredFor === 'all' || (item.requiredFor === 'civil_servant' && isCivilServant)
  );

  for (const documentType of requiredDocuments) {
    if (!files?.[documentType.key]?.[0]) {
      errors[documentType.key] = 'Piece obligatoire.';
    }
  }

  if (isCivilServant && !String(body.civil_servant_details || '').trim()) {
    errors.civil_servant_details = 'Veuillez preciser votre administration ou situation.';
  }

  return {
    data,
    isCivilServant,
    errors
  };
}

router.get('/', (_req, res) => {
  res.render('public/home', {
    title: 'Accueil',
    active: 'home',
    ...getHomeData(),
    admissionMessage: getSetting('admission_message')
  });
});

router.get('/a-propos', (_req, res) => {
  res.render('public/about', {
    title: "A propos de l'IBA",
    active: 'about'
  });
});

router.get('/filieres', (_req, res) => {
  res.render('public/programs', {
    title: 'Filieres de formation',
    active: 'programs',
    programs: all('SELECT * FROM programs ORDER BY name')
  });
});

router.get('/admissions', (_req, res) => {
  res.render('public/admissions', {
    title: 'Admissions',
    active: 'admissions',
    ...getReferenceData(),
    documentTypes,
    deadline: getSetting('application_deadline'),
    admissionMessage: getSetting('admission_message')
  });
});

router.get('/candidature', (_req, res) => {
  renderApplicationForm(res);
});

router.post('/candidature', (req, res, next) => {
  applicationUpload(req, res, (uploadError) => {
    if (uploadError) {
      cleanupFiles(req.files);
      renderApplicationForm(res, {
        status: 400,
        old: req.body,
        errors: {
          form: uploadError.message || 'Erreur pendant le televersement des documents.'
        }
      });
      return;
    }

    const deadline = getSetting('application_deadline');
    if (!isApplicationOpen(deadline)) {
      cleanupFiles(req.files);
      renderApplicationForm(res, {
        status: 403,
        old: req.body,
        errors: {
          form: 'La date limite de depot des dossiers est depassee.'
        }
      });
      return;
    }

    const { data, isCivilServant, errors } = collectValidationErrors(req.body, req.files);
    if (Object.keys(errors).length > 0 || !data) {
      cleanupFiles(req.files);
      renderApplicationForm(res, {
        status: 422,
        old: req.body,
        errors
      });
      return;
    }

    let movedFiles = {};
    db.exec('BEGIN');
    try {
      const reference = generateReference();
      movedFiles = moveApplicationFiles(reference, req.files);
      const candidateResult = db
        .prepare(
          `INSERT INTO candidates (
            last_name, first_name, birth_date, birth_place, gender, nationality,
            phone, email, address, last_degree, school, graduation_year,
            is_civil_servant, civil_servant_details
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          data.last_name,
          data.first_name,
          data.birth_date,
          data.birth_place,
          data.gender,
          data.nationality,
          data.phone,
          data.email,
          data.address,
          data.last_degree,
          data.school,
          data.graduation_year,
          isCivilServant ? 1 : 0,
          data.civil_servant_details || null
        );

      const applicationResult = db
        .prepare(
          `INSERT INTO applications (
            candidate_id, cycle_id, program_id, center_id, reference_number,
            payment_receipt_number, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          candidateResult.lastInsertRowid,
          data.cycle_id,
          data.program_id,
          data.center_id,
          reference,
          data.payment_receipt_number,
          'recu'
        );

      const documentInsert = db.prepare(
        `INSERT INTO documents (
          application_id, type, label, original_name, stored_name, mime_type, size, relative_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      );

      for (const documentType of documentTypes) {
        const file = movedFiles[documentType.key];
        if (!file) {
          continue;
        }
        documentInsert.run(
          applicationResult.lastInsertRowid,
          documentType.key,
          documentType.label,
          file.originalname,
          file.storedName,
          file.mimetype,
          file.size,
          file.relativePath
        );
      }

      db.exec('COMMIT');
      res.redirect(`/candidature/${reference}`);
    } catch (error) {
      db.exec('ROLLBACK');
      cleanupFiles(req.files);
      next(error);
    }
  });
});

router.get('/candidature/:reference', (req, res, next) => {
  const application = getApplication(req.params.reference);
  if (!application) {
    next();
    return;
  }

  const documents = all('SELECT * FROM documents WHERE application_id = ? ORDER BY id', [application.id]);
  res.render('public/confirmation', {
    title: 'Confirmation de candidature',
    active: 'candidature',
    application,
    documents
  });
});

router.get('/diplomes', (_req, res) => {
  res.render('public/degrees', {
    title: 'Diplomes delivres',
    active: 'degrees',
    programs: all('SELECT * FROM programs ORDER BY name')
  });
});

router.get('/debouches', (_req, res) => {
  res.render('public/careers', {
    title: 'Debouches',
    active: 'careers',
    programs: all('SELECT * FROM programs ORDER BY name')
  });
});

router.get('/actualites', (_req, res) => {
  res.render('public/news', {
    title: 'Actualites',
    active: 'news',
    news: all('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC, id DESC')
  });
});

router.get('/actualites/:slug', (req, res, next) => {
  const item = db
    .prepare('SELECT * FROM news WHERE slug = ? AND is_published = 1')
    .get(req.params.slug);
  if (!item) {
    next();
    return;
  }
  res.render('public/news-detail', {
    title: item.title,
    active: 'news',
    item
  });
});

router.get('/galerie', (_req, res) => {
  res.render('public/gallery', {
    title: 'Galerie',
    active: 'gallery'
  });
});

router.get('/contact', (_req, res) => {
  res.render('public/contact', {
    title: 'Contacts',
    active: 'contact',
    address: getSetting('contact_address')
  });
});

router.post('/contact', (req, res) => {
  req.session.flash = {
    type: 'success',
    message: `Merci ${req.body.name || ''}. Votre message a ete prepare pour le service de la scolarite.`
  };
  res.redirect('/contact');
});

router.get('/faq', (_req, res) => {
  res.render('public/faq', {
    title: 'FAQ',
    active: 'faq'
  });
});

router.get('/confidentialite', (_req, res) => {
  res.render('public/privacy', {
    title: 'Politique de confidentialite',
    active: 'privacy'
  });
});

module.exports = router;
