// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generare token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Înregistrare utilizator
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificare dacă utilizatorul există deja
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'Utilizatorul există deja' });
    }

    // Creare utilizator nou (implicit cu rol 'user')
    user = new User({ username, email, password });
    await user.save();

    // Generare token
    const token = generateToken(user);

    // Trimitere token în cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    });

    // Răspuns cu date utilizator (fără parolă)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Autentificare utilizator
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Căutare utilizator după email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credențiale invalide' });
    }

    // Verificare parolă
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credențiale invalide' });
    }

    // Generare token
    const token = generateToken(user);

    // Trimitere token în cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    });

    // Răspuns cu date utilizator (fără parolă)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({ user: userResponse, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Verificare stare autentificare
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Deconectare utilizator
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Deconectat cu succes' });
};