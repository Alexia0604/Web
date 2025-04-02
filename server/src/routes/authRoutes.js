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

module.exports = router;