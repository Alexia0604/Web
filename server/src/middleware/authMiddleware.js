// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    console.log('Cookies received in middleware:', req.cookies);
    const token = req.cookies.token;
    
    if (!token) {
      console.log('No token found in cookies');
      return res.status(401).json({
        success: false,
        message: 'Nu sunteți autentificat',
      });
    }
    
    console.log('Verifying token:', token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully. User:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Sesiune invalidă sau expirată',
    });
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