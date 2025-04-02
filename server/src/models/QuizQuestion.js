const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Textul întrebării este obligatoriu'],
    trim: true
  },
  questionType: {
    type: String,
    enum: ['image', 'audio', 'habitat', 'general'],
    required: [true, 'Tipul întrebării este obligatoriu']
  },
  // Referință la pasărea asociată (poate fi null pentru întrebări generale)
  birdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bird',
    required: function() {
      return this.questionType !== 'general';
    }
  },
  resourceUrl: {
    type: String,
    // Obligatoriu pentru tipurile image și audio
    required: function() {
      return this.questionType === 'image' || this.questionType === 'audio';
    }
  },
  options: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId() // Asigură ID-uri consistente
      },
      text: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }
  ],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  // Informație suplimentară pentru a fi afișată după răspuns
  explanation: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Asigură-te că avem cel puțin 2 opțiuni și exact 1 răspuns corect
QuizQuestionSchema.pre('save', function(next) {
  if (this.options.length < 2) {
    return next(new Error('Fiecare întrebare trebuie să aibă cel puțin 2 opțiuni'));
  }
  
  const correctAnswers = this.options.filter(option => option.isCorrect);
  if (correctAnswers.length !== 1) {
    return next(new Error('Fiecare întrebare trebuie să aibă exact un răspuns corect'));
  }
  
  next();
});

// Specificăm explicit numele colecției pentru a evita probleme de case-sensitivity
module.exports = mongoose.model('QuizQuestion', QuizQuestionSchema, 'quizQuestions');