// routes/birdRoutes.js
const express = require('express');
const router = express.Router();
const Bird = require('../models/Bird');
const auth = require('../middleware/authMiddleware');

// GET toate păsările cu paginare
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';

    // Construim query-ul de căutare
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { englishName: { $regex: search, $options: 'i' } }
      ];
    }

    // Numărăm totalul de păsări care se potrivesc cu căutarea
    const total = await Bird.countDocuments(query);

    // Obținem păsările pentru pagina curentă
    const birds = await Bird.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 });

    res.json({
      birds,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Eroare la obținerea păsărilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea păsărilor', error: error.message });
  }
});

// GET toate opțiunile de filtrare
router.get('/filter-options', auth.authenticate, async (req, res) => {
  try {
    // Obține toate aspectele, culorile și habitatele unice
    const birds = await Bird.find({}, 'aspects featherColors habitats');
    
    // Vom colecta toate valorile unice aici
    const aspectsSet = new Set();
    const featherColorsSet = new Set();
    const habitatsSet = new Set();
    
    // Object pentru a ține valorile unice cu imaginile lor
    const aspects = [];
    const featherColors = [];
    const habitats = [];
    
    // Procesează toate păsările pentru a extrage opțiunile unice
    birds.forEach(bird => {
      // Procesează aspectele
      if (bird.aspects && Array.isArray(bird.aspects)) {
        bird.aspects.forEach(aspect => {
          if (aspect && aspect.name && !aspectsSet.has(aspect.name)) {
            aspectsSet.add(aspect.name);
            aspects.push({
              name: aspect.name,
              image: aspect.image
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
              image: color.image
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
              image: habitat.image
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
});

// GET păsări filtrate după criterii
router.get('/filter', auth.authenticate, async (req, res) => {
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
    
    res.json(birds);
  } catch (error) {
    console.error('Eroare la filtrarea păsărilor:', error);
    res.status(500).json({ message: 'Eroare la filtrarea păsărilor', error: error.message });
  }
});

// GET păsări după o listă de ID-uri (IMPORTANT: această rută trebuie să fie înainte de /:id)
router.get('/byIds', auth.authenticate, async (req, res) => {
  try {
    const idsString = req.query.ids;
    if (!idsString) {
      return res.status(400).json({ message: 'Parametrul ids este necesar' });
    }
    
    const ids = idsString.split(',');
    
    // Validează că toate ID-urile sunt valide MongoDB ObjectIDs
    const validIds = ids.filter(id => id.match(/^[0-9a-fA-F]{24}$/));
    
    const birds = await Bird.find({ _id: { $in: validIds } });
    
    res.json(birds);
  } catch (error) {
    console.error('Eroare la obținerea păsărilor după ID-uri:', error);
    res.status(500).json({ message: 'Eroare la obținerea păsărilor', error: error.message });
  }
});

// GET o pasăre după ID (IMPORTANT: această rută trebuie să fie după rutele specifice)
router.get('/:id', auth.authenticate, async (req, res) => {
  try {
    const bird = await Bird.findById(req.params.id);
    if (!bird) {
      return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
    }
    res.json(bird);
  } catch (error) {
    console.error(`Eroare la obținerea păsării cu ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Eroare la obținerea păsării', error: error.message });
  }
});

// Rute doar pentru administratori
router.post('/', auth.authenticate, auth.requireAdmin, async (req, res) => {
  try {
    const newBird = new Bird(req.body);
    const savedBird = await newBird.save();
    res.status(201).json(savedBird);
  } catch (error) {
    console.error('Eroare la crearea păsării:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

router.put('/:id', auth.authenticate, auth.requireAdmin, async (req, res) => {
  try {
    const updatedBird = await Bird.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBird) {
      return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
    }
    res.json(updatedBird);
  } catch (error) {
    console.error('Eroare la actualizarea păsării:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

router.delete('/:id', auth.authenticate, auth.requireAdmin, async (req, res) => {
  try {
    const deletedBird = await Bird.findByIdAndDelete(req.params.id);
    if (!deletedBird) {
      return res.status(404).json({ message: 'Pasărea nu a fost găsită' });
    }
    res.json({ message: 'Pasăre ștearsă cu succes' });
  } catch (error) {
    console.error('Eroare la ștergerea păsării:', error);
    res.status(500).json({ message: 'Eroare server', error: error.message });
  }
});

module.exports = router;