// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const mongoose = require('mongoose');

// Debug middleware pentru ruta /me
router.use('/me', (req, res, next) => {
  console.log('DEBUG: /me route accessed');
  next();
});

// Rută de test pentru a verifica baza de date
router.get('/test-db', async (req, res) => {
  try {
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('MongoDB connection URL:', process.env.MONGODB_URI);
    
    const users = await User.find({}).select('_id username email role');
    console.log('All users in database:', users);
    
    res.json({
      connectionState: mongoose.connection.readyState,
      users: users
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rută de test pentru a verifica utilizatorul direct
router.get('/test-user/:id', async (req, res) => {
  try {
    console.log('Searching for user with ID:', req.params.id);
    console.log('ID type:', typeof req.params.id);
    
    // Încercăm să găsim utilizatorul folosind diferite metode
    const userById = await User.findById(req.params.id).select('-password');
    const userByIdStr = await User.findOne({ _id: req.params.id }).select('-password');
    const allUsers = await User.find({}).select('_id username role');
    
    console.log('User by findById:', userById);
    console.log('User by findOne:', userByIdStr);
    console.log('All users:', allUsers);
    
    res.json({
      userById,
      userByIdStr,
      allUsers
    });
  } catch (error) {
    console.error('Error in test-user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rută pentru înregistrare
router.post('/register', authController.register);

// Rută pentru autentificare
router.post('/login', authController.login);

// Rută pentru obținerea utilizatorului curent
router.get('/me', authMiddleware.authenticate, authController.getCurrentUser);

// Rută pentru deconectare
router.post('/logout', authController.logout);

// Rută pentru reîmprospătarea token-ului
router.post('/refresh-token', authMiddleware.authenticate, authController.refreshToken);

// Rută pentru încărcarea imaginii de profil
router.post('/upload-profile-image', 
  authMiddleware.authenticate, 
  authMiddleware.requireUser, 
  authController.uploadProfileImage
);

// Rută pentru actualizarea profilului
router.put('/profile', 
  authMiddleware.authenticate, 
  authMiddleware.requireUser, 
  authController.updateProfile
);

// Rute pentru resetarea parolei
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

module.exports = router;