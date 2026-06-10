const { appName, academicYear, applicationStatuses } = require('../config/app');
const { getSetting } = require('../services/settings');
const { fileSize, formatDate, formatDateTime, statusLabel } = require('../utils/format');

function viewLocals(req, res, next) {
  res.locals.appName = appName;
  res.locals.academicYear = academicYear;
  res.locals.currentPath = req.path;
  res.locals.flash = req.session.flash;
  res.locals.admin = req.session.admin || null;
  res.locals.staticOnly = false;
  res.locals.statuses = applicationStatuses;
  res.locals.statusLabel = statusLabel;
  res.locals.formatDate = formatDate;
  res.locals.formatDateTime = formatDateTime;
  res.locals.fileSize = fileSize;
  res.locals.contactEmail = getSetting('contact_email', 'scolarite@iba-douala.cm');
  res.locals.contactPhone = getSetting('contact_phone', '+237 6 99 00 00 00');
  delete req.session.flash;
  next();
}

module.exports = viewLocals;
