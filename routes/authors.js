const express = require('express');
const router = express.Router();
const Author = require('../models/Author');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Récupérer tous les auteurs
 *     tags:
 *       - Auteurs
 *     responses:
 *       200:
 *         description: Liste des auteurs
 */
router.get('/', auth, async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des auteurs" });
  }
});

/**
 * @swagger
 * /api/authors:
 *   post:
 *     summary: Créer un nouvel auteur
 *     tags:
 *       - Auteurs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: Auteur créé
 *       400:
 *         description: Données invalides
 */
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "Le champ 'name' est requis" });
    }
    const newAuthor = new Author({
      ...req.body,
      createdBy: req.user.id
    });
    await newAuthor.save();
    res.status(201).json(newAuthor);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la création de l'auteur" });
  }
});

/**
 * @swagger
 * /api/authors/{id}:
 *   get:
 *     summary: Récupérer un auteur par son ID
 *     tags:
 *       - Auteurs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'auteur
 *     responses:
 *       200:
 *         description: Détails de l'auteur
 *       404:
 *         description: Auteur non trouvé
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: "Auteur non trouvé" });
    res.json(author);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération de l'auteur" });
  }
});

/**
 * @swagger
 * /api/authors/{id}:
 *   put:
 *     summary: Mettre à jour un auteur
 *     tags:
 *       - Auteurs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'auteur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auteur mis à jour
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Auteur non trouvé
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: "Auteur non trouvé" });
    if (author.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé : vous n'êtes pas autorisé à modifier cet auteur" });
    }
    const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAuthor);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'auteur" });
  }
});

/**
 * @swagger
 * /api/authors/{id}:
 *   delete:
 *     summary: Supprimer un auteur
 *     tags:
 *       - Auteurs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'auteur
 *     responses:
 *       200:
 *         description: Auteur supprimé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Auteur non trouvé
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ message: "Auteur non trouvé" });
    if (author.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé : vous n'êtes pas autorisé à supprimer cet auteur" });
    }
    await Author.findByIdAndDelete(req.params.id);
    res.json({ message: "Auteur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la suppression de l'auteur" });
  }
});

module.exports = router;
