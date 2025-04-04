// routes/quizRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');

// Importarea modelelor cu căi absolute pentru a evita probleme de cale
const QuizQuestion = require(path.join(__dirname, '../models/QuizQuestion'));
const QuizScore = require(path.join(__dirname, '../models/QuizScore'));

// Importă corect middleware-ul de autentificare
const { authenticate, requireUser } = require('../middleware/authMiddleware');

// Aplică middleware-ul de autentificare pentru toate rutele
router.use(authenticate);

// Obține un set de întrebări random pentru quiz
// GET /api/quiz/questions
router.get('/questions', async (req, res) => {
  try {
    // Obține toate întrebările
    const questions = await QuizQuestion.find({})
      .populate('birdId', 'name scientificName englishName family order');
    
    // Amestecă întrebările în ordine aleatorie
    const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
    
    // Procesează întrebările pentru a ascunde răspunsurile corecte
    const safeQuestions = shuffledQuestions.map(q => {
      const question = q.toObject();
      
      // Păstrăm ID-urile originale dar ascundem care e răspunsul corect
      if (question.options && Array.isArray(question.options)) {
        question.options = question.options.map(opt => ({
          _id: opt._id.toString(), // Convertim explicit ObjectId la string
          text: opt.text
        }));
      }
      
      return question;
    });
    
    res.json(safeQuestions);
  } catch (error) {
    console.error('Eroare la încărcarea întrebărilor:', error);
    res.status(500).json({ message: 'Eroare la încărcarea întrebărilor' });
  }
});

// Verifică răspunsul dat la o întrebare
// POST /api/quiz/check-answer
router.post('/check-answer', async (req, res) => {
  try {
    // Permite verificarea prin ID sau prin text
    const { questionId, optionId, optionText } = req.body;
    
    if (!questionId || (!optionId && !optionText)) {
      return res.status(400).json({ 
        message: 'ID-ul întrebării și identificatorul opțiunii sunt obligatorii' 
      });
    }
    
    // Găsim întrebarea în baza de date
    const question = await QuizQuestion.findById(questionId);
    
    if (!question) {
      return res.status(404).json({ message: 'Întrebarea nu a fost găsită' });
    }
    
    // Găsim opțiunea selectată
    let selectedOption;
    
    if (optionText) {
      // Caută după text
      selectedOption = question.options.find(opt => opt.text === optionText);
    } else {
      // Caută după ID
      selectedOption = question.options.find(opt => opt._id.toString() === optionId);
    }
    
    if (!selectedOption) {
      return res.status(404).json({ message: 'Opțiunea nu a fost găsită' });
    }
    
    // Găsim opțiunea corectă
    const correctOption = question.options.find(opt => opt.isCorrect === true);
    
    if (!correctOption) {
      return res.status(500).json({ message: 'Eroare internă: nu există opțiune corectă' });
    }
    
    // Returnează rezultatul
    res.json({
      isCorrect: selectedOption.isCorrect === true,
      correctOptionId: correctOption._id.toString(),
      explanation: question.explanation || 'Nu există explicație suplimentară.'
    });
    
  } catch (error) {
    console.error('Eroare la verificarea răspunsului:', error);
    res.status(500).json({ message: 'Eroare la verificarea răspunsului' });
  }
});

// Salvează scorul unui quiz
router.post('/save-score', requireUser, async (req, res) => {
  try {
    const { score, questionsAnswered, correctAnswers } = req.body;

    // Validare date
    if (score === undefined || questionsAnswered === undefined || correctAnswers === undefined) {
      return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii: score, questionsAnswered, correctAnswers' });
    }

    // Creare și salvare scor nou
    const quizScore = new QuizScore({
      userId: req.user._id,
      score: score,
      questionsAnswered: questionsAnswered,
      correctAnswers: correctAnswers,
      date: new Date()
    });

    await quizScore.save();

    res.status(201).json({
      message: 'Scor salvat cu succes',
      score: quizScore
    });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la salvarea scorului', error: error.message });
  }
});

// Obține scorurile unui utilizator
router.get('/scores', requireUser, async (req, res) => {
  try {
    const scores = await QuizScore.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(10);
    
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la obținerea scorurilor', error: error.message });
  }
});

// Obține clasamentul global
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await QuizScore.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $project: {
          _id: 1,
          score: 1,
          questionsAnswered: 1,
          correctAnswers: 1,
          date: 1,
          username: { $arrayElemAt: ['$userDetails.username', 0] }
        }
      },
      { $sort: { score: -1, date: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la obținerea clasamentului' });
  }
});

module.exports = router;