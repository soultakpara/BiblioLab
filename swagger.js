const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BiblioLab API",
      version: "1.0.0",
      description: "API pour la gestion de livres et auteurs",
    },
    servers: [
      {
        url: "http://localhost:4045"
      },
      {
        url: "https://bibliolab.onrender.com"
      }

    ]
  },
  apis: ["./routes/*.js"]
};

const specs = swaggerJsDoc(options);

module.exports = { swaggerUi, specs };
