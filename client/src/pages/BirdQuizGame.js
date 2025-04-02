// src/pages/BirdQuizGame.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Componenta principală a jocului
const BirdQuizGame = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // State-uri pentru joc
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answerResult, setAnswerResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  
  // Referințe
  const audioRef = useRef(null);
  
  // URL-ul de bază pentru API
  const API_URL = 'http://localhost:5000/api';
  
  // Funcție pentru a rezolva URL-ul resurselor
  const resolveResourceUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/images/${url}`;
  };
  
  // Încarcă întrebările pentru quiz
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/quiz/questions`);
        
        if (response.data && response.data.length > 0) {
          setQuestions(response.data);
          setError(null);
        } else {
          setError('Nu am putut încărca întrebări pentru quiz. Te rugăm să încerci din nou.');
          setQuestions([]);
        }
      } catch (err) {
        setError('Eroare la încărcarea întrebărilor. Te rugăm să încerci din nou.');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  // Manipularea sunetului pentru întrebările audio
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      
      if (currentQuestion.questionType === 'audio' && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = resolveResourceUrl(currentQuestion.resourceUrl);
        audioRef.current.load();
        setAudioPlaying(false);
      }
    }
    
    // Curățare
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentQuestionIndex, questions]);
  
  // Obține întrebarea curentă
  const getCurrentQuestion = () => {
    return questions.length > 0 && currentQuestionIndex < questions.length 
      ? questions[currentQuestionIndex] 
      : null;
  };
  
  // Funcție pentru a selecta o opțiune
  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };
  
  // Verifică răspunsul utilizatorului
  const checkAnswer = async () => {
    if (!selectedOption || answerChecked) return;
    
    try {
      const currentQuestion = getCurrentQuestion();
      
      // Găsește opțiunea selectată pentru a obține textul
      const selectedOptionObj = currentQuestion.options.find(opt => opt._id === selectedOption);
      
      const response = await axios.post(`${API_URL}/quiz/check-answer`, {
        questionId: currentQuestion._id,
        optionId: selectedOption,
        optionText: selectedOptionObj ? selectedOptionObj.text : null
      });
      
      const { isCorrect, explanation } = response.data;
      
      setAnswerChecked(true);
      
      if (isCorrect) {
        setScore(score + 1);
        setAnswerResult({
          correct: true,
          message: 'Răspuns corect! ' + (explanation || '')
        });
      } else {
        setLives(lives - 1);
        setAnswerResult({
          correct: false,
          message: 'Răspuns greșit! ' + (explanation || '')
        });
        
        // Verifică dacă jocul s-a terminat
        if (lives - 1 <= 0) {
          setGameOver(true);
        }
      }
    } catch (err) {
      setError('Nu am putut verifica răspunsul. Te rugăm să încerci din nou.');
    }
  };
  
  // Treci la următoarea întrebare
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setAnswerChecked(false);
      setAnswerResult(null);
      setAudioPlaying(false);
    } else {
      // Jocul s-a terminat, toate întrebările au fost parcurse
      setGameOver(true);
    }
  };
  
  // Repornește jocul
  const restartGame = async () => {
    try {
      setLoading(true);
      
      // Încercăm să salvăm scorul, dar nu ne blocăm dacă eșuează
      if (isAuthenticated && score > 0) {
        try {
          console.log('Încerc să salvez scorul:', {
            score,
            questionsAnswered: currentQuestionIndex + 1,
            correctAnswers: score
          });
      
          const response = await axios.post(`${API_URL}/quiz/save-score`, {
            score,
            questionsAnswered: currentQuestionIndex + 1,
            correctAnswers: score
          }, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          });
      
          console.log('Răspuns salvare scor:', response.data);
        } catch (saveError) {
          console.error('EROARE SALVARE SCOR:', {
            errorResponse: saveError.response ? saveError.response.data : null,
            errorMessage: saveError.message,
            fullError: saveError
          });
        }
      }
      
      // Încarcă noi întrebări
      const response = await axios.get(`${API_URL}/quiz/questions`);
      
      // Resetează starea jocului
      setQuestions(response.data);
      setCurrentQuestionIndex(0);
      setLives(3);
      setScore(0);
      setSelectedOption(null);
      setAnswerChecked(false);
      setAnswerResult(null);
      setGameOver(false);
      setAudioPlaying(false);
      setError(null);
    } catch (err) {
      setError('Nu am putut reporni jocul. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };
  
  // Redă sunetul pentru întrebările audio
  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
        setAudioPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setAudioPlaying(true);
            })
            .catch(() => {
              setAudioPlaying(false);
            });
        }
      }
    }
  };
  
  // Renderează conținutul în funcție de tipul întrebării
  const renderQuestionContent = (question) => {
    if (!question) return null;
    
    switch (question.questionType) {
      case 'image':
        return (
          <div className="w-full flex justify-center my-4">
            <img 
              src={resolveResourceUrl(question.resourceUrl)} 
              alt="Bird quiz" 
              className="max-w-full max-h-64 object-contain rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder-bird.png';
              }}
            />
          </div>
        );
        
      case 'audio':
        return (
          <div className="w-full flex justify-center my-4">
            <button
              onClick={toggleAudio}
              className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors"
              disabled={answerChecked}
            >
              {audioPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            <audio 
              ref={audioRef}
              onEnded={() => setAudioPlaying(false)}
            />
          </div>
        );
        
      case 'habitat':
      case 'general':
      default:
        return null;
    }
  };
  
  // Pagina de loading
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-blue-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Se încarcă jocul...</p>
        </div>
      </div>
    );
  }
  
  // Pagina de eroare
  if (error) {
    return (
      <div className="min-h-screen w-full bg-blue-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xl text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = getCurrentQuestion();
  
  // Pagina de final joc
  // Pagina de final joc
if (gameOver) {
  return (
    <div className="min-h-screen w-full bg-blue-100 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold mb-4">Joc terminat!</h2>
        <p className="text-xl mb-2">Scor final: {score}</p>
        <p className="text-lg mb-6">Întrebări răspunse: {currentQuestionIndex + 1}</p>
        
        {/* Păstrează doar această secțiune de butoane, care include "Istoricul tău" */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button 
            onClick={restartGame} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Joacă din nou
          </button>
          <button 
            onClick={() => navigate('/encyclopedia')} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Înapoi la Enciclopedie
          </button>
          {isAuthenticated && (
            <button 
              onClick={() => navigate('/quiz-history')} 
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              Istoricul tău
            </button>
          )}
        </div>
        
        {!isAuthenticated && (
          <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800">
              Autentifică-te pentru a-ți salva scorul și pentru a vedea clasamentul!
            </p>
            <button 
              onClick={() => navigate('/login')} 
              className="mt-2 px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              Autentificare
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
  
  // Pagina principală de joc
  return (
    <div className="min-h-screen w-full bg-blue-100">
      <div className="p-6 max-w-3xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-4 text-center">Quiz Păsări</h1>
        
        {/* Bara de progres și informații */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            {[...Array(3)].map((_, index) => (
              <svg 
                key={index} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill={index < lives ? "currentColor" : "none"} 
                stroke="currentColor"
                className={`w-8 h-8 ${index < lives ? "text-red-500" : "text-gray-300"}`}
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ))}
          </div>
          
          <div className="text-lg font-medium">
            Scor: {score}
          </div>
          
          <div className="text-sm text-gray-600">
            Întrebarea {currentQuestionIndex + 1} din {questions.length}
          </div>
        </div>
        
        {/* Întrebarea curentă */}
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h2>
              
              {/* Conținutul întrebării (imagine sau audio) */}
              {renderQuestionContent(currentQuestion)}
              
              {/* Opțiunile de răspuns */}
              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option._id}
                    onClick={() => !answerChecked && handleOptionSelect(option._id)}
                    disabled={answerChecked}
                    className={`w-full p-3 text-left rounded-lg transition-colors ${
                      selectedOption === option._id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    } ${
                      answerChecked && answerResult
                        ? (answerResult.correct && selectedOption === option._id)
                          ? 'bg-green-100 border-2 border-green-500'
                          : (!answerResult.correct && selectedOption === option._id)
                            ? 'bg-red-100 border-2 border-red-500'
                            : ''
                        : ''
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Feedback pentru răspuns și butoane de acțiuni */}
            <div className="p-4 bg-gray-50 border-t">
              {!answerChecked ? (
                <button
                  onClick={checkAnswer}
                  disabled={!selectedOption}
                  className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verifică răspunsul
                </button>
              ) : (
                <div>
                  <div className={`p-3 mb-4 rounded-lg ${
                    answerResult.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-medium">
                      {answerResult.correct ? '✓ Corect!' : '✗ Greșit!'}
                    </p>
                    <p>{answerResult.message}</p>
                  </div>
                  
                  <button
                    onClick={nextQuestion}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {currentQuestionIndex < questions.length - 1 
                      ? 'Următoarea întrebare' 
                      : 'Finalizează jocul'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirdQuizGame;