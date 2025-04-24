const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// ✅ Autorise plusieurs origines pour les requêtes CORS


app.use(cors({
  origin: (origin, callback) => {
    // Autoriser dynamiquement toutes les origines
    callback(null, origin);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));



// ✅ Connexion à MongoDB
connectDB();

// ✅ Middleware
app.use(bodyParser.json());

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/authors', require('./routes/authors'));
app.use('/api/books', require('./routes/books'));

// ✅ Documentation Swagger
const { swaggerUi, specs } = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// ✅ Lancement du serveur
const PORT = process.env.PORT || 4045;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
