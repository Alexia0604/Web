import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { getAllBirds, filterBirds } from '../services/birdService';

// Hardcoded data for aspects
const ASPECTS_DATA = [
  {
    "_id": "67f7d6c753563001b171c01d",
    "title": "Bufnita",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294851/silueta_bufnita_mbesit.png"
  },
  {
    "_id": "67f7d6c753563001b171c01e",
    "title": "Pasare cantatoare",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294851/pasare_cantatoare_pq9bxr.webp"
  },
  {
    "_id": "67f7d6c753563001b171c01f",
    "title": "Cioara",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294850/silueta_cioara_zbx0oi.webp"
  },
  {
    "_id": "67f7d6c753563001b171c020",
    "title": "Rapitor",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294850/rapitor_zvky2o.png"
  },
  {
    "_id": "67f7d6c753563001b171c021",
    "title": "Barza",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294849/silueta_barza_me72os.png"
  },
  {
    "_id": "67f7d6c753563001b171c022",
    "title": "Rata",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294849/silueta_rata_zh5yoj.jpg"
  },
  {
    "_id": "67f7d6c753563001b171c023",
    "title": "Ciocanitoare",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294848/aspect_ciocanitoare_qhngt6.avif"
  },
  {
    "_id": "67f7d6c753563001b171c024",
    "title": "Porumbel",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294847/silueta_porumbel_hxvx0z.webp"
  }
];

// Hardcoded data for feather colors
const FEATHERS_DATA = [
  {
    "_id": "67f7d6db53563001b171c027",
    "title": "Roz",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294675/roz_fce5tl.png"
  },
  {
    "_id": "67f7d6db53563001b171c028",
    "title": "Rosu",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294675/rosu_lb7vdd.png"
  },
  {
    "_id": "67f7d6db53563001b171c029",
    "title": "Maro deschis",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294675/maro_deschis_gtoifb.png"
  },
  {
    "_id": "67f7d6db53563001b171c02a",
    "title": "Portocaliu",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294674/portocaliu_v7lvng.png"
  },
  {
    "_id": "67f7d6db53563001b171c02b",
    "title": "Maro",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294674/maro_gja6jh.png"
  },
  {
    "_id": "67f7d6db53563001b171c02c",
    "title": "Negru",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294674/negru_gvx6ep.png"
  },
  {
    "_id": "67f7d6db53563001b171c02d",
    "title": "Albastru",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294673/albastru_z7pzcp.png"
  },
  {
    "_id": "67f7d6db53563001b171c02e",
    "title": "Gri",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294673/gri_fd2rw3.png"
  },
  {
    "_id": "67f7d6db53563001b171c02f",
    "title": "Alb",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294673/alb_csv9ca.png"
  },
  {
    "_id": "67f7d6db53563001b171c030",
    "title": "Galben",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294673/galben_dbnpw5.png"
  },
  {
    "_id": "67f7d6db53563001b171c031",
    "title": "Verde",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294672/verde_fz0nnh.png"
  }
];

// Hardcoded data for habitats
const HABITATS_DATA = [
  {
    "_id": "67f7d6ec53563001b171c034",
    "title": "Localitate",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294910/localitate_bf5nkl.png"
  },
  {
    "_id": "67f7d6ec53563001b171c035",
    "title": "Arbori",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294910/arbori_cnib17.png"
  },
  {
    "_id": "67f7d6ec53563001b171c036",
    "title": "Camp",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294909/camp_gqdwid.png"
  },
  {
    "_id": "67f7d6ec53563001b171c037",
    "title": "Mal",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294909/mal_nbnf0j.png"
  },
  {
    "_id": "67f7d6ec53563001b171c038",
    "title": "Agricol",
    "url": "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294908/agricol_nuiabj.png"
  }
];

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
  
  // State pentru loading
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState(null);

  // Funcție pentru încărcarea tuturor păsărilor la început
  const loadAllBirds = useCallback(async () => {
    try {
      setLoadingResults(true);
      setError(null);
      console.log("Loading all birds...");
      
      const response = await getAllBirds();
      console.log("API response:", response);
      
      if (!response || !response.birds) {
        throw new Error('Nu s-au putut încărca păsările. Răspuns invalid de la server.');
      }
      
      const allBirds = response.birds;
      console.log(`Found ${allBirds.length} birds`);
      
      setResults(allBirds);
      setError(null);
    } catch (error) {
      console.error("Eroare la încărcarea păsărilor:", error);
      setError(error.message || 'Nu s-au putut încărca păsările.');
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  }, []);

  // Funcție pentru filtrarea manuală a păsărilor
  const filterBirdsManually = async () => {
    try {
      setLoadingResults(true);
      setError(null);
      console.log("Starting manual filter with:", { 
        aspect: aspectIndex >= 0 ? aspect : 'Not selected', 
        featherColor: featherColorIndex >= 0 ? featherColor : 'Not selected', 
        habitat: habitatIndex >= 0 ? habitat : 'Not selected' 
      });

      // Construiește obiectul cu criteriile de filtrare
      const filterCriteria = {};
      if (aspectIndex >= 0) filterCriteria.aspect = aspect;
      if (featherColorIndex >= 0) filterCriteria.featherColor = featherColor;
      if (habitatIndex >= 0) filterCriteria.habitat = habitat;

      let filteredBirds;
      // Verifică dacă există cel puțin un criteriu de filtrare
      if (Object.keys(filterCriteria).length === 0) {
        // Dacă nu există criterii, încarcă toate păsările
        const response = await getAllBirds();
        filteredBirds = response.birds;
      } else {
        // Altfel, aplică filtrele
        filteredBirds = await filterBirds(filterCriteria);
      }

      if (!filteredBirds) {
        throw new Error('Nu s-au putut încărca rezultatele filtrării.');
      }

      setResults(filteredBirds);
      setError(null);
    } catch (error) {
      console.error("Eroare la filtrarea păsărilor:", error);
      setError(error.message || 'A apărut o eroare la filtrarea păsărilor. Vă rugăm încercați din nou.');
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  // Încărcăm toate păsările la prima randare
  useEffect(() => {
    loadAllBirds();
  }, [loadAllBirds]);

  // Actualizăm rezultatele doar când se schimbă filtrele și avem cel puțin un filtru activ
  useEffect(() => {
    const hasActiveFilters = aspect || featherColor || habitat;
    if (hasActiveFilters) {
      filterBirdsManually();
    }
  }, [aspect, featherColor, habitat]);

  // Funcții pentru navigarea prin opțiuni
  const prevAspect = () => {
    if (ASPECTS_DATA.length > 0) {
      const newIndex = aspectIndex <= 0 ? ASPECTS_DATA.length - 1 : aspectIndex - 1;
      setAspectIndex(newIndex);
      setAspect(ASPECTS_DATA[newIndex].title || '');
    }
  };
  
  const nextAspect = () => {
    if (ASPECTS_DATA.length > 0) {
      const newIndex = aspectIndex >= ASPECTS_DATA.length - 1 ? 0 : aspectIndex + 1;
      setAspectIndex(newIndex);
      setAspect(ASPECTS_DATA[newIndex].title || '');
    }
  };
  
  const prevFeatherColor = () => {
    if (FEATHERS_DATA.length > 0) {
      const newIndex = featherColorIndex <= 0 ? FEATHERS_DATA.length - 1 : featherColorIndex - 1;
      setFeatherColorIndex(newIndex);
      setFeatherColor(FEATHERS_DATA[newIndex].title || '');
    }
  };
  
  const nextFeatherColor = () => {
    if (FEATHERS_DATA.length > 0) {
      const newIndex = featherColorIndex >= FEATHERS_DATA.length - 1 ? 0 : featherColorIndex + 1;
      setFeatherColorIndex(newIndex);
      setFeatherColor(FEATHERS_DATA[newIndex].title || '');
    }
  };
  
  const prevHabitat = () => {
    if (HABITATS_DATA.length > 0) {
      const newIndex = habitatIndex <= 0 ? HABITATS_DATA.length - 1 : habitatIndex - 1;
      setHabitatIndex(newIndex);
      setHabitat(HABITATS_DATA[newIndex].title || '');
    }
  };
  
  const nextHabitat = () => {
    if (HABITATS_DATA.length > 0) {
      const newIndex = habitatIndex >= HABITATS_DATA.length - 1 ? 0 : habitatIndex + 1;
      setHabitatIndex(newIndex);
      setHabitat(HABITATS_DATA[newIndex].title || '');
    }
  };

  // Funcție pentru resetarea unui filtru
  const resetAspect = () => {
    setAspect('');
    setAspectIndex(-1);
  };
  
  const resetFeatherColor = () => {
    setFeatherColor('');
    setFeatherColorIndex(-1);
  };
  
  const resetHabitat = () => {
    setHabitat('');
    setHabitatIndex(-1);
  };

  // Funcție pentru navigarea către pagina enciclopediei cu rezultatele filtrate
  const goToEncyclopedia = () => {
    // Construiește parametrii de query pentru filtrare
    const queryParams = new URLSearchParams();
    
    if (results.length > 0) {
      // Adaugă ID-urile păsărilor doar dacă avem rezultate
      queryParams.set('birds', results.map(bird => bird._id).join(','));
    }
    
    // Adaugă doar criteriile de filtrare care sunt active
    if (aspectIndex >= 0 && aspect) queryParams.set('aspect', aspect);
    if (featherColorIndex >= 0 && featherColor) queryParams.set('featherColor', featherColor);
    if (habitatIndex >= 0 && habitat) queryParams.set('habitat', habitat);
    
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
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={aspectIndex >= 0 ? ASPECTS_DATA[aspectIndex].url : '/Images/question_mark.png'}
                alt={aspectIndex >= 0 ? ASPECTS_DATA[aspectIndex].title : 'Selectează un aspect'}
                className="max-w-full max-h-full object-contain"
                onError={handleImageError}
              />
              {aspectIndex >= 0 && (
                <button 
                  onClick={resetAspect}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  title="Resetează aspectul"
                >
                  ×
                </button>
              )}
            </div>

            <button 
              onClick={nextAspect}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-4 font-medium text-gray-700">
            {aspectIndex >= 0 ? ASPECTS_DATA[aspectIndex].title : 'Selectează un aspect'}
          </p>
        </div>

        {/* Feather Color Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-6">Culoare penaj</h2>
          <div className="relative w-full h-64 bg-white rounded-lg shadow-md">
            <button 
              onClick={prevFeatherColor}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={featherColorIndex >= 0 ? FEATHERS_DATA[featherColorIndex].url : '/Images/question_mark.png'}
                alt={featherColorIndex >= 0 ? FEATHERS_DATA[featherColorIndex].title : 'Selectează o culoare'}
                className="max-w-full max-h-full object-contain"
                onError={handleImageError}
              />
              {featherColorIndex >= 0 && (
                <button 
                  onClick={resetFeatherColor}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  title="Resetează culoarea"
                >
                  ×
                </button>
              )}
            </div>

            <button 
              onClick={nextFeatherColor}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-4 font-medium text-gray-700">
            {featherColorIndex >= 0 ? FEATHERS_DATA[featherColorIndex].title : 'Selectează o culoare'}
          </p>
        </div>

        {/* Habitat Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-6">Habitat</h2>
          <div className="relative w-full h-64 bg-white rounded-lg shadow-md">
            <button 
              onClick={prevHabitat}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={habitatIndex >= 0 ? HABITATS_DATA[habitatIndex].url : '/Images/question_mark.png'}
                alt={habitatIndex >= 0 ? HABITATS_DATA[habitatIndex].title : 'Selectează un habitat'}
                className="max-w-full max-h-full object-contain"
                onError={handleImageError}
              />
              {habitatIndex >= 0 && (
                <button 
                  onClick={resetHabitat}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  title="Resetează habitatul"
                >
                  ×
                </button>
              )}
            </div>

            <button 
              onClick={nextHabitat}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-center mt-4 font-medium text-gray-700">
            {habitatIndex >= 0 ? HABITATS_DATA[habitatIndex].title : 'Selectează un habitat'}
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