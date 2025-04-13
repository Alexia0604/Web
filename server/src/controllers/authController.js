// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { uploadProfileImage, deleteFile } = require('../middleware/cloudinaryConfig');
const os = require('os');
const emailService = require('../config/emailService');

// Configurare multer pentru încărcarea temporară a imaginilor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir()) // Folosim directorul temporar al sistemului
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limită de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Verificăm tipul fișierului
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Doar fișierele imagine sunt permise!'), false);
    }
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
      profileImage: user.profileImage ? 
        (typeof user.profileImage === 'object' && user.profileImage.url ? 
          user.profileImage.url : 
          `http://localhost:5000/Images/${user.profileImage}`) 
        : null
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
      // Verifică dacă profileImage este un obiect (noua structură) sau un string (vechea structură)
      if (typeof user.profileImage === 'object' && user.profileImage.url) {
        // Noua structură cu Cloudinary
        profileImageUrl = user.profileImage.url;
      } else if (user.profileImage.startsWith('/uploads/')) {
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
      // Verifică dacă profileImage este un obiect (noua structură) sau un string (vechea structură)
      if (typeof userData.profileImage === 'object' && userData.profileImage.url) {
        // Noua structură cu Cloudinary
        userData.profileImage = userData.profileImage.url;
      } else if (userData.profileImage.startsWith('/uploads/')) {
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
      console.error('Eroare la încărcarea imaginii:', err);
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Nicio imagine încărcată' });
    }

    try {
      // Verificăm dacă utilizatorul există
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'Utilizator negăsit' });
      }

      // Dacă utilizatorul are deja o imagine cu public_id în Cloudinary, o ștergem
      let oldPublicId = null;
      if (user.profileImage && user.profileImage.public_id) {
        oldPublicId = user.profileImage.public_id;
      }

      console.log('Încărcare imagine în Cloudinary din:', req.file.path);
      // Încărcăm noua imagine în Cloudinary
      const cloudinaryResult = await uploadProfileImage(req.file.path);
      console.log('Rezultat Cloudinary:', cloudinaryResult);
      
      // Actualizăm utilizatorul cu noua imagine
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { 
          profileImage: {
            url: cloudinaryResult.url,
            public_id: cloudinaryResult.public_id,
            filename: cloudinaryResult.filename
          }
        },
        { new: true }
      ).select('-password');

      // Dacă aveam o imagine veche în Cloudinary, o ștergem după ce am încărcat cu succes cea nouă
      if (oldPublicId) {
        try {
          await deleteFile(oldPublicId);
          console.log(`Imagine anterioară ștearsă: ${oldPublicId}`);
        } catch (deleteError) {
          console.error('Eroare la ștergerea imaginii anterioare:', deleteError);
          // Continuăm chiar dacă ștergerea eșuează
        }
      }

      // Răspundem cu URL-ul complet pentru noua imagine
      res.json({ 
        success: true,
        message: 'Imagine încărcată cu succes',
        imageUrl: cloudinaryResult.url,
        user: {
          ...updatedUser.toObject(),
          profileImage: cloudinaryResult.url
        }
      });
    } catch (error) {
      console.error('Eroare la procesarea imaginii:', error);
      res.status(500).json({ message: 'Eroare la încărcarea imaginii', error: error.message });
    } finally {
      // Ștergem fișierul temporar dacă există
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path).catch(() => {});
        } catch (err) {
          console.warn('Warning: Could not delete temporary file:', err);
        }
      }
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
      if (typeof userResponse.profileImage === 'object' && userResponse.profileImage.url) {
        userResponse.profileImage = userResponse.profileImage.url;
      } else {
        userResponse.profileImage = `http://localhost:5000/Images/${userResponse.profileImage}`;
      }
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

    // Încercăm să trimitem codul prin email
    let emailSent = false;
    try {
      const emailContent = emailService.createResetPasswordEmailContent(user.username, resetCode);
      const emailResult = await emailService.sendEmail(
        email,
        'Resetare parolă BirdHub',
        emailContent.text,
        emailContent.html
      );
      emailSent = emailResult.success;
    } catch (emailError) {
      console.error('Eroare la trimiterea email-ului:', emailError);
      // Nu oprim procesul dacă email-ul eșuează
    }

    // Afișăm mesajul în funcție de succesul trimiterii email-ului
    if (emailSent) {
      res.json({ 
        success: true, 
        message: 'Un cod de resetare a fost trimis la adresa ta de email' 
      });
    } else {
      // Dacă email-ul nu a fost trimis, returnăm codul direct în răspuns
      console.log('Email-ul nu a putut fi trimis. Returnăm codul în răspuns:', resetCode);
      res.json({ 
        success: true, 
        message: 'Trimiterea email-ului a eșuat, dar am generat codul pentru tine', 
        resetCode: resetCode 
      });
    }
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