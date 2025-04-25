const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Enregistrement d'un nouvel utilisateur
 *     description: Seuls les utilisateurs standards peuvent s’enregistrer via cette route. Le rôle 'admin' est ignoré même s’il est fourni.
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - prenom
 *               - email
 *               - telephone
 *               - username
 *               - password
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Erreur lors de la création
 */
router.post('/register', async (req, res) => {
  const { nom, prenom, email, telephone, username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Utilisateur existe déjà' });
    }

    // Tous les utilisateurs enregistrés via cette route sont par défaut des "utilisateur"
    user = new User({
      nom,
      prenom,
      email,
      telephone,
      username,
      password,
      role: 'utilisateur'
    });

    await user.save();
    res.status(201).json({ msg: 'Utilisateur créé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Retourne un JWT contenant l’ID utilisateur et son rôle (admin ou utilisateur).
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT avec ID utilisateur et rôle
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Identifiants invalides
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Identifiants invalides' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Identifiants invalides' });
    }

    const payload = {
      id: user.id,
      role: user.role
    };

    jwt.sign(payload, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
