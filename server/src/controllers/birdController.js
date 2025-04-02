const Bird = require('../models/Bird');
const config = require('../config/config');

// Funcție utilitară pentru a rezolva URL-urile de imagini
const resolveImageUrl = (imagePath) => {
  // Dacă imaginea este deja un URL complet, returnează-l
  if (imagePath?.startsWith('http')) return imagePath;
  
  // Altfel, prepend-ează URL-ul de bază
  return imagePath 
    ? `${config.assetsUrl}/${imagePath}`
    : `${config.assetsUrl}/placeholder-bird.png`;
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
  
  // Alte metode pentru operații CRUD pot fi adăugate aici
  exports.createBird = async (req, res) => {
    try {
      const bird = new Bird(req.body);
      const savedBird = await bird.save();
      
      // Procesează pasărea nou salvată
      const processedBird = processBirdObject(savedBird);
      
      res.status(201).json(processedBird);
    } catch (err) {
      console.error('Eroare la crearea păsării:', err.message);
      res.status(400).json({ message: err.message });
    }
  };
  
  exports.updateBird = async (req, res) => {
    try {
      const bird = await Bird.findByIdAndUpdate(
        req.params.id, 
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!bird) {
        return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
      }
      
      // Procesează pasărea actualizată
      const processedBird = processBirdObject(bird);
      
      res.json(processedBird);
    } catch (err) {
      console.error('Eroare la actualizarea păsării:', err.message);
      res.status(400).json({ message: err.message });
    }
  };
  
  exports.deleteBird = async (req, res) => {
    try {
      const bird = await Bird.findByIdAndDelete(req.params.id);
      
      if (!bird) {
        return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
      }
      
      res.json({ message: 'Pasărea a fost ștearsă' });
    } catch (err) {
      console.error('Eroare la ștergerea păsării:', err.message);
      res.status(500).json({ message: err.message });
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
  
  module.exports = exports;