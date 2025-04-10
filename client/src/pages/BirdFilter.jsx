import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

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
  const [aspectIndex, setAspectIndex] = useState(-1);
  const [featherColorIndex, setFeatherColorIndex] = useState(-1);
  const [habitatIndex, setHabitatIndex] = useState(-1);
  
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
      const response = await axios.get(`${API_BASE_URL}/birds`, {
        withCredentials: true
      });
      setResults(response.data.birds || []);
    } catch (error) {
      console.error("Eroare la încărcarea păsărilor:", error);
      setError('Nu s-au putut încărca păsările.');
    } finally {
      setLoadingResults(false);
    }
  }, []);

  // Funcție pentru încărcarea opțiunilor de filtrare din backend
  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/birds/filter-options`, {
        withCredentials: true
      });
      
      setAspects(response.data.aspects);
      setFeatherColors(response.data.featherColors);
      setHabitats(response.data.habitats);
      
      setFiltersLoaded(true);
      setError(null);
    } catch (error) {
      console.error("Eroare la încărcarea opțiunilor de filtrare:", error);
      setError('Nu s-au putut încărca opțiunile de filtrare.');
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru filtrarea păsărilor
  const filterBirds = async () => {
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
      
      const response = await axios.get(`${API_BASE_URL}/birds/filter`, { 
        params,
        withCredentials: true 
      });
      setResults(response.data);
    } catch (error) {
      console.error("Eroare la filtrarea păsărilor:", error);
      setError('Nu s-au putut filtra păsările.');
    } finally {
      setLoadingResults(false);
    }
  };

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
      const newIndex = aspectIndex <= 0 ? aspects.length - 1 : aspectIndex - 1;
      setAspectIndex(newIndex);
      setAspect(aspects[newIndex].name || '');
    }
  };
  
  const nextAspect = () => {
    if (aspects.length > 0) {
      const newIndex = aspectIndex >= aspects.length - 1 ? 0 : aspectIndex + 1;
      setAspectIndex(newIndex);
      setAspect(aspects[newIndex].name || '');
    }
  };
  
  const prevFeatherColor = () => {
    if (featherColors.length > 0) {
      const newIndex = featherColorIndex <= 0 ? featherColors.length - 1 : featherColorIndex - 1;
      setFeatherColorIndex(newIndex);
      setFeatherColor(featherColors[newIndex].name || '');
    }
  };
  
  const nextFeatherColor = () => {
    if (featherColors.length > 0) {
      const newIndex = featherColorIndex >= featherColors.length - 1 ? 0 : featherColorIndex + 1;
      setFeatherColorIndex(newIndex);
      setFeatherColor(featherColors[newIndex].name || '');
    }
  };
  
  const prevHabitat = () => {
    if (habitats.length > 0) {
      const newIndex = habitatIndex <= 0 ? habitats.length - 1 : habitatIndex - 1;
      setHabitatIndex(newIndex);
      setHabitat(habitats[newIndex].name || '');
    }
  };
  
  const nextHabitat = () => {
    if (habitats.length > 0) {
      const newIndex = habitatIndex >= habitats.length - 1 ? 0 : habitatIndex + 1;
      setHabitatIndex(newIndex);
      setHabitat(habitats[newIndex].name || '');
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-12">Ce specie poate fi?</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Aspect Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-6">Aspect</h2>
          <div className="relative w-full h-64 bg-white rounded-lg shadow-md">
            <button 
              onClick={prevAspect}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
              disabled={loading || aspects.length === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              ) : (
                <img 
                  src={aspectIndex >= 0 && aspects[aspectIndex] ? aspects[aspectIndex].image : '/Images/question_mark.png'}
                  alt={aspectIndex >= 0 && aspects[aspectIndex] ? aspects[aspectIndex].name : 'Selectează un aspect'}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            <button 
              onClick={nextAspect}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
              disabled={loading || aspects.length === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-4 font-medium text-gray-700">
            {aspectIndex >= 0 && aspects[aspectIndex] ? aspects[aspectIndex].name : 'Selectează un aspect'}
          </p>
        </div>

        {/* Feather Color Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-6">Culoare penaj</h2>
          <div className="relative w-full h-64 bg-white rounded-lg shadow-md">
            <button 
              onClick={prevFeatherColor}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
              disabled={loading || featherColors.length === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              ) : (
                <img 
                  src={featherColorIndex >= 0 && featherColors[featherColorIndex] ? featherColors[featherColorIndex].image : '/Images/question_mark.png'}
                  alt={featherColorIndex >= 0 && featherColors[featherColorIndex] ? featherColors[featherColorIndex].name : 'Selectează o culoare'}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            <button 
              onClick={nextFeatherColor}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
              disabled={loading || featherColors.length === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-4 font-medium text-gray-700">
            {featherColorIndex >= 0 && featherColors[featherColorIndex] ? featherColors[featherColorIndex].name : 'Selectează o culoare'}
          </p>
        </div>

        {/* Habitat Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-6">Habitat</h2>
          <div className="relative w-full h-64 bg-white rounded-lg shadow-md">
            <button 
              onClick={prevHabitat}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
              disabled={loading || habitats.length === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              {loading ? (
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              ) : (
                <img 
                  src={habitatIndex >= 0 && habitats[habitatIndex] ? habitats[habitatIndex].image : '/Images/question_mark.png'}
                  alt={habitatIndex >= 0 && habitats[habitatIndex] ? habitats[habitatIndex].name : 'Selectează un habitat'}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            <button 
              onClick={nextHabitat}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
              disabled={loading || habitats.length === 0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-4 font-medium text-gray-700">
            {habitatIndex >= 0 && habitats[habitatIndex] ? habitats[habitatIndex].name : 'Selectează un habitat'}
          </p>
        </div>
      </div>

      {/* Results Section */}
      <button
        onClick={goToEncyclopedia}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
        disabled={loadingResults || results.length === 0}
      >
        {loadingResults ? 'Se încarcă...' : `${results.length} Rezultate`}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default BirdFilter;