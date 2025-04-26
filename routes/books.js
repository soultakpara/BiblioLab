const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/IsAdmin');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Création des dossiers d'upload
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ Configuration Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);  // tout dans 'uploads/'
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = file.fieldname + '-' + Date.now() + ext;
    cb(null, basename);  // ex: pdf-171394.pdf ou coverImage-171394.jpg
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF et images sont autorisés'));
    }
  }
});

// ✅ Routes API (le reste ne change pas trop)
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
      pdf: req.files.pdf[0].path,  // fichier sauvegardé
      coverImage: req.files.coverImage ? req.files.coverImage[0].path : undefined
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur lors de l'upload du livre" });
  }
});

// ✅ Le reste de tes routes (GET, POST, PUT, DELETE) reste pareil !

module.exports = router;
