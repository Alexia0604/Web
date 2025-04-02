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

// Salvează scorul utilizatorului (necesită autentificare)
// POST /api/quiz/save-score
router.post('/save-score', requireUser, async (req, res) => {
  console.log('DATE PRIMITE:', {
    body: req.body,
    user: req.user ? req.user._id : 'Utilizator NEAUTENTIFICAT',
    headers: req.headers
  });

  try {
    // Verifică explicit datele
    if (!req.user) {
      return res.status(401).json({ message: 'Utilizator neautentificat' });
    }

    const { score, questionsAnswered, correctAnswers } = req.body;

    // Validări suplimentare
    if (score === undefined || questionsAnswered === undefined || correctAnswers === undefined) {
      return res.status(400).json({ 
        message: 'Date incomplete',
        primit: req.body
      });
    }

    const quizScore = new QuizScore({
      userId: req.user._id,
      score,
      questionsAnswered,
      correctAnswers,
      date: new Date()
    });

    await quizScore.save();

    res.json({ 
      message: 'Scor salvat cu succes',
      scoreId: quizScore._id
    });
  } catch (error) {
    console.error('EROARE COMPLETĂ:', error);
    res.status(500).json({ 
      message: 'Eroare la salvarea scorului', 
      detalii: error.message 
    });
  }
});

// Obține istoricul scorurilor pentru utilizatorul autentificat
// GET /api/quiz/scores
router.get('/scores', requireUser, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Găsim toate scorurile utilizatorului, ordonate după dată (cele mai recente primul)
    const scores = await QuizScore.find({ userId })
      .sort({ date: -1 })
      .limit(10); // Limităm la ultimele 10 pentru performanță
    
    res.json(scores);
  } catch (error) {
    console.error('Eroare la obținerea scorurilor:', error);
    res.status(500).json({ message: 'Eroare la obținerea scorurilor' });
  }
});

// Obține cele mai bune scoruri din toate timpurile
// GET /api/quiz/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    // Găsim cele mai bune scoruri, grupate după utilizator
    const leaderboard = await QuizScore.aggregate([
      // Grupează după utilizator și găsește scorul maxim
      {
        $group: {
          _id: '$userId',
          bestScore: { $max: '$score' },
          totalGames: { $sum: 1 },
          bestScoreDate: { $first: '$date' }
        }
      },
      // Sortează după cel mai bun scor, descrescător
      { $sort: { bestScore: -1 } },
      // Limitează la primii 10 jucători
      { $limit: 10 },
      // Obține detaliile utilizatorului
      {
        $lookup: {
          from: 'users', // numele colecției
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      // Restructurează rezultatul
      {
        $project: {
          _id: 1,
          bestScore: 1,
          totalGames: 1,
          bestScoreDate: 1,
          username: { $arrayElemAt: ['$userDetails.username', 0] }
        }
      }
    ]);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Eroare la obținerea clasamentului:', error);
    res.status(500).json({ message: 'Eroare la obținerea clasamentului' });
  }
});

module.exports = router;