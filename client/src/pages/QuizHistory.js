// src/pages/QuizHistory.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const QuizHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [userScores, setUserScores] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('history');
  
  // URL-ul de bază pentru API
  const API_URL = 'http://localhost:5000/api';
  
  useEffect(() => {
    // Redirecționează utilizatorii neautentificați către login
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: '/quiz-history', message: 'Trebuie să te autentifici pentru a vedea istoricul scorurilor' }
      });
      return;
    }
    
    // Încarcă datele
    const fetchData = async () => {
      setLoading(true);
      try {
        // Încarcă istoricul scorurilor utilizatorului
        const scoresResponse = await axios.get(`${API_URL}/quiz/scores`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (scoresResponse.data && Array.isArray(scoresResponse.data)) {
          setUserScores(scoresResponse.data);
        } else {
          console.error('Format neașteptat pentru scoruri:', scoresResponse.data);
          setError('Format neașteptat pentru date');
        }
        
        // Încarcă clasamentul general
        const leaderboardResponse = await axios.get(`${API_URL}/quiz/leaderboard`);
        setLeaderboard(leaderboardResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Eroare la încărcarea datelor:', err);
        setError('Nu am putut încărca datele. Te rugăm să încerci din nou.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate]);
  
  // Formatează data
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ro-RO', options);
  };
  
  // Calculează rata de succes
  const calculateSuccessRate = (correct, total) => {
    if (total === 0) return '0%';
    return `${Math.round((correct / total) * 100)}%`;
  };
  
  // Pagina de loading
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-blue-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Se încarcă istoricul...</p>
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
  
  return (
    <div className="min-h-screen w-full bg-blue-100">
      <div className="p-6 max-w-4xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-6 text-center">Statistici Quiz</h1>
        
        {/* Tabs pentru navigare */}
        <div className="flex mb-6 border-b border-gray-300">
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab('history')}
          >
            Istoricul tău
          </button>
          <button 
            className={`py-2 px-4 font-medium ${activeTab === 'leaderboard' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab('leaderboard')}
          >
            Clasament
          </button>
        </div>
        
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Istoricul scorurilor tale</h2>
            
            {userScores.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nu ai încă niciun scor înregistrat. Joacă un quiz pentru a începe!</p>
                <button 
                  onClick={() => navigate('/games')}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Joacă acum
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left">Data</th>
                      <th className="py-3 px-4 text-center">Scor</th>
                      <th className="py-3 px-4 text-center">Întrebări</th>
                      <th className="py-3 px-4 text-center">Răspunsuri corecte</th>
                      <th className="py-3 px-4 text-center">Rată de succes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userScores.map((score, index) => (
                      <tr key={score._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4">{formatDate(score.date)}</td>
                        <td className="py-3 px-4 text-center">{score.score}</td>
                        <td className="py-3 px-4 text-center">{score.questionsAnswered}</td>
                        <td className="py-3 px-4 text-center">{score.correctAnswers}</td>
                        <td className="py-3 px-4 text-center">
                          {calculateSuccessRate(score.correctAnswers, score.questionsAnswered)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => navigate('/games')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Înapoi la quiz
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Clasament global</h2>
            
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nu există încă scoruri înregistrate. Fii primul care intră în clasament!</p>
                <button 
                  onClick={() => navigate('/games')}
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Joacă acum
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left">Poziție</th>
                      <th className="py-3 px-4 text-left">Utilizator</th>
                      <th className="py-3 px-4 text-center">Cel mai bun scor</th>
                      <th className="py-3 px-4 text-center">Data recordului</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={entry._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-3 px-4">
                          {index === 0 && <span className="text-2xl">🥇</span>}
                          {index === 1 && <span className="text-2xl">🥈</span>}
                          {index === 2 && <span className="text-2xl">🥉</span>}
                          {index > 2 && <span>{index + 1}</span>}
                        </td>
                        <td className="py-3 px-4">{entry.username}</td>
                        <td className="py-3 px-4 text-center font-semibold">{entry.score}</td>
                        <td className="py-3 px-4 text-center">{formatDate(entry.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <button 
                onClick={() => navigate('/games')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Înapoi la quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHistory;