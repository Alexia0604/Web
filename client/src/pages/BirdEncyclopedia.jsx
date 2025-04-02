import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllBirds, getBirdsByIds } from '../services/birdService';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Funcție pentru a rezolva URL-ul imaginii
const resolveImageUrl = (bird, field = 'imageUrl') => {
  const imageFields = [field, 'image', 'imageUrl'];
  for (let imageField of imageFields) {
    const url = bird[imageField];
    if (url) {
      if (url.startsWith('http')) return url;
      return url.startsWith('/') ? url : `/images/${url}`;
    }
  }
  return '/images/placeholder-bird.png';
};

const resolveAudioUrl = (bird) => {
  const audioFields = ['audioUrl', 'audio'];
  for (let audioField of audioFields) {
    const url = bird[audioField];
    if (url) {
      if (url.startsWith('http')) return url;
      return url.startsWith('/') ? url : `/images/${url}`;
    }
  }
  return '';
};

const BirdEncyclopedia = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBird, setSelectedBird] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [favorites, setFavorites] = useState([]);
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    pages: 0
  });
  
  // Utilizăm hook-ul de autentificare pentru a obține informații despre utilizator
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  // Funcție pentru a verifica dacă utilizatorul este autentificat (user sau admin)
  const canManageFavorites = isAuthenticated || isAdmin;

  // Curăță filtrele
  const clearFilters = () => {
    setIsFiltered(false);
    navigate('/encyclopedia', { replace: true });
    setPagination(prev => ({
      ...prev,
      page: 1,
      total: 0,
      pages: 0
    }));
  };

  // Fetch birds from API with pagination
  const fetchBirds = useCallback(async () => {
    try {
      setLoading(true);

      const searchParams = new URLSearchParams(location.search);
      const filteredBirdIds = searchParams.get('birds');
      const aspectFilter = searchParams.get('aspect');
      const featherColorFilter = searchParams.get('featherColor');
      const habitatFilter = searchParams.get('habitat');

      let response;
      if (filteredBirdIds) {
        response = await getBirdsByIds(filteredBirdIds.split(','));
        setIsFiltered(true);
      } else {
        response = await getAllBirds(pagination.page, pagination.limit);
      }

      let birdData = Array.isArray(response?.birds)
        ? response.birds
        : (Array.isArray(response) ? response : []);

      if (aspectFilter) {
        birdData = birdData.filter(bird =>
          bird.aspects?.some(aspect => aspect.name === aspectFilter)
        );
      }
      if (featherColorFilter) {
        birdData = birdData.filter(bird =>
          bird.featherColors?.some(color => color.name === featherColorFilter)
        );
      }
      if (habitatFilter) {
        birdData = birdData.filter(bird =>
          bird.habitats?.some(habitat => habitat.name === habitatFilter)
        );
      }

      setBirds(birdData);

      if (!filteredBirdIds && response.pagination) {
        setPagination({
          total: response.pagination.total,
          page: response.pagination.page,
          limit: response.pagination.limit,
          pages: response.pagination.pages
        });
      } else {
        setPagination(prev => ({
          ...prev,
          total: birdData.length,
          pages: Math.ceil(birdData.length / pagination.limit)
        }));
      }

      setError(null);
    } catch (err) {
      console.error('Eroare la încărcarea păsărilor:', err);
      setError('Nu s-au putut încărca păsările. Vă rugăm să încercați din nou mai târziu.');
      setBirds([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, location.search, navigate]);

  // Fetch user's favorites from API
  const fetchUserFavorites = useCallback(async () => {
    // Verificăm dacă utilizatorul este autentificat
    if (canManageFavorites) {
      try {
        const res = await axios.get('http://localhost:5000/api/birds/favorites', {
          withCredentials: true
        });
        
        // Extragem doar ID-urile păsărilor favorite
        const favoriteIds = res.data.map(bird => bird._id);
        setFavorites(favoriteIds);
      } catch (err) {
        console.error('Eroare la încărcarea favoritelor:', err);
        // În caz de eroare, folosim localStorage ca backup
        const storedFavorites = localStorage.getItem('birdFavorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        } else {
          setFavorites([]);
        }
      }
    } else {
      // Utilizatorul nu este autentificat, resetăm favoritele
      setFavorites([]);
    }
  }, [canManageFavorites]);

  // Încărcăm păsările la montarea componentei și când se schimbă paginarea sau locația
  useEffect(() => {
    fetchBirds();
  }, [fetchBirds]);

  // Încărcăm favoritele utilizatorului la montarea componentei și când se schimbă starea de autentificare
  useEffect(() => {
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  // Change page
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Update audio source when bird is selected
  useEffect(() => {
    if (selectedBird && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      
      // Folosim funcția nouă pentru a obține URL-ul corect
      const audioUrl = resolveAudioUrl(selectedBird);
      console.log('URL audio rezolvat:', audioUrl); // Pentru debugging
      
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      } else {
        console.warn('Nu s-a găsit nicio sursă audio pentru această pasăre');
      }
    }
  }, [selectedBird]);

  // Cleanup audio on unmount or when playing state changes
  useEffect(() => {
    const audioElement = audioRef.current;
    return () => {
      if (audioElement && isPlaying) {
        audioElement.pause();
      }
    };
  }, [isPlaying]);

  // Filter birds based on search term
  const filteredBirds = birds.filter(bird =>
    bird.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle audio playback
  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioRef.current.src) {
        console.log('Sursă audio curentă:', audioRef.current.src);
      } else {
        console.warn('Elementul audio nu are o sursă setată');
      }
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Sunetul a început să se redea cu succes.");
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Eroare la redarea sunetului:", error);
              console.error("Detalii sursă audio:", audioRef.current.src);
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

  // Check if bird is in favorites
  const isFavorite = (birdId) => {
    return favorites.includes(birdId);
  };

  // Toggle favorite status using API
  const toggleFavorite = async (birdId, event) => {
    event.stopPropagation();
    
    // Verificăm dacă utilizatorul este autentificat
    if (!canManageFavorites) {
      // Dacă nu este autentificat, redirecționăm către pagina de login
      navigate('/login', { 
        state: { from: location.pathname, message: 'Trebuie să fii autentificat pentru a adăuga păsări la favorite' } 
      });
      return;
    }
    
    try {
      if (isFavorite(birdId)) {
        // Eliminăm din favorite
        await axios.delete(`http://localhost:5000/api/birds/favorites/${birdId}`, {
          withCredentials: true
        });
        
        // Actualizăm starea locală
        const updatedFavorites = favorites.filter(id => id !== birdId);
        setFavorites(updatedFavorites);
        
        // Actualizăm și localStorage ca backup
        localStorage.setItem('birdFavorites', JSON.stringify(updatedFavorites));
      } else {
        // Adăugăm la favorite
        await axios.post('http://localhost:5000/api/birds/favorites', {
          birdId: birdId
        }, {
          withCredentials: true
        });
        
        // Actualizăm starea locală
        const updatedFavorites = [...favorites, birdId];
        setFavorites(updatedFavorites);
        
        // Actualizăm și localStorage ca backup
        localStorage.setItem('birdFavorites', JSON.stringify(updatedFavorites));
      }
    } catch (err) {
      console.error('Eroare la actualizarea favoritelor:', err);
      
      // În caz de eroare, actualizăm doar starea locală pentru a oferi feedback utilizatorului
      if (isFavorite(birdId)) {
        const updatedFavorites = favorites.filter(id => id !== birdId);
        setFavorites(updatedFavorites);
        localStorage.setItem('birdFavorites', JSON.stringify(updatedFavorites));
      } else {
        const updatedFavorites = [...favorites, birdId];
        setFavorites(updatedFavorites);
        localStorage.setItem('birdFavorites', JSON.stringify(updatedFavorites));
      }
    }
  };

  // Bird Detail Page Component
  const BirdDetailPage = ({ bird, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-blue-100 w-full max-w-md mx-auto h-full overflow-y-auto">
          <div className="p-4 flex justify-between items-center bg-blue-100 border-b border-blue-200">
            <h2 className="text-xl font-semibold text-gray-700">{bird.name.toUpperCase()}</h2>
            <div className="flex items-center">
              {canManageFavorites && (
                <button
                  onClick={(e) => toggleFavorite(bird._id, e)}
                  className="mr-4 text-2xl focus:outline-none"
                  aria-label={isFavorite(bird._id) ? "Elimină de la favorite" : "Adaugă la favorite"}
                >
                  {isFavorite(bird._id) ? (
                    <span className="text-red-500">❤️</span>
                  ) : (
                    <span className="text-gray-400">🤍</span>
                  )}
                </button>
              )}
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

  return (
    <div className="min-h-screen w-full bg-blue-100">
      <div className="p-6 max-w-6xl mx-auto pt-24">
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
        />

        <h1 className="text-3xl font-bold mb-8 text-center">Enciclopedie de Păsări</h1>

        {isFiltered && (
          <div className="mb-6 bg-green-100 p-4 rounded-lg shadow-sm flex justify-between items-center">
            <p className="text-green-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Afișezi rezultatele filtrării ({birds.length} păsări găsite)
            </p>
            <button
              onClick={clearFilters}
              className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
            >
              Arată toate păsările
            </button>
          </div>
        )}

        <div className="mb-8 max-w-xl mx-auto">
          <div className="relative">
            <input
              type="text"
              id="searchBirds"
              name="searchBirds"
              placeholder="Caută păsări..."
              className="w-full p-4 pr-12 border border-green-200 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 transition-all bg-white bg-opacity-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-4 top-4 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
          </div>
        </div>

        {/* Banner-ul a fost eliminat conform cerințelor */}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Se încarcă păsările...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 bg-red-50 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-red-500">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-lg text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBirds.map(bird => (
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

                {/* Afișăm butonul de favorite doar pentru utilizatorii autentificați */}
                {canManageFavorites && (
                  <button
                    onClick={(e) => toggleFavorite(bird._id, e)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white bg-opacity-70 flex items-center justify-center shadow focus:outline-none hover:bg-opacity-90 transition-all"
                    aria-label={isFavorite(bird._id) ? "Elimină de la favorite" : "Adaugă la favorite"}
                  >
                    {isFavorite(bird._id) ? (
                      <span className="text-red-500 text-xl">❤️</span>
                    ) : (
                      <span className="text-gray-400 text-xl">🤍</span>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !error && birds.length > 0 && !isFiltered && (
          <div className="flex justify-center mt-8 mb-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 rounded bg-white text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              « Înapoi
            </button>

            <div className="mx-2 flex">
              {[...Array(pagination.pages).keys()].map(i => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    pagination.page === i + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 rounded bg-white text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Înainte »
            </button>
          </div>
        )}

        {!loading && !error && filteredBirds.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white bg-opacity-80 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-400">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-lg">Nu s-au găsit păsări care să corespundă căutării tale.</p>
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

export default BirdEncyclopedia;