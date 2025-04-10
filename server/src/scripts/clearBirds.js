const mongoose = require('mongoose');
const Bird = require('../models/Bird');
const config = require('../config/config');

async function clearBirds() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Conectat la baza de date MongoDB');

    const result = await Bird.deleteMany({});
    console.log(`${result.deletedCount} păsări au fost șterse din baza de date`);

  } catch (error) {
    console.error('Eroare la ștergerea păsărilor:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Deconectat de la baza de date');
  }
}

clearBirds(); 