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
  const [aspectIndex, setAspectIndex] = useState(-1); // Start with -1 to show neutral image
  const [featherColorIndex, setFeatherColorIndex] = useState(-1); // Start with -1 to show neutral image
  const [habitatIndex, setHabitatIndex] = useState(-1); // Start with -1 to show neutral image
  
  // State pentru opțiunile de filtrare din baza de date
  const [aspects, setAspects] = useState([]);
  const [featherColors, setFeatherColors] = useState([]);
  const [habitats, setHabitats] = useState([]);
  
  // State pentru loading
  const [loading, setLoading] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState(null);

  // Funcție pentru încărcarea tuturor păsărilor la început
  const loadAllBirds = useCallback(async () => {
    try {
      setLoadingResults(true);
      const response = await axios.get(`${API_URL}/birds/filter`);
      setResults(response.data);
    } catch (error) {
      console.error("Eroare la încărcarea păsărilor:", error);
      setError('Nu s-au putut încărca păsările.');
    } finally {
      setLoadingResults(false);
    }
  }, []);

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

  // Încărcăm toate păsările și opțiunile de filtrare la prima randare
  useEffect(() => {
    loadFilterOptions();
    loadAllBirds();
  }, [loadFilterOptions, loadAllBirds]);

  // Actualizăm rezultatele doar când se schimbă filtrele
  useEffect(() => {
    if (filtersLoaded && (aspect || featherColor || habitat)) {
      filterBirds();
    }
  }, [filterBirds, aspect, featherColor, habitat, filtersLoaded]);

  // Funcții pentru navigarea prin opțiuni
  const prevAspect = () => {
    if (aspects.length > 0) {
      const newIndex = (aspectIndex - 1 + aspects.length) % aspects.length;
      setAspectIndex(newIndex);
      setAspect(aspects[newIndex].name);
    }
  };
  
  const nextAspect = () => {
    if (aspects.length > 0) {
      const newIndex = (aspectIndex + 1) % aspects.length;
      setAspectIndex(newIndex);
      setAspect(aspects[newIndex].name);
    }
  };
  
  const prevFeatherColor = () => {
    if (featherColors.length > 0) {
      const newIndex = (featherColorIndex - 1 + featherColors.length) % featherColors.length;
      setFeatherColorIndex(newIndex);
      setFeatherColor(featherColors[newIndex].name);
    }
  };
  
  const nextFeatherColor = () => {
    if (featherColors.length > 0) {
      const newIndex = (featherColorIndex + 1) % featherColors.length;
      setFeatherColorIndex(newIndex);
      setFeatherColor(featherColors[newIndex].name);
    }
  };
  
  const prevHabitat = () => {
    if (habitats.length > 0) {
      const newIndex = (habitatIndex - 1 + habitats.length) % habitats.length;
      setHabitatIndex(newIndex);
      setHabitat(habitats[newIndex].name);
    }
  };
  
  const nextHabitat = () => {
    if (habitats.length > 0) {
      const newIndex = (habitatIndex + 1) % habitats.length;
      setHabitatIndex(newIndex);
      setHabitat(habitats[newIndex].name);
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
        <div className="max-w-6xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Ce specie poate fi?
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="my-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600 text-lg">Se încarcă opțiunile de filtrare...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Aspect */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">Aspect</h2>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={prevAspect}
                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    aria-label="Aspect anterior"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="w-40 h-40 flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm">
                    {aspectIndex === -1 ? (
                      <img 
                        src="/images/question_mark.png"
                        alt="Selectează un aspect"
                        className="max-w-full max-h-full object-contain opacity-50 p-4"
                      />
                    ) : aspects.length > 0 && (
                      <img 
                        src={aspects[aspectIndex].image} 
                        alt={aspects[aspectIndex].name}
                        className="max-w-full max-h-full object-contain"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                  
                  <button 
                    onClick={nextAspect}
                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    aria-label="Aspect următor"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <p className="text-center mt-4 font-medium text-gray-700">
                  {aspectIndex === -1 ? 'Selectează un aspect' : (aspects.length > 0 ? aspects[aspectIndex].name : 'Se încarcă...')}
                </p>
              </div>

              {/* Culoare penaj */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">Culoare penaj</h2>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={prevFeatherColor}
                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    aria-label="Culoare anterioară"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="w-40 h-40 flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm">
                    {featherColorIndex === -1 ? (
                      <img 
                        src="/images/question_mark.png"
                        alt="Selectează o culoare"
                        className="max-w-full max-h-full object-contain opacity-50 p-4"
                      />
                    ) : featherColors.length > 0 && (
                      <img 
                        src={featherColors[featherColorIndex].image} 
                        alt={featherColors[featherColorIndex].name}
                        className="max-w-full max-h-full object-contain"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                  
                  <button 
                    onClick={nextFeatherColor}
                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    aria-label="Culoare următoare"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <p className="text-center mt-4 font-medium text-gray-700">
                  {featherColorIndex === -1 ? 'Selectează o culoare' : (featherColors.length > 0 ? featherColors[featherColorIndex].name : 'Se încarcă...')}
                </p>
              </div>

              {/* Habitat */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">Habitat</h2>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={prevHabitat}
                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    aria-label="Habitat anterior"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="w-40 h-40 flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm">
                    {habitatIndex === -1 ? (
                      <img 
                        src="/images/question_mark.png"
                        alt="Selectează un habitat"
                        className="max-w-full max-h-full object-contain opacity-50 p-4"
                      />
                    ) : habitats.length > 0 && (
                      <img 
                        src={habitats[habitatIndex].image} 
                        alt={habitats[habitatIndex].name}
                        className="max-w-full max-h-full object-contain"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                  
                  <button 
                    onClick={nextHabitat}
                    className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    aria-label="Habitat următor"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <p className="text-center mt-4 font-medium text-gray-700">
                  {habitatIndex === -1 ? 'Selectează un habitat' : (habitats.length > 0 ? habitats[habitatIndex].name : 'Se încarcă...')}
                </p>
              </div>
            </div>
          )}

          {/* Buton de rezultate */}
          {!loading && (
            <div className="mt-8">
              <button
                onClick={goToEncyclopedia}
                className="w-full bg-blue-500 text-white py-4 rounded-full text-xl font-semibold hover:bg-blue-600 transition-colors shadow-md"
                disabled={loadingResults}
              >
                {loadingResults ? 'Se încarcă...' : `${results.length} Rezultate`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirdFilter;