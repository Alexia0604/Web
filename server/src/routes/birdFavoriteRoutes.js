// routes/birdFavoriteRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const favoriteController = require('../controllers/favoriteController');

// Toate rutele necesită autentificare
router.use(authMiddleware.authenticate);

// Obține toate păsările favorite ale utilizatorului
router.get('/', authMiddleware.requireUser, favoriteController.getFavorites);

// Adaugă o pasăre la favorite
router.post('/', authMiddleware.requireUser, favoriteController.addFavorite);

// Șterge o pasăre din favorite
router.delete('/:birdId', authMiddleware.requireUser, favoriteController.removeFavorite);

// Verifică dacă o pasăre este în lista de favorite
router.get('/:birdId', authMiddleware.requireUser, favoriteController.checkFavorite);

module.exports = router;