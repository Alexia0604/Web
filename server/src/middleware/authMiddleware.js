// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware pentru verificarea autentificării
exports.authenticate = (req, res, next) => {
  try {
    // Opțiune 1: Obține token din cookie
    const token = req.cookies.token;
    
    // Opțiune 2: Obține token din header (pentru API calls mobile/frontend)
    const headerToken = req.header('Authorization')?.split(' ')[1];
    
    const authToken = token || headerToken;

    // Verifică dacă există token
    if (!authToken) {
      // Pentru cererea /auth/me, returnăm un răspuns specific
      if (req.path === '/me') {
        return res.status(401).json({ 
          success: false, 
          message: 'Nu sunteți autentificat' 
        });
      }
      
      // Pentru alte cereri, setăm utilizatorul ca guest
      req.user = { role: 'guest' };
      return next();
    }

    try {
      // Verifică validitatea tokenului
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      
      // Asigură-te că decoded conține toate câmpurile necesare
      if (!decoded._id || !decoded.username) {
        if (req.path === '/me') {
          return res.status(401).json({ 
            success: false, 
            message: 'Token invalid' 
          });
        }
        
        req.user = { role: 'guest' };
        return next();
      }

      req.user = {
        _id: decoded._id,
        username: decoded.username,
        role: decoded.role || 'user'
      };
      next();
    } catch (error) {
      console.error('Eroare la verificarea tokenului:', error);
      
      if (req.path === '/me') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token invalid sau expirat' 
        });
      }
      
      req.user = { role: 'guest' };
      next();
    }
  } catch (error) {
    console.error('Eroare în middleware-ul de autentificare:', error);
    
    if (req.path === '/me') {
      return res.status(500).json({ 
        success: false, 
        message: 'Eroare server' 
      });
    }
    
    req.user = { role: 'guest' };
    next();
  }
};

// Middleware pentru autorizare role user
exports.requireUser = (req, res, next) => {
  if (req.user && req.user._id && (req.user.role === 'user' || req.user.role === 'admin')) {
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