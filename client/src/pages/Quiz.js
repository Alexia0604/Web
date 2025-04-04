import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Quiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/quiz/questions');
        setQuestions(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Eroare la încărcarea întrebărilor');
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerClick = (selectedAnswer) => {
    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Eroare!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (showScore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-4">Quiz Finalizat!</h2>
          <p className="text-xl text-center mb-6">
            Ai obținut {score} din {questions.length} puncte!
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleRestart}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Încearcă din nou
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Înapoi la pagina principală
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-4">
            Întrebarea {currentQuestion + 1} din {questions.length}
          </h2>
          <p className="text-lg text-center mb-6">{questions[currentQuestion].question}</p>
        </div>

        <div className="space-y-4">
          {questions[currentQuestion].answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {answer}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz; 