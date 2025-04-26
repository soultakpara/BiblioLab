const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Pas de token, autorisation refusée' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    // Correction ici :
    req.user = decoded; // directement decoded et PAS decoded.user

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token invalide' });
  }
};
