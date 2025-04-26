module.exports = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès interdit : admin requis' });
    }

    next();
  } catch (error) {
    console.error("Erreur dans isAdmin middleware :", error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
