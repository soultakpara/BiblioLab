const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  bio: String,
  website: String,
  createdBy: { // Identifiant de l'utilisateur qui a créé cet auteur
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Author', AuthorSchema);
