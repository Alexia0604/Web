// middleware/fileUploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configurarea stocării pentru încărcarea fișierelor
const birdFileStorage = multer.diskStorage({
  destination: async function(req, file, cb) {
    let destination;
    
    // Determinăm destinația în funcție de tipul fișierului
    if (file.mimetype.startsWith('audio/')) {
      destination = path.join(__dirname, '../../..', 'client/public/Images');
    } else {
      destination = path.join(__dirname, '../../..', 'client/public/Images');
    }
    
    // Verifică dacă directorul există și creează-l dacă nu
    try {
      await fs.access(destination);
    } catch (error) {
      await fs.mkdir(destination, { recursive: true });
    }
    
    cb(null, destination);
  },
  filename: function(req, file, cb) {
    // Păstrăm numele original al fișierului pentru a menține referințele
    // dar adăugăm un timestamp pentru a evita suprascrierea
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = path.basename(file.originalname, fileExtension);
    cb(null, fileName + '-' + uniqueSuffix + fileExtension);
  }
});

// Filtre pentru validarea tipurilor de fișiere
const imageFilter = (req, file, cb) => {
  // Acceptă doar imagini
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Doar fișierele imagine sunt permise!'), false);
  }
};

const audioFilter = (req, file, cb) => {
  // Acceptă doar fișiere audio
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Doar fișierele audio sunt permise!'), false);
  }
};

const anyFileFilter = (req, file, cb) => {
  // Acceptă imagini și audio
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Doar fișierele imagine și audio sunt permise!'), false);
  }
};

// Middleware-uri pentru diferite tipuri de fișiere
const uploadImage = multer({
  storage: birdFileStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadAudio = multer({
  storage: birdFileStorage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

const uploadAny = multer({
  storage: birdFileStorage,
  fileFilter: anyFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Handler pentru erori multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Fișierul este prea mare. Dimensiunea maximă este de 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Eroare la încărcarea fișierului: ${error.message}`
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

module.exports = {
  uploadImage: uploadImage.single('file'),
  uploadAudio: uploadAudio.single('file'),
  uploadAny: uploadAny.single('file'),
  handleMulterError
};