const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bird = require('../models/Bird');
const Favorite = require('../models/Favorite');
const QuizScore = require('../models/QuizScore');
const { authenticate: authMiddleware, requireAdmin: adminMiddleware } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const config = require('../config/config');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const birdImagesStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    let destination;
    
    // Determinăm destinația în funcție de tipul fișierului
    if (file.mimetype.startsWith('audio/')) {
      destination = path.join(__dirname, '../../..', 'client/public/sounds');
    } else {
      destination = path.join(__dirname, '../../..', 'client/public/Images');
    }
    
    cb(null, destination);
  },
  filename: function(req, file, cb) {
    // Păstrăm numele original al fișierului
    cb(null, file.originalname);
  }
});

const birdFileUpload = multer({
  storage: birdImagesStorage,
  limits: {
    fileSize: Infinity
  }
});

// Aplicăm middleware de autentificare și autorizare pentru toate rutele admin
router.use(authMiddleware);
router.use(adminMiddleware);

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

// GET toate păsările pentru admin
router.get('/birds', async (req, res) => {
  try {
    const birds = await Bird.find({}).select('name scientificName image createdAt updatedAt');
    
    // Construim URL-ul complet pentru imagini și audio
    const birdsWithFullUrls = birds.map(bird => {
      const birdObj = bird.toObject();
      if (birdObj.image) {
        birdObj.image = `http://localhost:5000/Images/${birdObj.image}`;
      }
      if (birdObj.audio) {
        birdObj.audio = `http://localhost:5000/Images/${birdObj.audio}`;
      }
      return birdObj;
    });

    res.json({ birds: birdsWithFullUrls });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la obținerea păsărilor', error: error.message });
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

// GET activitate recentă
router.get('/recent-activity', async (req, res) => {
  try {
    const [newUsers, newBirds, newFavorites, newQuizScores] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('username createdAt'),
      Bird.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name createdAt'),
      Favorite.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'username')
        .populate('birdId', 'name'),
      QuizScore.find({})
        .sort({ date: -1 })
        .limit(5)
        .populate('userId', 'username')
    ]);

    const activities = [
      ...newUsers.map(user => ({
        type: 'USER_REGISTERED',
        timestamp: user.createdAt,
        data: { username: user.username }
      })),
      ...newBirds.map(bird => ({
        type: 'BIRD_ADDED',
        timestamp: bird.createdAt,
        data: { birdName: bird.name }
      })),
      ...newFavorites.filter(fav => fav.userId && fav.birdId).map(fav => ({
        type: 'FAVORITE_ADDED',
        timestamp: fav.createdAt,
        data: { 
          username: fav.userId?.username || 'Utilizator necunoscut',
          birdName: fav.birdId?.name || 'Pasăre necunoscută'
        }
      })),
      ...newQuizScores.filter(quiz => quiz.userId).map(quiz => ({
        type: 'QUIZ_COMPLETED',
        timestamp: quiz.date,
        data: { 
          username: quiz.userId?.username || 'Utilizator necunoscut',
          score: quiz.score,
          correctAnswers: quiz.correctAnswers,
          totalQuestions: quiz.questionsAnswered
        }
      }))
    ].sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Eroare la obținerea activității recente:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la obținerea activității recente' 
    });
  }
});

// GET statistici sistem
router.get('/system-stats', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [dailyUsers, dailyBirds, dailyQuizzes] = await Promise.all([
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$createdAt" 
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Bird.aggregate([
        {
          $match: {
            $or: [
              { createdAt: { $gte: thirtyDaysAgo } },
              { updatedAt: { $gte: thirtyDaysAgo } }
            ]
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: { $ifNull: ["$createdAt", "$updatedAt"] }
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      QuizScore.aggregate([
        {
          $match: {
            date: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { 
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: "$date" 
              }
            },
            averageScore: { $avg: "$score" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        dailyUsers,
        dailyBirds,
        dailyQuizzes
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la obținerea statisticilor' 
    });
  }
});

// GET o pasăre după ID
router.get('/birds/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bird = await Bird.findById(req.params.id);
    
    if (!bird) {
      return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
    }
    
    res.json(bird);
  } catch (error) {
    console.error('Eroare la obținerea păsării:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// PUT actualizare pasăre
router.put('/birds/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const birdId = req.params.id;
    const updates = req.body;

    const bird = await Bird.findByIdAndUpdate(
      birdId,
      updates,
      { new: true, runValidators: true }
    );

    if (!bird) {
      return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
    }

    res.json(bird);
  } catch (error) {
    console.error('Eroare la actualizarea păsării:', error);
    res.status(500).json({ message: 'Eroare la actualizarea păsării' });
  }
});

// POST încarcă orice tip de fișier pentru o pasăre
router.post('/upload-bird-file', birdFileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Niciun fișier încărcat' });
    }

    const filename = req.file.filename;
    let fileUrl;
    let type;
    
    if (req.file.mimetype.startsWith('audio/')) {
      fileUrl = `${config.uploadUrl}/sounds/${filename}`;
      type = 'audio';
    } else {
      fileUrl = `${config.uploadUrl}/Images/${filename}`;
      type = 'image';
    }

    res.json({
      success: true, 
      file: {
        filename: filename,
        path: filename,
        fullUrl: fileUrl,
        type: type
      }
    });
  } catch (error) {
    console.error('Eroare la încărcarea fișierului:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la încărcarea fișierului', 
      error: error.message 
    });
  }
});

// DELETE șterge un fișier (imagine sau audio)
router.delete('/delete-bird-file', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ success: false, message: 'Calea fișierului nu a fost specificată' });
    }

    const fullFilePath = path.join(
      __dirname, 
      '../../..', 
      'client/public/Images', 
      filePath
    );

    try {
      await fs.access(fullFilePath);
      await fs.unlink(fullFilePath);
      res.json({ success: true, message: 'Fișierul a fost șters cu succes' });
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ success: false, message: 'Fișierul nu a fost găsit' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Eroare la ștergerea fișierului:', error);
    res.status(500).json({ success: false, message: 'Eroare la ștergerea fișierului', error: error.message });
  }
});

// POST creare utilizator nou de către admin
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, profileImage, role } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Utilizatorul sau email-ul există deja' 
      });
    }

    const newUser = new User({
      username,
      email,
      password,
      profileImage,
      role: role || 'user'
    });

    const savedUser = await newUser.save();
    
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Utilizator creat cu succes',
      user: userResponse
    });
  } catch (error) {
    console.error('Eroare la crearea utilizatorului:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la crearea utilizatorului', 
      error: error.message 
    });
  }
});

module.exports = router;