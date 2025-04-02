import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Funcție pentru rezolvarea URL-urilor de imagini
const resolveImageUrl = (imagePath) => {
  // Dacă imaginea este deja un URL complet, returnează-l
  if (imagePath?.startsWith('http')) return imagePath;
  
  // Altfel, folosește URL-ul de bază pentru imagini
  return imagePath 
    ? (imagePath.startsWith('/') 
      ? imagePath 
      : `/images/${imagePath}`)
    : '/images/placeholder-bird.png';
};

const BirdFilter = () => {
  const navigate = useNavigate();
  const [aspect, setAspect] = useState('');
  const [featherColor, setFeatherColor] = useState('');
  const [habitat, setHabitat] = useState('');
  const [results, setResults] = useState([]);
  const [aspectIndex, setAspectIndex] = useState(0);
  const [featherColorIndex, setFeatherColorIndex] = useState(0);
  const [habitatIndex, setHabitatIndex] = useState(0);
  
  // State pentru opțiunile de filtrare din baza de date
  const [aspects, setAspects] = useState([]);
  const [featherColors, setFeatherColors] = useState([]);
  const [habitats, setHabitats] = useState([]);
  
  // State pentru loading
  const [loading, setLoading] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState(null);

  // Funcție pentru încărcarea opțiunilor de filtrare din backend
  const loadFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/birds/filter-options`);
      
      // Procesează imaginile pentru a avea URL-uri corecte
      const processedAspects = response.data.aspects.map(aspect => ({
        ...aspect,
        image: resolveImageUrl(aspect.image)
      }));
      
      const processedFeatherColors = response.data.featherColors.map(color => ({
        ...color,
        image: resolveImageUrl(color.image)
      }));
      
      const processedHabitats = response.data.habitats.map(habitat => ({
        ...habitat,
        image: resolveImageUrl(habitat.image)
      }));
      
      setAspects(processedAspects);
      setFeatherColors(processedFeatherColors);
      setHabitats(processedHabitats);
      
      setFiltersLoaded(true);
      setError(null);
    } catch (error) {
      console.error("Eroare la încărcarea opțiunilor de filtrare:", error);
      setError('Nu s-au putut încărca opțiunile de filtrare.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Funcție pentru filtrarea păsărilor
  const filterBirds = useCallback(async () => {
    if (!aspect && !featherColor && !habitat) {
      setResults([]);
      return;
    }
    
    try {
      setLoadingResults(true);
      
      // Construim parametrii pentru query
      const params = {};
      if (aspect) params.aspect = aspect;
      if (featherColor) params.featherColor = featherColor;
      if (habitat) params.habitat = habitat;
      
      const response = await axios.get(`${API_URL}/birds/filter`, { params });
      
      // Procesează păsările pentru a avea URL-uri corecte
      const processedResults = response.data.map(bird => ({
        ...bird,
        imageUrl: resolveImageUrl(bird.imageUrl || bird.image)
      }));
      
      setResults(processedResults);
    } catch (error) {
      console.error("Eroare la filtrarea păsărilor:", error);
      setError('Nu s-au putut filtra păsările.');
    } finally {
      setLoadingResults(false);
    }
  }, [aspect, featherColor, habitat]);

  // Încărcăm opțiunile de filtrare la prima randare
  useEffect(() => {
    loadFilterOptions();
  }, [loadFilterOptions]);

  // Actualizăm rezultatele doar când se apasă un buton sau la prima încărcare
  useEffect(() => {
    if (filtersLoaded) {
      filterBirds();
    }
  }, [filterBirds, aspect, featherColor, habitat, filtersLoaded]);

  // Funcții pentru navigarea prin opțiuni
  const prevAspect = () => {
    if (aspects.length > 0) {
      setAspectIndex((aspectIndex - 1 + aspects.length) % aspects.length);
    }
  };
  
  const nextAspect = () => {
    if (aspects.length > 0) {
      setAspectIndex((aspectIndex + 1) % aspects.length);
    }
  };
  
  const prevFeatherColor = () => {
    if (featherColors.length > 0) {
      setFeatherColorIndex((featherColorIndex - 1 + featherColors.length) % featherColors.length);
    }
  };
  
  const nextFeatherColor = () => {
    if (featherColors.length > 0) {
      setFeatherColorIndex((featherColorIndex + 1) % featherColors.length);
    }
  };
  
  const prevHabitat = () => {
    if (habitats.length > 0) {
      setHabitatIndex((habitatIndex - 1 + habitats.length) % habitats.length);
    }
  };
  
  const nextHabitat = () => {
    if (habitats.length > 0) {
      setHabitatIndex((habitatIndex + 1) % habitats.length);
    }
  };

  // Funcție pentru navigarea către pagina enciclopediei cu rezultatele filtrate
  const goToEncyclopedia = () => {
    if (results.length === 0) return;
    
    // Construiește parametrii de query pentru filtrare
    const queryParams = new URLSearchParams();
    
    // Adaugă ID-urile păsărilor
    queryParams.set('birds', results.map(bird => bird._id).join(','));
    
    // Adaugă criteriile de filtrare
    if (aspect) queryParams.set('aspect', aspect);
    if (featherColor) queryParams.set('featherColor', featherColor);
    if (habitat) queryParams.set('habitat', habitat);
    
    // Redirectăm către pagina enciclopediei cu parametrii de query
    navigate(`/encyclopedia?${queryParams.toString()}`);
  };

  // Rezolvare pentru problema cu imagini care clipesc/dispar
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/images/placeholder-bird.png';
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-100 pt-16">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Ce specie poate fi?
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="my-8 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">Se încarcă opțiunile de filtrare...</p>
            </div>
          ) : (
            <>
              {aspects.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Aspect</h2>
                  <div className="flex items-center justify-between">
                    <button onClick={prevAspect} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">←</button>
                    <button
                      onClick={() => setAspect(aspect === aspects[aspectIndex].name ? '' : aspects[aspectIndex].name)}
                      className={`p-3 ${aspect === aspects[aspectIndex].name ? 'bg-blue-200' : 'bg-gray-100'} rounded-lg hover:bg-blue-100 transition-colors`}
                    >
                      {aspects[aspectIndex].image ? (
                        <img 
                          src={aspects[aspectIndex].image} 
                          alt={aspects[aspectIndex].name} 
                          className="w-20 h-20 mx-auto object-contain"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-20 h-20 mx-auto flex items-center justify-center bg-gray-200">
                          <span className="text-gray-500">Fără imagine</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-600 mt-2 block text-center">{aspects[aspectIndex].name}</span>
                    </button>
                    <button onClick={nextAspect} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">→</button>
                  </div>
                </div>
              )}

              {featherColors.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Culoarea penajului</h2>
                  <div className="flex items-center justify-between">
                    <button onClick={prevFeatherColor} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">←</button>
                    <button
                      onClick={() => setFeatherColor(featherColor === featherColors[featherColorIndex].name ? '' : featherColors[featherColorIndex].name)}
                      className={`p-3 ${featherColor === featherColors[featherColorIndex].name ? 'bg-blue-200' : 'bg-gray-100'} rounded-lg hover:bg-blue-100 transition-colors`}
                    >
                      {featherColors[featherColorIndex].image ? (
                        <img 
                          src={featherColors[featherColorIndex].image} 
                          alt={featherColors[featherColorIndex].name} 
                          className="w-20 h-20 mx-auto object-contain"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-20 h-20 mx-auto flex items-center justify-center bg-gray-200">
                          <span className="text-gray-500">Fără imagine</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-600 mt-2 block text-center">{featherColors[featherColorIndex].name}</span>
                    </button>
                    <button onClick={nextFeatherColor} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">→</button>
                  </div>
                </div>
              )}

              {habitats.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Habitat</h2>
                  <div className="flex items-center justify-between">
                    <button onClick={prevHabitat} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">←</button>
                    <button
                      onClick={() => setHabitat(habitat === habitats[habitatIndex].name ? '' : habitats[habitatIndex].name)}
                      className={`p-3 ${habitat === habitats[habitatIndex].name ? 'bg-blue-200' : 'bg-gray-100'} rounded-lg hover:bg-blue-100 transition-colors`}
                    >
                      {habitats[habitatIndex].image ? (
                        <img 
                          src={habitats[habitatIndex].image} 
                          alt={habitats[habitatIndex].name} 
                          className="w-20 h-20 mx-auto object-contain"
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="w-20 h-20 mx-auto flex items-center justify-center bg-gray-200">
                          <span className="text-gray-500">Fără imagine</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-600 mt-2 block text-center">{habitats[habitatIndex].name}</span>
                    </button>
                    <button onClick={nextHabitat} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">→</button>
                  </div>
                </div>
              )}

              <button
                onClick={goToEncyclopedia}
                className="w-full bg-blue-500 text-white py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors"
                disabled={results.length === 0 || loadingResults}
              >
                {loadingResults ? 'Se încarcă...' : `${results.length} Rezultate`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirdFilter;