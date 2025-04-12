// src/pages/user/Favorites.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Funcție pentru a rezolva URL-ul imaginii - identică cu cea din BirdEncyclopedia
const resolveImageUrl = (bird, field = 'imageUrl') => {
  if (!bird) return '/images/placeholder-bird.png';
  
  const imageFields = [field, 'image', 'imageUrl'];
  for (let imageField of imageFields) {
    const url = bird[imageField];
    
    // Verificare pentru structura nested
    if (typeof url === 'object' && url !== null) {
      if (url.url && typeof url.url === 'string') {
        if (url.url.startsWith('http')) return url.url;
        return url.url.startsWith('/') ? url.url : `/images/${url.url}`;
      }
      continue;
    }
    
    // Verificare pentru string direct
    if (url && typeof url === 'string') {
      if (url.startsWith('http')) return url;
      return url.startsWith('/') ? url : `/images/${url}`;
    }
  }
  
  return '/images/placeholder-bird.png';
};

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBird, setSelectedBird] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const { user } = useAuth();

  // Fetch favorites from API
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/birds/favorites', {
          withCredentials: true
        });
        setFavorites(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Eroare la încărcarea favoritelor:', err);
        setError('Eroare la încărcarea păsărilor favorite');
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Update audio source when bird is selected
  useEffect(() => {
    if (selectedBird && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current.src = selectedBird.audioUrl || selectedBird.audio || '';
      audioRef.current.load();
    }
  }, [selectedBird]);

  // Cleanup audio on unmount
  useEffect(() => {
    const audioElement = audioRef.current;
    return () => {
      if (audioElement && isPlaying) {
        audioElement.pause();
      }
    };
  }, [isPlaying]);

  // Toggle audio playback
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Sunetul a început să se redea.");
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Eroare la redarea sunetului:", error);
              setIsPlaying(false);
            });
        }
      }
    } else {
      console.error("Referința audio nu este definită.");
    }
  };

  // Close details page
  const handleClose = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setSelectedBird(null);
  };

  // Remove from favorites
  const removeFavorite = async (birdId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/birds/favorites/${birdId}`, {
        withCredentials: true
      });
      
      // Actualizare stare locală
      setFavorites(favorites.filter(bird => bird._id !== birdId));
      
      // Dacă pasărea selectată este cea ștearsă, închide modalul
      if (selectedBird && selectedBird._id === birdId) {
        handleClose();
      }
    } catch (err) {
      console.error('Eroare la eliminarea păsării din favorite:', err);
      setError('Eroare la eliminarea păsării din favorite');
    }
  };

  // Bird Detail Page Component - similar cu cea din BirdEncyclopedia
  const BirdDetailPage = ({ bird, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-blue-100 w-full max-w-md mx-auto h-full overflow-y-auto">
          <div className="p-4 flex justify-between items-center bg-blue-100 border-b border-blue-200">
            <h2 className="text-xl font-semibold text-gray-700">{bird.name.toUpperCase()}</h2>
            <div className="flex items-center">
              <button
                onClick={(e) => removeFavorite(bird._id, e)}
                className="mr-4 text-2xl focus:outline-none"
                aria-label="Elimină de la favorite"
              >
                <span className="text-red-500">❤️</span>
              </button>
              <button
                onClick={onClose}
                className="text-3xl text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 bg-white relative">
            <div className="w-full flex items-center justify-center">
              <img
                src={resolveImageUrl(bird)}
                alt={bird.name}
                className="max-w-full max-h-64 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder-bird.png';
                }}
              />
            </div>
            <div className="flex justify-center mt-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 mx-1"></div>
              <div className="h-2 w-2 rounded-full bg-gray-300 mx-1"></div>
            </div>

            {(bird.audioUrl || bird.audio) && (
              <button
                onClick={toggleAudio}
                className="absolute bottom-6 right-6 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 5.14v14l11-7l-11-7z"></path>
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="p-4 bg-white mt-2 rounded">
            <p className="text-gray-700">{bird.description}</p>
          </div>

          <div className="mt-2 bg-white rounded">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="p-3 border border-gray-200">Denumire științifică</td>
                  <td className="p-3 border border-gray-200 font-medium">{bird.scientificName}</td>
                </tr>
                <tr>
                  <td className="p-3 border border-gray-200">Denumirea în engleză</td>
                  <td className="p-3 border border-gray-200 font-medium">{bird.englishName}</td>
                </tr>
                <tr>
                  <td className="p-3 border border-gray-200">Familia</td>
                  <td className="p-3 border border-gray-200 font-medium">{bird.family}</td>
                </tr>
                <tr>
                  <td className="p-3 border border-gray-200">Ordin</td>
                  <td className="p-3 border border-gray-200 font-medium">{bird.order}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {bird.aspects && bird.aspects.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded">
              <h3 className="text-xl font-semibold mb-4">Aspect</h3>
              <div className="flex justify-center">
                {bird.aspects.map((aspect, index) => (
                  <div key={index} className="text-center mx-2">
                    <div className="w-16 h-16 mx-auto flex items-center justify-center">
                      <img
                        src={resolveImageUrl(aspect, 'imageUrl')}
                        alt={aspect.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-bird.png';
                        }}
                      />
                    </div>
                    <p className="mt-2">{aspect.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bird.featherColors && bird.featherColors.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded">
              <h3 className="text-xl font-semibold mb-4">Culoarea penajului</h3>
              <div className="flex justify-around">
                {bird.featherColors.map((color, index) => (
                  <div key={index} className="text-center">
                    <div className="w-10 h-20 mx-auto flex items-center justify-center">
                      <img
                        src={resolveImageUrl(color, 'imageUrl')}
                        alt={color.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-bird.png';
                        }}
                      />
                    </div>
                    <p className="mt-2">{color.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bird.habitats && bird.habitats.length > 0 && (
            <div className="mt-4 bg-white p-4 rounded mb-4">
              <h3 className="text-xl font-semibold mb-4">Habitat</h3>
              <div className="flex justify-around flex-wrap">
                {bird.habitats.map((habitat, index) => (
                  <div key={index} className="text-center m-2">
                    <div className="w-24 h-16 mx-auto flex items-center justify-center">
                      <img
                        src={resolveImageUrl(habitat, 'imageUrl')}
                        alt={habitat.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-bird.png';
                        }}
                      />
                    </div>
                    <p className="mt-2">{habitat.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-blue-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-center">Păsările mele favorite</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-blue-100">
      <div className="p-6 max-w-6xl mx-auto pt-24">
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
        />

        <h1 className="text-3xl font-bold mb-8 text-center">Păsările mele favorite</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-12 bg-white bg-opacity-80 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-400">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <p className="text-gray-600 mb-4">Nu ai nicio pasăre favorită încă.</p>
            <button 
              onClick={() => navigate('/encyclopedia')}
              className="px-4 py-2 text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
            >
              Explorează enciclopedia de păsări
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map(bird => (
              <div
                key={bird._id}
                className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <button
                  onClick={() => setSelectedBird(bird)}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-full h-48 overflow-hidden bg-white">
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <img
                        src={resolveImageUrl(bird)}
                        alt={bird.name}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder-bird.png';
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-center">{bird.name}</h2>
                  </div>
                </button>

                <button
                  onClick={(e) => removeFavorite(bird._id, e)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white bg-opacity-70 flex items-center justify-center shadow focus:outline-none hover:bg-opacity-90 transition-all"
                  aria-label="Elimină de la favorite"
                >
                  <span className="text-red-500 text-xl">❤️</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedBird && (
          <BirdDetailPage
            bird={selectedBird}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
};

export default Favorites;