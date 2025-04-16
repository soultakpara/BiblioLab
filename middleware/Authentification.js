const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Pas de token, autorisation refusée' });
  try {
    const decoded = jwt.verify(token, 'secretkey'); // Pensez à stocker la clé dans une variable d'environnement
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalide' });
  }
};
