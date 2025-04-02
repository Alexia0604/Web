// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bird = require('../models/Bird');
const auth = require('../middleware/authMiddleware');

// Aplicăm middleware de autentificare și autorizare pentru toate rutele admin
router.use(auth.authenticate, auth.requireAdmin);

// GET toți utilizatorii
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Eroare la obținerea utilizatorilor:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// GET un utilizator după ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    res.json(user);
  } catch (error) {
    console.error('Eroare la obținerea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// PUT actualizare utilizator
router.put('/users/:id', async (req, res) => {
  try {
    // Nu permitem actualizarea parolei prin această rută
    const { password, ...updateData } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Eroare la actualizarea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// DELETE șterge utilizator
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    res.json({ message: 'Utilizator șters cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea utilizatorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// PUT schimbă rolul utilizatorului în admin
router.put('/users/:id/make-admin', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }
    
    res.json({ message: 'Utilizator promovat la rol de admin', user });
  } catch (error) {
    console.error('Eroare la schimbarea rolului utilizatorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// GET statistici pentru dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const totalBirds = await Bird.countDocuments();
    
    // Statistici utilizatori noi ultimele 30 zile
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.json({
      users: {
        total: totalUsers,
        admins: adminUsers,
        regular: regularUsers,
        newLast30Days: newUsers
      },
      birds: {
        total: totalBirds
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea statisticilor:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

module.exports = router;