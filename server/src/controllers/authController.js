// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');

// Configurare multer pentru încărcarea imaginilor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/profile-images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Doar imaginile sunt permise!'));
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
      role: user.role,
      profileImage: user.profileImage ? `http://localhost:5000${user.profileImage}` : null
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
    const { email, password, rememberMe } = req.body;

    // Verificare date necesare
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email și parola sunt obligatorii',
        received: { email: email ? 'present' : 'missing', password: password ? 'present' : 'missing' }
      });
    }

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

    // Setăm durata cookie-ului în funcție de opțiunea rememberMe
    const cookieOptions = {
      httpOnly: false, // Permitem accesul din JavaScript
      secure: false, // Setăm la false pentru development
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 zile sau 24 ore
      sameSite: 'strict',
      path: '/'
    };

    // Trimitere token în cookie și localStorage pentru persistență
    res.cookie('token', token, cookieOptions);

    // Răspuns cu date utilizator (fără parolă)
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage ? `http://localhost:5000${user.profileImage}` : null
    };

    res.json({ 
      success: true, 
      user: userResponse, 
      token,
      expiresIn: cookieOptions.maxAge 
    });
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
};

// Verificare stare autentificare
exports.getCurrentUser = async (req, res) => {
  try {
    // Verificăm dacă utilizatorul este autentificat
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Nu sunteți autentificat' 
      });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilizator negăsit' 
      });
    }

    // Convertim user-ul în obiect simplu și adăugăm URL-ul complet pentru imagine
    const userData = user.toObject();
    if (userData.profileImage) {
      userData.profileImage = `http://localhost:5000${userData.profileImage}`;
    }

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Eroare la obținerea utilizatorului curent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare server', 
      error: error.message 
    });
  }
};

// Deconectare utilizator
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Deconectat cu succes' });
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
      const imageUrl = `/uploads/profile-images/${req.file.filename}`;
      const fullImageUrl = `http://localhost:5000${imageUrl}`;
      
      // Actualizare utilizator cu noua imagine
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profileImage: imageUrl },
        { new: true }
      ).select('-password');

      if (!user) {
        // Ștergere fișier dacă utilizatorul nu există
        await fs.unlink(req.file.path);
        return res.status(404).json({ message: 'Utilizator negăsit' });
      }

      res.json({ 
        message: 'Imagine încărcată cu succes',
        imageUrl: fullImageUrl,
        user: {
          ...user.toObject(),
          profileImage: fullImageUrl
        }
      });
    } catch (error) {
      // Ștergere fișier în caz de eroare
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      res.status(500).json({ message: 'Eroare la încărcarea imaginii', error: error.message });
    }
  });
};

// Actualizare profil utilizator
exports.updateProfile = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;
    const userId = req.user._id; // Folosim _id în loc de id

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
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    });

    // Adăugăm URL-ul complet pentru imagine
    const userResponse = updatedUser.toObject();
    if (userResponse.profileImage) {
      userResponse.profileImage = `http://localhost:5000${userResponse.profileImage}`;
    }

    res.json({
      message: 'Profil actualizat cu succes',
      user: userResponse
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

    res.json({ message: 'Cod de resetare generat cu succes' });
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