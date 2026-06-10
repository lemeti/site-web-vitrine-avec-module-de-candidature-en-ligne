const fs = require('node:fs');
const path = require('node:path');

const ejs = require('ejs');

const {
  academicYear,
  appName,
  applicationStatuses,
  documentTypes,
  rootDir,
  uploadMaxFileSize
} = require('../src/config/app');
const db = require('../src/db/connection');
const { seedDefaults } = require('../src/db/seed');
const { getSetting } = require('../src/services/settings');
const { fileSize, formatDate, formatDateTime, isApplicationOpen, statusLabel } = require('../src/utils/format');

const distDir = path.join(rootDir, 'dist');
const viewsDir = path.join(rootDir, 'views');

function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}

function cleanDist() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });
}

function copyAssets() {
  fs.cpSync(path.join(rootDir, 'public'), distDir, { recursive: true });
}

function baseLocals(routePath, overrides = {}) {
  return {
    appName,
    academicYear,
    currentPath: routePath,
    flash: null,
    admin: null,
    statuses: applicationStatuses,
    statusLabel,
    formatDate,
    formatDateTime,
    fileSize,
    contactEmail: getSetting('contact_email', 'scolarite@iba-douala.cm'),
    contactPhone: getSetting('contact_phone', '+237 6 99 00 00 00'),
    staticOnly: true,
    ...overrides
  };
}

function referenceData() {
  return {
    programs: all('SELECT * FROM programs ORDER BY name'),
    cycles: all('SELECT * FROM cycles ORDER BY id'),
    centers: all('SELECT * FROM centers ORDER BY name')
  };
}

async function render(template, outputRoute, locals) {
  const templatePath = path.join(viewsDir, template);
  const outputDir = outputRoute === '/' ? distDir : path.join(distDir, outputRoute);
  const outputPath = path.join(outputDir, 'index.html');

  fs.mkdirSync(outputDir, { recursive: true });
  const html = await ejs.renderFile(templatePath, locals, {
    async: false,
    root: viewsDir
  });
  fs.writeFileSync(outputPath, html);
  console.log(`Generated ${path.relative(rootDir, outputPath)}`);
}

async function renderFile(template, outputFile, locals) {
  const templatePath = path.join(viewsDir, template);
  const outputPath = path.join(distDir, outputFile);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const html = await ejs.renderFile(templatePath, locals, {
    async: false,
    root: viewsDir
  });
  fs.writeFileSync(outputPath, html);
  console.log(`Generated ${path.relative(rootDir, outputPath)}`);
}

async function build() {
  seedDefaults();
  cleanDist();
  copyAssets();

  const refs = referenceData();
  const programs = refs.programs;
  const news = all('SELECT * FROM news WHERE is_published = 1 ORDER BY published_at DESC, id DESC');
  const deadline = getSetting('application_deadline');
  const admissionMessage = getSetting('admission_message');

  await render(
    'public/home.ejs',
    '/',
    baseLocals('/', {
      title: 'Accueil',
      active: 'home',
      programs: programs.slice(0, 4),
      news: news.slice(0, 3),
      admissionMessage
    })
  );

  await render(
    'public/about.ejs',
    'a-propos',
    baseLocals('/a-propos', {
      title: "A propos de l'IBA",
      active: 'about'
    })
  );

  await render(
    'public/programs.ejs',
    'filieres',
    baseLocals('/filieres', {
      title: 'Filieres de formation',
      active: 'programs',
      programs
    })
  );

  await render(
    'public/admissions.ejs',
    'admissions',
    baseLocals('/admissions', {
      title: 'Admissions',
      active: 'admissions',
      ...refs,
      documentTypes,
      deadline,
      admissionMessage
    })
  );

  await render(
    'public/application.ejs',
    'candidature',
    baseLocals('/candidature', {
      title: 'Candidature en ligne',
      active: 'candidature',
      ...refs,
      documentTypes,
      uploadMaxMegaBytes: Math.round(uploadMaxFileSize / (1024 * 1024)),
      deadline,
      isOpen: isApplicationOpen(deadline),
      errors: {},
      old: {}
    })
  );

  await render(
    'public/degrees.ejs',
    'diplomes',
    baseLocals('/diplomes', {
      title: 'Diplomes delivres',
      active: 'degrees',
      programs
    })
  );

  await render(
    'public/careers.ejs',
    'debouches',
    baseLocals('/debouches', {
      title: 'Debouches',
      active: 'careers',
      programs
    })
  );

  await render(
    'public/news.ejs',
    'actualites',
    baseLocals('/actualites', {
      title: 'Actualites',
      active: 'news',
      news
    })
  );

  for (const item of news) {
    await render(
      'public/news-detail.ejs',
      `actualites/${item.slug}`,
      baseLocals(`/actualites/${item.slug}`, {
        title: item.title,
        active: 'news',
        item
      })
    );
  }

  await render(
    'public/gallery.ejs',
    'galerie',
    baseLocals('/galerie', {
      title: 'Galerie',
      active: 'gallery'
    })
  );

  await render(
    'public/contact.ejs',
    'contact',
    baseLocals('/contact', {
      title: 'Contacts',
      active: 'contact',
      address: getSetting('contact_address')
    })
  );

  await render(
    'public/thanks.ejs',
    'merci',
    baseLocals('/merci', {
      title: 'Merci',
      active: 'contact'
    })
  );

  await render(
    'public/faq.ejs',
    'faq',
    baseLocals('/faq', {
      title: 'FAQ',
      active: 'faq'
    })
  );

  await render(
    'public/privacy.ejs',
    'confidentialite',
    baseLocals('/confidentialite', {
      title: 'Politique de confidentialite',
      active: 'privacy'
    })
  );

  await renderFile(
    'errors/404.ejs',
    '404.html',
    baseLocals('/404.html', {
      title: 'Page introuvable',
      active: ''
    })
  );

  console.log('Static Netlify build completed.');
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
