const Bird = require('../models/Bird');
const config = require('../config/config');
const fs = require('fs').promises;
const path = require('path');
const { deleteFile } = require('../middleware/cloudinaryConfig');

// Funcție utilitară pentru a rezolva URL-urile de imagini
const resolveImageUrl = (image) => {
  // Dacă imaginea este un obiect Cloudinary
  if (image && typeof image === 'object' && image.url) {
    return image.url;
  }
  
  // Dacă imaginea este un string (URL sau path)
  if (typeof image === 'string') {
    if (image.startsWith('http')) return image;
    return `${config.assetsUrl}/${image}`;
  }
  
  // Fallback la imaginea placeholder
  return `${config.assetsUrl}/placeholder-bird.png`;
};

// Funcție pentru a procesa obiectul pasării cu URL-uri complete
const processBirdObject = (bird) => {
  const birdObj = bird.toObject ? bird.toObject() : bird;
  
  // Rezolvă URL-ul principal al imaginii
  birdObj.imageUrl = resolveImageUrl(birdObj.image);
  
  // Rezolvă URL-urile pentru aspecte
  if (birdObj.aspects && Array.isArray(birdObj.aspects)) {
    birdObj.aspects = birdObj.aspects.map(aspect => ({
      ...aspect,
      imageUrl: resolveImageUrl(aspect.image)
    }));
  }
  
  // Rezolvă URL-urile pentru culorile penajului
  if (birdObj.featherColors && Array.isArray(birdObj.featherColors)) {
    birdObj.featherColors = birdObj.featherColors.map(color => ({
      ...color,
      imageUrl: resolveImageUrl(color.image)
    }));
  }
  
  // Rezolvă URL-urile pentru habitate
  if (birdObj.habitats && Array.isArray(birdObj.habitats)) {
    birdObj.habitats = birdObj.habitats.map(habitat => ({
      ...habitat,
      imageUrl: resolveImageUrl(habitat.image)
    }));
  }
  
  return birdObj;
};

// Obține toate păsările cu paginare
exports.getBirds = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Numără total de păsări pentru paginare
    const total = await Bird.countDocuments();
    
    // Obține păsările pentru pagina curentă
    const birds = await Bird.find()
      .skip(skip)
      .limit(limit);
    
    res.json({
      birds,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Eroare la obținerea păsărilor:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Obține toate păsările pentru admin (fără paginare, doar cu date de bază)
exports.getAllBirds = async (req, res) => {
  try {
    const birds = await Bird.find({}).select('name scientificName image createdAt updatedAt');
    
    // Construim URL-ul complet pentru imagini folosind funcția resolveImageUrl
    const birdsWithFullUrls = birds.map(bird => {
      const birdObj = bird.toObject();
      birdObj.imageUrl = resolveImageUrl(birdObj.image);
      return birdObj;
    });

    res.json({ success: true, birds: birdsWithFullUrls });
  } catch (error) {
    console.error('Eroare la obținerea păsărilor:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la obținerea păsărilor', 
      error: error.message
    });
  }
};

// Obține o pasăre după ID
exports.getBirdById = async (req, res) => {
  try {
    const bird = await Bird.findById(req.params.id);
    
    if (!bird) {
      return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
    }
    
    // Procesează pasărea pentru a avea URL-uri complete
    const processedBird = processBirdObject(bird);
    
    res.json(processedBird);
  } catch (err) {
    console.error(`Eroare la obținerea păsării cu ID ${req.params.id}:`, err.message);
    res.status(500).json({ message: err.message });
  }
};

// Obține păsări după o listă de ID-uri
exports.getBirdsByIds = async (req, res) => {
  try {
    const idsString = req.query.ids;
    if (!idsString) {
      return res.status(400).json({ message: 'Parametrul ids este necesar' });
    }
    
    const ids = idsString.split(',');
    
    // Validează că toate ID-urile sunt valide MongoDB ObjectIDs
    const validIds = ids.filter(id => id.match(/^[0-9a-fA-F]{24}$/));
    
    const birds = await Bird.find({ _id: { $in: validIds } });
    
    // Procesează păsările pentru a avea URL-uri complete
    const processedBirds = birds.map(processBirdObject);
    
    res.json(processedBirds);
  } catch (err) {
    console.error('Eroare la obținerea păsărilor după ID-uri:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Obține opțiunile de filtrare
exports.getFilterOptions = async (req, res) => {
  try {
    const birds = await Bird.find({}, 'aspects featherColors habitats');
    
    // Colectează opțiunile unice
    const aspectsSet = new Set();
    const featherColorsSet = new Set();
    const habitatsSet = new Set();
    
    const aspects = [];
    const featherColors = [];
    const habitats = [];
    
    birds.forEach(bird => {
      // Procesează aspectele
      if (bird.aspects && Array.isArray(bird.aspects)) {
        bird.aspects.forEach(aspect => {
          if (aspect && aspect.name && !aspectsSet.has(aspect.name)) {
            aspectsSet.add(aspect.name);
            aspects.push({
              name: aspect.name,
              image: resolveImageUrl(aspect.image)
            });
          }
        });
      }
      
      // Procesează culorile penajului
      if (bird.featherColors && Array.isArray(bird.featherColors)) {
        bird.featherColors.forEach(color => {
          if (color && color.name && !featherColorsSet.has(color.name)) {
            featherColorsSet.add(color.name);
            featherColors.push({
              name: color.name,
              image: resolveImageUrl(color.image)
            });
          }
        });
      }
      
      // Procesează habitatele
      if (bird.habitats && Array.isArray(bird.habitats)) {
        bird.habitats.forEach(habitat => {
          if (habitat && habitat.name && !habitatsSet.has(habitat.name)) {
            habitatsSet.add(habitat.name);
            habitats.push({
              name: habitat.name,
              image: resolveImageUrl(habitat.image)
            });
          }
        });
      }
    });
    
    // Trimite opțiunile de filtrare
    res.json({
      aspects,
      featherColors,
      habitats
    });
  } catch (error) {
    console.error('Eroare la obținerea opțiunilor de filtrare:', error);
    res.status(500).json({ message: 'Eroare la obținerea opțiunilor de filtrare', error: error.message });
  }
};

// Filtrează păsările după criterii
exports.filterBirds = async (req, res) => {
  try {
    const { aspect, featherColor, habitat } = req.query;
    
    let query = {};
    
    // Construiește query-ul în funcție de parametrii de filtrare
    if (aspect) {
      query['aspects.name'] = aspect;
    }
    
    if (featherColor) {
      query['featherColors.name'] = featherColor;
    }
    
    if (habitat) {
      query['habitats.name'] = habitat;
    }
    
    const birds = await Bird.find(query);
    
    // Procesează păsările pentru a avea URL-uri complete
    const processedBirds = birds.map(processBirdObject);
    
    res.json(processedBirds);
  } catch (error) {
    console.error('Eroare la filtrarea păsărilor:', error);
    res.status(500).json({ message: 'Eroare la filtrarea păsărilor', error: error.message });
  }
};

// Crează o pasăre nouă
exports.createBird = async (req, res) => {
  try {
    const bird = new Bird(req.body);
    const savedBird = await bird.save();
    
    // Procesează pasărea nou salvată
    const processedBird = processBirdObject(savedBird);
    
    res.status(201).json({
      success: true,
      message: 'Pasăre creată cu succes',
      bird: processedBird
    });
  } catch (err) {
    console.error('Eroare la crearea păsării:', err.message);
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Actualizează o pasăre
exports.updateBird = async (req, res) => {
  try {
    const birdId = req.params.id;
    const updates = req.body;

    const updatedBird = await Bird.findByIdAndUpdate(
      birdId,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedBird) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pasărea nu a fost găsită' 
      });
    }

    // Procesează pasărea actualizată
    const processedBird = processBirdObject(updatedBird);
    
    res.json({ 
      success: true, 
      message: 'Pasăre actualizată cu succes', 
      bird: processedBird 
    });
  } catch (error) {
    console.error('Eroare la actualizarea păsării:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la actualizarea păsării', 
      error: error.message 
    });
  }
};

// Șterge o pasăre
exports.deleteBird = async (req, res) => {
  try {
    const birdId = req.params.id;
    const bird = await Bird.findById(birdId);

    if (!bird) {
      return res.status(404).json({ 
        success: false, 
        message: 'Pasărea nu a fost găsită' 
      });
    }

    // Șterge fișierele din Cloudinary (imagine și audio)
    try {
      // Ștergem imaginea principală din Cloudinary
      if (bird.image && bird.image.public_id) {
        await deleteFile(bird.image.public_id, 'image');
        console.log('Imagine principală ștearsă din Cloudinary:', bird.image.public_id);
      }
      
      // Ștergem fișierul audio din Cloudinary
      if (bird.audio && bird.audio.public_id) {
        await deleteFile(bird.audio.public_id, 'video'); // Cloudinary stochează audio ca 'video'
        console.log('Fișier audio șters din Cloudinary:', bird.audio.public_id);
      }
    } catch (deleteError) {
      console.error('Eroare la ștergerea fișierelor din Cloudinary:', deleteError);
      // Continuăm chiar dacă ștergerea Cloudinary eșuează
    }

    // Șterge pasărea din baza de date
    await Bird.findByIdAndDelete(birdId);

    res.json({ 
      success: true, 
      message: 'Pasăre ștearsă cu succes' 
    });
  } catch (error) {
    console.error('Eroare la ștergerea păsării:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la ștergerea păsării', 
      error: error.message 
    });
  }
};

// Încarcă un fișier (imagine sau audio) pentru o pasăre
exports.uploadBirdFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Niciun fișier încărcat' 
      });
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

    // Dacă există un fișier vechi și trebuie înlocuit
    if (req.body.oldFilePath) {
      try {
        const oldFilePath = path.join(
          __dirname, 
          '../../..', 
          'client/public/Images', 
          req.body.oldFilePath
        );
        await fs.access(oldFilePath); // Verifică dacă fișierul există
        await fs.unlink(oldFilePath); // Șterge fișierul vechi
      } catch (err) {
        // Ignoră erorile dacă fișierul nu există
        if (err.code !== 'ENOENT') {
          console.error('Eroare la ștergerea fișierului vechi:', err);
        }
      }
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
};

// Șterge un fișier
exports.deleteFile = async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ 
        success: false, 
        message: 'Calea fișierului nu a fost specificată' 
      });
    }

    const fullFilePath = path.join(
      __dirname, 
      '../../..', 
      'client/public/Images', 
      filePath
    );

    try {
      await fs.access(fullFilePath); // Verifică dacă fișierul există
      await fs.unlink(fullFilePath); // Șterge fișierul
      res.json({ 
        success: true, 
        message: 'Fișierul a fost șters cu succes' 
      });
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ 
          success: false, 
          message: 'Fișierul nu a fost găsit' 
        });
      }
      throw err;
    }
  } catch (error) {
    console.error('Eroare la ștergerea fișierului:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la ștergerea fișierului', 
      error: error.message 
    });
  }
};

// Statistici și rapoarte (opțional)
exports.getBirdStats = async (req, res) => {
  try {
    const totalBirds = await Bird.countDocuments();
    
    // Statistici pe familii
    const familyStats = await Bird.aggregate([
      { $group: { _id: "$family", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Statistici pe ordine
    const orderStats = await Bird.aggregate([
      { $group: { _id: "$order", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      totalBirds,
      familyStats,
      orderStats
    });
  } catch (err) {
    console.error('Eroare la obținerea statisticilor:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Șterge un fișier din Cloudinary
exports.deleteCloudinaryFile = async (req, res) => {
  try {
    const { public_id, resource_type } = req.body;

    if (!public_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID-ul public Cloudinary nu a fost specificat' 
      });
    }

    try {
      // Ștergem fișierul din Cloudinary
      const result = await deleteFile(public_id, resource_type || 'image');
      console.log('Fișier șters din Cloudinary:', result);
      
      res.json({ 
        success: true, 
        message: 'Fișierul a fost șters cu succes din Cloudinary',
        result
      });
    } catch (err) {
      console.error('Eroare la ștergerea fișierului din Cloudinary:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Eroare la ștergerea fișierului din Cloudinary',
        error: err.message
      });
    }
  } catch (error) {
    console.error('Eroare la ștergerea fișierului din Cloudinary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Eroare la ștergerea fișierului din Cloudinary', 
      error: error.message 
    });
  }
};

module.exports = exports;