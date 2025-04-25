const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/IsAdmin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Création des dossiers d'upload s'ils n'existent pas
const createUploadDirs = () => {
  const pdfDir = path.join(__dirname, '../uploads/pdfs');
  const imgDir = path.join(__dirname, '../uploads/images');
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
};
createUploadDirs();

// Configuration Multer pour PDF
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/pdfs');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/images');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, pdfStorage);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, imageStorage);
    } else {
      cb(new Error('Format de fichier non supporté'), false);
    }
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF et images sont autorisés'), false);
    }
  }
});

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Récupérer tous les livres
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
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
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
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
 * /api/books/upload:
 *   post:
 *     summary: Upload d'un livre avec PDF et image de couverture (admin seulement)
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - pdf
 *             properties:
 *               title:
 *                 type: string
 *               summary:
 *                 type: string
 *               isbn:
 *                 type: string
 *               author:
 *                 type: string
 *               pdf:
 *                 type: string
 *                 format: binary
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Livre avec fichiers créé
 *       400:
 *         description: Données invalides ou fichier manquant
 */
router.post('/upload', auth, isAdmin, upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, summary, isbn, author } = req.body;
    if (!title || !author || !req.files?.pdf) {
      return res.status(400).json({ message: "Champs requis manquants ou fichier PDF manquant" });
    }

    const newBook = new Book({
      title,
      summary,
      isbn,
      author,
      createdBy: req.user.id,
      pdf: req.files.pdf[0].path,
      coverImage: req.files.coverImage ? req.files.coverImage[0].path : undefined
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur lors de l'upload du livre" });
  }
});

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Récupérer un livre par son ID
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     tags: [Livres]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
