const authRoutes = require('./routes/auth');


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://bisafcameroun.vercel.app';
const LOCAL_ORIGINS = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8000'];
const ALLOWED_ORIGINS = Array.from(new Set([FRONTEND_URL, ...LOCAL_ORIGINS]));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
const port = process.env.PORT || 8000; // Dynamically handle the port for Vercel
const API_BASE_URL = process.env.API_BASE_URL || 'https://api-bisaf.vercel.app';

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BISAF API',
      version: '1.0.0',
      description: 'Documentation de l\'API BISAF',
    },
    servers: [
      { url: API_BASE_URL }
    ],
  },
  apis: ['./routes/*.js'],
};
try {
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  // Ensure Swagger UI static files are served correctly
  const path = require('path');

  // Serve Swagger UI static files
  app.use('/swagger-static', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));

  // Update Swagger setup to use custom paths
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customJs: [
      '/swagger-static/swagger-ui-bundle.js',
      '/swagger-static/swagger-ui-standalone-preset.js'
    ],
    customCssUrl: '/swagger-static/swagger-ui.css'
  }));
} catch (error) {
  console.error('Swagger generation error:', error.message);
}

// Connexion à MongoDB
connectDB();

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.static('public'));

// Import des routes
const newsletterRoutes = require('./routes/newsletter');
const photosRoutes = require('./routes/photos');
const videosRoutes = require('./routes/videos');
const blogRoutes = require('./routes/blog');
const offresEmploiRoutes = require('./routes/offresEmploi');
const contactRoutes = require('./routes/contact');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/offres-emploi', offresEmploiRoutes);
app.use('/api/contact', contactRoutes);


app.get('/', (req, res) => {
  res.send('Hello BISAF API! Documentation disponible sur /api-docs');
});

// Middleware pour gérer les erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
  console.log(`Server running on ${API_BASE_URL}`);
});