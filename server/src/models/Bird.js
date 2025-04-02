const mongoose = require('mongoose');

const BirdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  audio: {
    type: String
  },
  scientificName: {
    type: String,
    required: true,
    trim: true
  },
  englishName: {
    type: String,
    required: true,
    trim: true
  },
  family: {
    type: String,
    required: true
  },
  order: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  aspects: [{
    name: String,
    image: String
  }],
  featherColors: [{
    name: String,
    image: String
  }],
  habitats: [{
    name: String,
    image: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Bird', BirdSchema);