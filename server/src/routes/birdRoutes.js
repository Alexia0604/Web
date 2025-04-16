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
router.get('/filter-options', async (req, res) => {
  try {
    // Obține toate aspectele, culorile și habitatele unice
    const birds = await Bird.find({}, 'aspects featherColors habitats');
    
    // Vom colecta toate valorile unice aici
    const aspectsMap = new Map();
    const featherColorsMap = new Map();
    const habitatsMap = new Map();
    
    // Procesează toate păsările pentru a extrage opțiunile unice
    birds.forEach(bird => {
      // Procesează aspectele
      if (bird.aspects && Array.isArray(bird.aspects)) {
        bird.aspects.forEach(aspect => {
          if (aspect && aspect.title && !aspectsMap.has(aspect.title)) {
            aspectsMap.set(aspect.title, {
              name: aspect.title,
              description: aspect.description,
              image: aspect.image
            });
          }
        });
      }
      
      // Procesează culorile penajului
      if (bird.featherColors && Array.isArray(bird.featherColors)) {
        bird.featherColors.forEach(color => {
          if (color && color.color && !featherColorsMap.has(color.color)) {
            featherColorsMap.set(color.color, {
              name: color.color,
              description: color.description,
              image: color.image
            });
          }
        });
      }
      
      // Procesează habitatele
      if (bird.habitats && Array.isArray(bird.habitats)) {
        bird.habitats.forEach(habitat => {
          if (habitat && habitat.name && !habitatsMap.has(habitat.name)) {
            habitatsMap.set(habitat.name, {
              name: habitat.name,
              description: habitat.description,
              image: habitat.image
            });
          }
        });
      }
    });
    
    // Convertim Map-urile în array-uri
    const aspects = Array.from(aspectsMap.values());
    const featherColors = Array.from(featherColorsMap.values());
    const habitats = Array.from(habitatsMap.values());
    
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
router.get('/filter', async (req, res) => {
  try {
    const { aspect, featherColor, habitat } = req.query;
    
    let query = {};
    
    // Construiește query-ul în funcție de parametrii de filtrare
    if (aspect) {
      query['aspects.title'] = aspect;
    }
    
    if (featherColor) {
      query['featherColors.color'] = featherColor;
    }
    
    if (habitat) {
      query['habitats.name'] = habitat;
    }
    
    const birds = await Bird.find(query);
    
    // Procesăm imaginile pentru a returna URL-urile corecte
    const processedBirds = birds.map(bird => {
      const processedBird = bird.toObject();
      
      // Procesăm imaginea principală
      if (processedBird.image && typeof processedBird.image === 'object') {
        processedBird.displayImage = processedBird.image.url;
      }

      // Procesăm aspectele
      if (processedBird.aspects) {
        processedBird.aspects = processedBird.aspects.map(aspect => ({
          ...aspect,
          displayImage: aspect.image?.url || aspect.image
        }));
      }

      // Procesăm culorile
      if (processedBird.featherColors) {
        processedBird.featherColors = processedBird.featherColors.map(color => ({
          ...color,
          displayImage: color.image?.url || color.image
        }));
      }

      // Procesăm habitatele
      if (processedBird.habitats) {
        processedBird.habitats = processedBird.habitats.map(habitat => ({
          ...habitat,
          displayImage: habitat.image?.url || habitat.image
        }));
      }

      return processedBird;
    });
    
    res.json(processedBirds);
  } catch (error) {
    console.error('Eroare la filtrarea păsărilor:', error);
    res.status(500).json({ message: 'Eroare la filtrarea păsărilor', error: error.message });
  }
});

// GET păsări după o listă de ID-uri (IMPORTANT: această rută trebuie să fie înainte de /:id)
router.get('/byIds', async (req, res) => {
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
    const birdData = {
      ...req.body,
      createdAt: new Date() // Asigurăm că avem o dată de creare corectă
    };
    const newBird = new Bird(birdData);
    const savedBird = await newBird.save();
    
    res.status(201).json(savedBird);
  } catch (error) {
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