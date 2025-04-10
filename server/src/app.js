const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const NotificationHandler = require('./socket/notificationHandler');
const config = require('./config/config');

// Import routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const forumRoutes = require('./routes/forumRoutes');

const app = express();
const server = http.createServer(app);

// Configurare Socket.IO
const io = socketIo(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Inițializare handler notificări
const notificationHandler = new NotificationHandler(io);
notificationHandler.initialize();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Adăugăm notificationHandler la req pentru a-l putea folosi în route-uri
app.use((req, res, next) => {
  req.notificationHandler = notificationHandler;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/forum', forumRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Eroare internă server', error: err.message });
});

// Conectare la MongoDB
mongoose.connect(config.mongoUri)
  .then(() => console.log('Conectat la MongoDB'))
  .catch(err => console.error('Eroare conectare MongoDB:', err));

// Export pentru a putea fi folosit în index.js
module.exports = { app, server }; 