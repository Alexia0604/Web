// controllers/favoriteController.js
const User = require('../models/User');
const Bird = require('../models/Bird');
const mongoose = require('mongoose');

// Obține toate păsările favorite ale utilizatorului curent
exports.getFavorites = async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este autentificat
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ message: 'Utilizatorul trebuie să fie autentificat' });
    }

    // Obținem utilizatorul cu lista de favorite populată
    const user = await User.findById(req.user._id).populate('favorites');
    
    // Dacă nu există utilizator
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    // Returnăm lista de păsări favorite
    res.json(user.favorites || []);
  } catch (error) {
    console.error('Eroare la obținerea păsărilor favorite:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Adaugă o pasăre la lista de favorite
exports.addFavorite = async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este autentificat
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ message: 'Utilizatorul trebuie să fie autentificat' });
    }

    // Verificăm dacă birdId a fost furnizat
    const { birdId } = req.body;
    if (!birdId) {
      return res.status(400).json({ message: 'ID-ul păsării este necesar' });
    }

    // Verificăm dacă pasărea există
    const bird = await Bird.findById(birdId);
    if (!bird) {
      return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
    }

    // Obținem utilizatorul
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    // Verificăm dacă pasărea este deja în favorite
    if (user.favorites.includes(birdId)) {
      return res.status(400).json({ message: 'Pasărea este deja în lista de favorite' });
    }

    // Adăugăm pasărea la favorite
    user.favorites.push(birdId);
    await user.save();

    res.status(201).json({ message: 'Pasăre adăugată la favorite', birdId });
  } catch (error) {
    console.error('Eroare la adăugarea păsării la favorite:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Șterge o pasăre din lista de favorite
exports.removeFavorite = async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este autentificat
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ message: 'Utilizatorul trebuie să fie autentificat' });
    }

    // Obținem ID-ul păsării din parametrii
    const { birdId } = req.params;
    if (!birdId) {
      return res.status(400).json({ message: 'ID-ul păsării este necesar' });
    }

    // Verificăm dacă ID-ul este valid
    if (!mongoose.Types.ObjectId.isValid(birdId)) {
      return res.status(400).json({ message: 'ID păsăre invalid' });
    }

    // Obținem utilizatorul
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    // Verificăm dacă pasărea este în favorite
    if (!user.favorites.includes(birdId)) {
      return res.status(400).json({ message: 'Pasărea nu este în lista de favorite' });
    }

    // Eliminăm pasărea din favorite
    user.favorites = user.favorites.filter(id => id.toString() !== birdId);
    await user.save();

    res.json({ message: 'Pasăre eliminată din favorite', birdId });
  } catch (error) {
    console.error('Eroare la eliminarea păsării din favorite:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};


// Verifică dacă o pasăre este în lista de favorite
exports.checkFavorite = async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este autentificat
    if (!req.user || req.user.role === 'guest') {
      return res.status(401).json({ message: 'Utilizatorul trebuie să fie autentificat' });
    }

    // Obținem ID-ul păsării din parametrii
    const { birdId } = req.params;
    if (!birdId) {
      return res.status(400).json({ message: 'ID-ul păsării este necesar' });
    }

    // Obținem utilizatorul
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    // Verificăm dacă pasărea este în favorite
    const isFavorite = user.favorites.includes(birdId);

    res.json({ isFavorite });
  } catch (error) {
    console.error('Eroare la verificarea favorit:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};