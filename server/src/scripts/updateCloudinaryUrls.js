const mongoose = require('mongoose');
const config = require('../config/config');
const { buildCloudinaryUrl } = require('../middleware/cloudinaryConfig');

async function updateCloudinaryUrls() {
  try {
    console.log('Se încearcă conectarea la MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('Conectat cu succes la baza de date');

    const db = mongoose.connection.db;
    const birds = await db.collection('birds').find({}).toArray();
    console.log(`Găsite ${birds.length} păsări în colecție`);

    for (const bird of birds) {
      console.log(`\nProcesez pasărea: ${bird.name}`);
      const updates = {};
      let hasUpdates = false;

      // Actualizează imaginea principală
      if (bird.image && bird.image.public_id) {
        console.log('Procesez imaginea principală:', bird.image.public_id);
        const newUrl = await buildCloudinaryUrl(bird.image.public_id);
        if (newUrl && (!bird.image.url || bird.image.url !== newUrl)) {
          updates.image = {
            ...bird.image,
            url: newUrl
          };
          hasUpdates = true;
          console.log('URL imagine actualizat:', newUrl);
        }
      }

      // Actualizează audio
      if (bird.audio && bird.audio.public_id) {
        console.log('Procesez audio:', bird.audio.public_id);
        const newUrl = await buildCloudinaryUrl(bird.audio.public_id, 'video');
        if (newUrl && (!bird.audio.url || bird.audio.url !== newUrl)) {
          updates.audio = {
            ...bird.audio,
            url: newUrl
          };
          hasUpdates = true;
          console.log('URL audio actualizat:', newUrl);
        }
      }

      // Actualizează arrays
      for (const field of ['aspects', 'featherColors', 'habitats']) {
        if (bird[field] && Array.isArray(bird[field])) {
          let needsUpdate = false;
          const updatedArray = await Promise.all(bird[field].map(async (item) => {
            if (item.image && item.image.public_id) {
              console.log(`Procesez imagine din ${field}:`, item.image.public_id);
              const newUrl = await buildCloudinaryUrl(item.image.public_id);
              if (newUrl && (!item.image.url || item.image.url !== newUrl)) {
                needsUpdate = true;
                return {
                  ...item,
                  image: {
                    ...item.image,
                    url: newUrl
                  }
                };
              }
            }
            return item;
          }));
          
          if (needsUpdate) {
            updates[field] = updatedArray;
            hasUpdates = true;
          }
        }
      }

      if (hasUpdates) {
        await db.collection('birds').updateOne(
          { _id: bird._id },
          { $set: updates }
        );
        console.log('URL-uri actualizate pentru:', bird.name);
      } else {
        console.log('Nu sunt necesare actualizări pentru:', bird.name);
      }
    }

    console.log('\nActualizare completă!');
    process.exit(0);
  } catch (err) {
    console.error('Eroare la actualizare:', err);
    process.exit(1);
  }
}

updateCloudinaryUrls(); 