const path = require('node:path');

const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const methodOverride = require('method-override');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

const { appName, port, rootDir, sessionSecret } = require('./config/app');
const { seedDefaults } = require('./db/seed');
const viewLocals = require('./middleware/viewLocals');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

seedDefaults();

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(rootDir, 'views'));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        objectSrc: ["'none'"]
      }
    }
  })
);
app.use(compression());
app.use(express.static(path.join(rootDir, 'public'), { maxAge: '1d' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(methodOverride('_method'));
app.use(
  session({
    name: 'iba.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);
app.use(viewLocals);

app.use(
  '/admin/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

app.use((_req, res) => {
  res.status(404).render('errors/404', {
    title: 'Page introuvable',
    active: ''
  });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).render('errors/500', {
    title: 'Erreur serveur',
    active: '',
    message: process.env.NODE_ENV === 'production' ? null : error.message
  });
});

app.listen(port, () => {
  console.log(`${appName} demarre sur http://localhost:${port}`);
});
