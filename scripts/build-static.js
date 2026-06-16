const fs = require('node:fs');
const path = require('node:path');

const ejs = require('ejs');

const {
  academicYear,
  admissionMessage,
  appName,
  applicationDeadline,
  centers,
  contactAddress,
  contactEmail,
  contactPhone,
  cycles,
  documentTypes,
  news,
  programs,
  uploadMaxMegaBytes
} = require('./site-data');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const viewsDir = path.join(rootDir, 'views');

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${value}T00:00:00`));
}

function isApplicationOpen(deadline) {
  if (!deadline) {
    return true;
  }

  const now = new Date();
  const limit = new Date(`${deadline}T23:59:59`);
  return now <= limit;
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
    formatDate,
    contactEmail,
    contactPhone,
    staticOnly: true,
    ...overrides
  };
}

function referenceData() {
  return {
    programs,
    cycles,
    centers
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
  cleanDist();
  copyAssets();

  const refs = referenceData();
  const deadline = applicationDeadline;

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
      uploadMaxMegaBytes,
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
      address: contactAddress
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

  console.log('Static frontend build completed.');
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
