function requireAdmin(req, res, next) {
  if (!req.session.adminId) {
    req.session.returnTo = req.originalUrl;
    req.session.flash = { type: 'error', message: 'Veuillez vous connecter pour acceder a cet espace.' };
    res.redirect('/admin/login');
    return;
  }
  next();
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session.adminId) {
    res.redirect('/admin');
    return;
  }
  next();
}

module.exports = {
  requireAdmin,
  redirectIfLoggedIn
};
