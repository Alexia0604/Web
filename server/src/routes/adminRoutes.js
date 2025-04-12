// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bird = require('../models/Bird');
const Favorite = require('../models/Favorite');
const QuizScore = require('../models/QuizScore');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');
const birdController = require('../controllers/birdController');
const config = require('../config/config');
const { uploadAny, handleMulterError } = require('../middleware/fileUploadMiddleware');
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const os = require('os');
const { uploadImage, uploadAudio, cloudinary } = require('../middleware/cloudinaryConfig');
const { uploadAspectImage, uploadFeatherImage, uploadHabitatImage, uploadBirdImage } = require('../middleware/cloudinaryConfig');

// Configurare multer pentru upload temporar
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ dest: '/tmp' });

// Aplicăm middleware de autentificare și autorizare pentru toate rutele admin
router.use(authenticate);
router.use(requireAdmin);

// ========== Rute pentru utilizatori ==========
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

// PUT schimbă rolul utilizatorului
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
    }

    res.json({ message: 'Utilizator promovat la rol de admin', user });
  } catch (error) {
    console.error('Eroare la schimbarea rolului utilizatorului:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

// ========== Rute pentru statistici dashboard ==========
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

// ========== Rute pentru păsări ==========
// GET toate păsările pentru admin
router.get('/birds', birdController.getAllBirds);

// GET o pasăre după ID
router.get('/birds/:id', birdController.getBirdById);

// POST creare pasăre nouă
router.post('/birds', birdController.createBird);

// PUT actualizare pasăre
router.put('/birds/:id', birdController.updateBird);

// DELETE șterge pasăre
router.delete('/birds/:id', birdController.deleteBird);

// ========== Rute pentru încărcarea fișierelor ==========
// POST încarcă fișier (imagine sau audio)
router.post('/upload-bird-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    // Verificăm dimensiunea fișierului
    const fileSize = req.file.size;
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (fileSize > maxSize) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ 
        success: false,
        error: 'File size too large. Maximum size is 10MB' 
      });
    }

    const uploadType = req.body.uploadType || 'misc';
    let folder;

    // Determinăm folderul corect în funcție de tipul de upload
    switch(uploadType) {
      case 'audio':
        folder = 'birds-audio';
        break;
      case 'aspect':
        folder = 'birds-aspects';
        break;
      case 'feather':
        folder = 'birds-feathers';
        break;
      case 'habitat':
        folder = 'birds-habitats';
        break;
      case 'image':
        folder = 'birds-images';
        break;
      default:
        folder = 'misc';
    }

    let result;
    try {
      if (uploadType === 'audio') {
        result = await uploadAudio(req.file.path, folder);
      } else {
        result = await uploadImage(req.file.path, folder);
      }

      res.json({
        success: true,
        filename: result.filename,
        url: result.url,
        public_id: result.public_id,
        type: uploadType
      });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ 
        success: false,
        error: 'Error uploading file to Cloudinary',
        details: uploadError.message 
      });
    }
  } catch (error) {
    console.error('Error handling file upload:', error);
    // Încercăm să ștergem fișierul temporar în caz de eroare
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ 
      success: false,
      error: 'Server error while processing file upload',
      details: error.message 
    });
  }
});

// DELETE șterge un fișier
router.delete('/delete-bird-file', birdController.deleteFile);

// DELETE șterge un fișier din Cloudinary
router.delete('/delete-cloudinary-file', birdController.deleteCloudinaryFile);

module.exports = router;