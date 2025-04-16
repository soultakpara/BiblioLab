const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Récupérer tous les livres
 *     tags:
 *       - Livres
 *     responses:
 *       200:
 *         description: Liste des livres
 */
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find().populate('author');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des livres" });
  }
});

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Créer un nouveau livre
 *     tags:
 *       - Livres
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *               isbn:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       201:
 *         description: Livre créé
 *       400:
 *         description: Données invalides
 */
router.post('/', auth, async (req, res) => {
  try {
    if (!req.body.title || !req.body.author) {
      return res.status(400).json({ message: "Les champs 'title' et 'author' sont requis" });
    }
    const newBook = new Book({
      ...req.body,
      createdBy: req.user.id
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la création du livre" });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Récupérer un livre par son ID
 *     tags:
 *       - Livres
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du livre
 *     responses:
 *       200:
 *         description: Détails du livre
 *       404:
 *         description: Livre non trouvé
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération du livre" });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Mettre à jour un livre
 *     tags:
 *       - Livres
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du livre
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *               isbn:
 *                 type: string
 *               author:
 *                 type: string
 *     responses:
 *       200:
 *         description: Livre mis à jour
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Livre non trouvé
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    if (book.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé : vous n'êtes pas autorisé à modifier ce livre" });
    }
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du livre" });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Supprimer un livre
 *     tags:
 *       - Livres
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du livre
 *     responses:
 *       200:
 *         description: Livre supprimé
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Livre non trouvé
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre non trouvé" });
    if (book.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès refusé : vous n'êtes pas autorisé à supprimer ce livre" });
    }
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Livre supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de la suppression du livre" });
  }
});

module.exports = router;
