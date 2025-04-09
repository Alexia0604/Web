// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Configurare multer pentru încărcarea imaginilor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'client/public/Images')
  },
  filename: function (req, file, cb) {
    // Păstrăm numele original al fișierului, fără nicio modificare
    cb(null, file.originalname)
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: Infinity // Fără limită
  },
  fileFilter: (req, file, cb) => {
    // Acceptăm orice tip de imagine
    cb(null, true);
  }
}).single('profileImage');

// Generare token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      _id: user._id, 
      username: user.username, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
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
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Răspuns cu date utilizator (fără parolă)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage ? `http://localhost:5000/Images/${user.profileImage}` : null
    };

    res.status(201).json({ success: true, user: userResponse, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Autentificare utilizator
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email și parola sunt obligatorii'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credențiale invalide' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credențiale invalide' });
    }

    const token = jwt.sign(
      { 
        _id: user._id, 
        username: user.username, 
        role: user.role 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Schimbă la true în producție cu HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    let profileImageUrl = null;
    if (user.profileImage) {
      // Verificăm dacă profileImage este în formatul vechi (începe cu /)
      if (user.profileImage.startsWith('/uploads/')) {
        // Format vechi: /uploads/profile-images/filename.jpg
        const parts = user.profileImage.split('/');
        const filename = parts[parts.length - 1];
        profileImageUrl = `http://localhost:5000/Images/${filename}`;
      } else if (user.profileImage.includes('/')) {
        // Dacă conține slash dar nu e formatul vechi, folosim așa cum e
        profileImageUrl = `http://localhost:5000${user.profileImage}`;
      } else {
        // Format nou: doar numele fișierului
        profileImageUrl = `http://localhost:5000/Images/${user.profileImage}`;
      }
    }

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: profileImageUrl
    };

    res.json({ 
      success: true, 
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Verificare stare autentificare
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('Request to /auth/me - Token payload:', req.user);

    if (!req.user || !req.user._id) {
      console.log('No user in request or invalid token');
      return res.status(401).json({
        success: false,
        message: 'Nu sunteți autentificat',
      });
    }

    const userId = req.user._id;
    console.log('Looking for user with ID:', userId);

    // Verifică dacă ID-ul este un ObjectId valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('Invalid ObjectId:', userId);
      return res.status(400).json({
        success: false,
        message: 'ID utilizator invalid',
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(objectId);

    if (!user) {
      console.log('User not found in database for ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'Utilizator negăsit',
      });
    }

    const userData = user.toObject();
    if (userData.profileImage) {
      // Verificăm dacă profileImage este în formatul vechi (începe cu /)
      if (userData.profileImage.startsWith('/uploads/')) {
        // Format vechi: /uploads/profile-images/filename.jpg
        const parts = userData.profileImage.split('/');
        const filename = parts[parts.length - 1];
        // Copiem fișierul în noul format dacă există
        try {
          userData.profileImage = `http://localhost:5000/Images/${filename}`;
        } catch (err) {
          console.error('Error handling profile image:', err);
        }
      } else if (userData.profileImage.includes('/')) {
        // Dacă conține slash dar nu e formatul vechi, folosim așa cum e
        userData.profileImage = `http://localhost:5000${userData.profileImage}`;
      } else {
        // Format nou: doar numele fișierului
        userData.profileImage = `http://localhost:5000/Images/${userData.profileImage}`;
      }
    }

    delete userData.password;
    delete userData.resetCode;
    delete userData.resetCodeExpires;

    console.log('Returning user data:', userData);

    return res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Eroare server',
      error: error.message,
    });
  }
};

// Deconectare utilizator
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Deconectat cu succes' });
};

// Reîmprospătare token
exports.refreshToken = (req, res) => {
  try {
    // Dacă middleware-ul de autentificare a trecut, avem deja req.user
    const token = generateToken(req.user);

    // Setăm cookie-ul cu noul token
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, message: 'Token reîmprospătat cu succes', token });
  } catch (error) {
    console.error('Eroare la reîmprospătarea token-ului:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la reîmprospătarea token-ului' 
    });
  }
};

// Încărcare imagine profil
exports.uploadProfileImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nicio imagine încărcată' });
    }

    try {
      // Folosim doar numele fișierului, fără cale
      const filename = req.file.filename;
      const fullImageUrl = `http://localhost:5000/Images/${filename}`;
      
      // Actualizare utilizator cu noua imagine
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: filename }, // Stocăm doar numele fișierului
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Utilizator negăsit' });
      }

      res.json({ 
        success: true,
        message: 'Imagine încărcată cu succes',
        imageUrl: fullImageUrl,
        user: {
          ...user.toObject(),
          profileImage: fullImageUrl
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Eroare la încărcarea imaginii', error: error.message });
    }
  });
};

// Actualizare profil utilizator
exports.updateProfile = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Găsim utilizatorul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilizator negăsit' });
    }

    let updateData = {};

    // Verificăm dacă vrem să schimbăm parola
    if (newPassword) {
      // Verificăm dacă parola actuală este completată
      if (!currentPassword) {
        return res.status(400).json({ message: 'Parola actuală este necesară pentru a schimba parola' });
      }

      // Verificăm parola actuală
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Parola actuală este incorectă' });
      }

      // Verificăm dacă parola nouă este diferită de cea actuală
      if (currentPassword === newPassword) {
        return res.status(400).json({ message: 'Parola nouă trebuie să fie diferită de parola actuală' });
      }

      // Verificăm lungimea minimă a parolei
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Parola trebuie să aibă cel puțin 6 caractere' });
      }

      // Verificăm complexitatea parolei
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumbers = /\d/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        return res.status(400).json({
          message: 'Parola trebuie să conțină cel puțin o literă mare, o literă mică, un număr și un caracter special'
        });
      }

      // Generăm hash pentru noua parolă
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateData.password = hashedPassword;
    }

    // Verificăm dacă vrem să schimbăm username-ul
    if (username && username !== user.username) {
      // Verificăm dacă noul username este disponibil
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Acest username este deja folosit' });
      }
      updateData.username = username;
    }

    // Dacă nu avem ce actualiza
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'Nu există modificări de salvat' });
    }

    // Actualizăm utilizatorul
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    // Generăm un nou token (pentru că am schimbat date importante)
    const token = generateToken(updatedUser);

    // Trimitem noul token în cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Adăugăm URL-ul complet pentru imagine
    const userResponse = updatedUser.toObject();
    if (userResponse.profileImage) {
      userResponse.profileImage = `http://localhost:5000/Images/${userResponse.profileImage}`;
    }

    res.json({
      success: true,
      message: 'Profil actualizat cu succes',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Eroare la actualizarea profilului:', error);
    res.status(500).json({ message: 'Eroare la actualizarea profilului', error: error.message });
  }
};

// Generare cod de resetare
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Căutare utilizator după email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Nu există niciun cont asociat cu acest email' });
    }

    // Generare cod de 6 cifre
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Setare cod și expirare (1 oră)
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 3600000; // 1 oră
    await user.save();

    // În dezvoltare, afișăm codul în consolă
    console.log('Cod de resetare pentru', email, ':', resetCode);

    res.json({ success: true, message: 'Cod de resetare generat cu succes' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Verificare cod de resetare
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email și codul sunt obligatorii' });
    }

    // Căutare utilizator după email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Nu există niciun cont asociat cu acest email' });
    }

    // Verificare cod și expirare
    if (user.resetCode !== code) {
      return res.status(400).json({ message: 'Cod invalid' });
    }

    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Codul a expirat' });
    }

    res.json({ success: true, message: 'Cod verificat cu succes' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Resetare parolă
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Verificare date necesare
    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        message: 'Toate câmpurile sunt obligatorii: email, code, newPassword',
        received: { email, code, newPassword: newPassword ? 'present' : 'missing' }
      });
    }

    // Căutare utilizator după email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Nu există niciun cont asociat cu acest email' });
    }

    // Verificare cod și expirare
    if (user.resetCode !== code) {
      return res.status(400).json({ message: 'Cod invalid' });
    }

    if (user.resetCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Codul a expirat' });
    }

    // Verificare parolă nouă
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Parola trebuie să aibă cel puțin 6 caractere' });
    }

    // Verificare complexitate parolei
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      return res.status(400).json({
        message: 'Parola trebuie să conțină cel puțin o literă mare, o literă mică, un număr și un caracter special'
      });
    }

    // Actualizare parolă
    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.json({ success: true, message: 'Parola a fost resetată cu succes' });
  } catch (error) {
    console.error('Eroare la resetarea parolei:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};