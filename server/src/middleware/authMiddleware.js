// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware pentru verificarea autentificării
exports.authenticate = (req, res, next) => {
  // Opțiune 1: Obține token din cookie
  const token = req.cookies.token;
  
  // Opțiune 2: Obține token din header (pentru API calls mobile/frontend)
  const headerToken = req.header('Authorization')?.split(' ')[1];
  
  const authToken = token || headerToken;

  // Verifică dacă există token
  if (!authToken) {
    // Fără token = utilizator guest
    req.user = { role: 'guest' };
    return next();
  }

  try {
    // Verifică validitatea tokenului
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Token invalid = utilizator guest
    req.user = { role: 'guest' };
    next();
  }
};

// Middleware pentru autorizare role user
exports.requireUser = (req, res, next) => {
  if (req.user && (req.user.role === 'user' || req.user.role === 'admin')) {
    return next();
  }
  return res.status(403).json({ message: 'Acces interzis. Trebuie să fiți autentificat.' });
};

// Middleware pentru autorizare role admin
exports.requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Acces interzis. Necesită drepturi de administrator.' });
};