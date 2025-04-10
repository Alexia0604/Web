const mongoose = require('mongoose');

const birdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  scientificName: {
    type: String,
    required: true
  },
  englishName: {
    type: String,
    required: true
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
  image: {
    url: String,
    public_id: String,
    filename: String
  },
  audio: {
    url: String,
    public_id: String,
    filename: String
  },
  aspects: [{
    title: String,
    description: String,
    image: {
      url: String,
      public_id: String,
      filename: String
    }
  }],
  featherColors: [{
    color: String,
    description: String,
    image: {
      url: String,
      public_id: String,
      filename: String
    }
  }],
  habitats: [{
    name: String,
    description: String,
    image: {
      url: String,
      public_id: String,
      filename: String
    }
  }]
}, {
  timestamps: true,
  collection: 'birds'
});

module.exports = mongoose.model('Bird', birdSchema, 'birds');