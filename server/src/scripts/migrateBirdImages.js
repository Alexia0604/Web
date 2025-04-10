const mongoose = require('mongoose');
const Bird = require('../models/Bird');
const { uploadImage, uploadAudio } = require('../middleware/cloudinaryConfig');
const config = require('../config/config');
const path = require('path');
const fs = require('fs').promises;

async function migrateBirdImages() {
  try {
    console.log('Se încearcă conectarea la MongoDB...');
    console.log('MongoDB URI:', config.mongoUri);
    
    await mongoose.connect(config.mongoUri);
    console.log('Conectat cu succes la baza de date');

    // Verifică conexiunea și baza de date
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Colecții disponibile:', collections.map(c => c.name));

    // Încearcă să găsească păsările direct din colecție
    const birds = await db.collection('birds').find({}).toArray();
    console.log(`Găsite ${birds.length} păsări în colecție`);

    if (birds.length === 0) {
      console.log('Nu s-au găsit păsări. Verifică următoarele:');
      console.log('1. Numele bazei de date:', db.databaseName);
      console.log('2. Numele colecției: birds');
      process.exit(1);
    }

    console.log('Începe migrarea imaginilor...');
    
    for (const bird of birds) {
      console.log(`\nProcesez pasărea: ${bird.name}`);
      
      // Procesează imaginea principală
      if (bird.image && typeof bird.image === 'string') {
        const imagePath = path.join(__dirname, '../../../client/public/Images', bird.image);
        console.log(`Procesez imaginea: ${imagePath}`);
        
        try {
          // Verifică dacă fișierul există
          await fs.access(imagePath);
          console.log('Fișierul există, începe upload-ul...');
          
          const result = await uploadImage(imagePath);
          console.log('Upload reușit. URL:', result.secure_url);
          
          // Actualizează în baza de date
          await db.collection('birds').updateOne(
            { _id: bird._id },
            {
              $set: {
                image: {
                  url: result.secure_url,
                  public_id: result.public_id,
                  filename: bird.image
                }
              }
            }
          );
          console.log('Baza de date actualizată cu succes');
        } catch (err) {
          console.error(`Eroare la procesarea imaginii pentru ${bird.name}:`, err.message);
          // Verifică dacă fișierul există în alt director
          const altImagePath = path.join(__dirname, '../../../client/public/Images/Images', bird.image);
          try {
            await fs.access(altImagePath);
            console.log('Fișierul găsit în directorul alternativ, începe upload-ul...');
            const result = await uploadImage(altImagePath);
            await db.collection('birds').updateOne(
              { _id: bird._id },
              {
                $set: {
                  image: {
                    url: result.secure_url,
                    public_id: result.public_id,
                    filename: bird.image
                  }
                }
              }
            );
            console.log('Baza de date actualizată cu succes');
          } catch (altErr) {
            console.error(`Fișierul nu a fost găsit nici în directorul alternativ:`, altErr.message);
          }
        }
      }

      // Procesează fișierul audio
      if (bird.audio && typeof bird.audio === 'string') {
        const audioPath = path.join(__dirname, '../../../client/public/Images', bird.audio);
        console.log(`Procesez audio: ${audioPath}`);
        
        try {
          await fs.access(audioPath);
          console.log('Fișierul audio există, începe upload-ul...');
          
          const result = await uploadAudio(audioPath);
          console.log('Upload audio reușit. URL:', result.secure_url);
          
          await db.collection('birds').updateOne(
            { _id: bird._id },
            {
              $set: {
                audio: {
                  url: result.secure_url,
                  public_id: result.public_id,
                  filename: bird.audio
                }
              }
            }
          );
          console.log('Baza de date actualizată cu succes pentru audio');
        } catch (err) {
          console.error(`Eroare la procesarea audio pentru ${bird.name}:`, err.message);
          // Verifică dacă fișierul există în alt director
          const altAudioPath = path.join(__dirname, '../../../client/public/Images/Images', bird.audio);
          try {
            await fs.access(altAudioPath);
            console.log('Fișierul audio găsit în directorul alternativ, începe upload-ul...');
            const result = await uploadAudio(altAudioPath);
            await db.collection('birds').updateOne(
              { _id: bird._id },
              {
                $set: {
                  audio: {
                    url: result.secure_url,
                    public_id: result.public_id,
                    filename: bird.audio
                  }
                }
              }
            );
            console.log('Baza de date actualizată cu succes pentru audio');
          } catch (altErr) {
            console.error(`Fișierul audio nu a fost găsit nici în directorul alternativ:`, altErr.message);
          }
        }
      }

      // Procesează imaginile din arrays (aspects, featherColors, habitats)
      const arrayFields = ['aspects', 'featherColors', 'habitats'];
      for (const field of arrayFields) {
        if (bird[field] && Array.isArray(bird[field])) {
          for (let i = 0; i < bird[field].length; i++) {
            const item = bird[field][i];
            if (item.image && typeof item.image === 'string') {
              const imagePath = path.join(__dirname, '../../../client/public/Images', item.image);
              console.log(`Procesez imagine pentru ${field}[${i}]: ${imagePath}`);
              
              try {
                await fs.access(imagePath);
                const result = await uploadImage(imagePath);
                
                // Construiește query-ul de update pentru array
                const updateQuery = {};
                updateQuery[`${field}.${i}.image`] = {
                  url: result.secure_url,
                  public_id: result.public_id,
                  filename: item.image
                };
                
                await db.collection('birds').updateOne(
                  { _id: bird._id },
                  { $set: updateQuery }
                );
                console.log(`Imagine actualizată pentru ${field}[${i}]`);
              } catch (err) {
                console.error(`Eroare la procesarea imaginii pentru ${field}[${i}]:`, err.message);
                // Verifică dacă fișierul există în alt director
                const altImagePath = path.join(__dirname, '../../../client/public/Images/Images', item.image);
                try {
                  await fs.access(altImagePath);
                  console.log(`Fișierul pentru ${field}[${i}] găsit în directorul alternativ, începe upload-ul...`);
                  const result = await uploadImage(altImagePath);
                  const updateQuery = {};
                  updateQuery[`${field}.${i}.image`] = {
                    url: result.secure_url,
                    public_id: result.public_id,
                    filename: item.image
                  };
                  await db.collection('birds').updateOne(
                    { _id: bird._id },
                    { $set: updateQuery }
                  );
                  console.log(`Imagine actualizată pentru ${field}[${i}]`);
                } catch (altErr) {
                  console.error(`Fișierul nu a fost găsit nici în directorul alternativ pentru ${field}[${i}]:`, altErr.message);
                }
              }
            }
          }
        }
      }
    }

    console.log('\nMigrare completă!');
    process.exit(0);
  } catch (err) {
    console.error('Eroare la migrare:', err);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

migrateBirdImages(); 