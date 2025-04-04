// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Rută pentru înregistrare
router.post('/register', authController.register);

// Rută pentru autentificare
router.post('/login', authController.login);

// Rută pentru obținerea utilizatorului curent
router.get('/me', authMiddleware.authenticate, authMiddleware.requireUser, authController.getCurrentUser);

// Rută pentru deconectare
router.post('/logout', authController.logout);

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