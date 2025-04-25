const mongoose = require('mongoose');
const User = require('./models/User');  // Assurez-vous d'importer le modèle User
const bcrypt = require('bcryptjs');

// Connexion à la base de données
mongoose.connect('mongodb+srv://takparasoulemane6:SOUL229@bibliolab.hppu7ke.mongodb.net/BiblioLab', )
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.log(err));

async function createUsers() {
  try {
    // Création d'un utilisateur standard
    const user = new User({
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@example.com",
      telephone: "0123456789",
      username: "jdupont",
      password: "password123",  // Le mot de passe sera haché
      role: "utilisateur"
    });
    
    // Création d'un administrateur
    const admin = new User({
      nom: "Martin",
      prenom: "Marie",
      email: "marie.martin@example.com",
      telephone: "0987654321",
      username: "mmartin",
      password: "admin123",  // Le mot de passe sera haché
      role: "admin"
    });
    
    // Sauvegarder les utilisateurs
    await user.save();
    await admin.save();

    console.log('Utilisateur et Admin créés avec succès');
  } catch (error) {
    console.log('Erreur lors de la création des utilisateurs', error);
  }
}

// Appel de la fonction pour créer les utilisateurs
createUsers();
