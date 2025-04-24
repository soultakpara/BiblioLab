const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Pas de token, autorisation refusée' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey'); // utilisation d'une variable d'environnement
    req.user = decoded.user; // on suppose que decoded.user contient { id, role }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalide' });
  }
};
