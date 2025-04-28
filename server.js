const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// ✅ Autoriser CORS selon l'environnement
// 
app.use(cors());

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
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
