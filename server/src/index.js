const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(morgan('dev'));

// Debug middleware pentru cookie-uri
app.use((req, res, next) => {
  console.log('Cookies received:', req.cookies);
  console.log('Request URL:', req.url);
  next();
});

// Servire fișiere statice
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/Images', express.static(path.join(__dirname, '../../client/public/Images')));

// Asigură-te că directoarele pentru încărcări există
const createUploadDirs = async () => {
  const uploadDir = path.join(__dirname, '../public/uploads/profile-images');
  const imagesDir = path.join(__dirname, '../../client/public/Images');
  
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  
  try {
    await fs.access(imagesDir);
  } catch {
    await fs.mkdir(imagesDir, { recursive: true });
  }
};

createUploadDirs().catch(console.error);

// Importare rute
const birdFavoriteRoutes = require('./routes/birdFavoriteRoutes');
const birdRoutes = require('./routes/birdRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Rute de bază
app.get('/', (req, res) => {
  res.send('API BirdHub funcționează!');
});

// Aplicare rute
app.use('/api/birds/favorites', birdFavoriteRoutes);
app.use('/api/birds', birdRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quiz', quizRoutes);

// Rută de test pentru a verifica dacă serverul răspunde
app.get('/api/test', (req, res) => {
  res.json({ message: 'Serverul funcționează!' });
});

// Gestionare erori pentru rute inexistente
app.use((req, res, next) => {
  console.log('Rută negăsită:', req.url);
  res.status(404).json({ message: 'Ruta nu a fost găsită' });
});

// Gestionare erori generale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ceva nu a mers bine!');
});

const PORT = process.env.PORT || 5000;

// Conectare la MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectat la MongoDB');
    app.listen(PORT, () => console.log(`Serverul rulează pe portul ${PORT}`));
  })
  .catch(err => {
    console.error('Eroare la conectarea la MongoDB:', err.message);
  });