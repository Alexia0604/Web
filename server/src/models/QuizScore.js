// models/QuizScore.js
const mongoose = require('mongoose');

const QuizScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  questionsAnswered: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Adăugăm indice pentru a optimiza căutările după userId
QuizScoreSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('QuizScore', QuizScoreSchema);