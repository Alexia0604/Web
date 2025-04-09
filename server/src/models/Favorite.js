const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bird: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bird',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Asigură-te că un utilizator nu poate adăuga aceeași pasăre de mai multe ori la favorite
favoriteSchema.index({ user: 1, bird: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema); 