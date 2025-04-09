import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminBirdAdd = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const imageFileInputRef = useRef(null);
  const audioFileInputRef = useRef(null);
  const aspectImageRefs = useRef([]);
  const featherColorImageRefs = useRef([]);
  const habitatImageRefs = useRef([]);
  
  const [bird, setBird] = useState({
    name: '',
    scientificName: '',
    englishName: '',
    image: '',
    audio: '',
    description: '',
    family: '',
    order: '',
    aspects: [],
    featherColors: [],
    habitats: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBird(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e, field, index, key) => {
    const newValue = e.target.value;
    setBird(prev => {
      const newArray = [...prev[field]];
      newArray[index] = { ...newArray[index], [key]: newValue };
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field) => {
    setBird(prev => ({
      ...prev,
      [field]: [...prev[field], { name: '', image: '' }]
    }));
  };

  const removeArrayItem = (field, index) => {
    setBird(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (file, fieldType, arrayField = null, arrayIndex = null) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Creăm FormData
      const formData = new FormData();
      formData.append('file', file);

      // Facem cererea către server
      const response = await axios.post('http://localhost:5000/api/admin/upload-bird-file', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        // Obținem calea fișierului încărcat
        const fileData = response.data.file;
        
        // Actualizăm starea în funcție de tipul câmpului și dacă este parte dintr-un array
        if (arrayField && typeof arrayIndex === 'number') {
          // Pentru câmpuri array (albume, habitate, etc.)
          setBird(prevBird => {
            const updatedArray = [...prevBird[arrayField]];
            
            if (fileData.type === 'image') {
              updatedArray[arrayIndex].image = fileData.filename;
            } else if (fileData.type === 'audio') {
              updatedArray[arrayIndex].audio = fileData.filename;
            }
            
            return {
              ...prevBird,
              [arrayField]: updatedArray
            };
          });
        } else {
          // Pentru câmpuri simple (imagine principală, audio principal)
          setBird(prevBird => ({
            ...prevBird,
            [fieldType]: fileData.filename
          }));
        }

        setSuccessMessage(`Fișierul a fost încărcat cu succes`);
      }
    } catch (error) {
      console.error('Eroare la încărcarea fișierului:', error);
      setError('Eroare la încărcarea fișierului');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'image');
    }
  };
  
  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'audio');
    }
  };

  const handleArrayImageSelect = (e, arrayField, index) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file, 'image', arrayField, index);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verifică dacă toate câmpurile obligatorii sunt completate
    if (!bird.name || !bird.scientificName || !bird.englishName || !bird.image || 
        !bird.family || !bird.order || !bird.description) {
      setError('Toate câmpurile marcate cu * sunt obligatorii');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/birds', bird, {
        withCredentials: true
      });
      
      setSuccessMessage('Pasărea a fost adăugată cu succes');
      
      setTimeout(() => {
        navigate('/admin/birds');
      }, 2000);
    } catch (err) {
      console.error('Eroare la adăugarea păsării:', err);
      setError(err.response?.data?.message || 'Eroare la adăugarea păsării');
    }
  };

  // Helper to create proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/Images/placeholder-bird.png';
    
    // Already has http or https prefix
    if (imagePath.startsWith('http')) {
      return `${imagePath}?t=${Date.now()}`;
    }
    
    // Use the filename with the Images directory path
    return `http://localhost:5000/Images/${imagePath}?t=${Date.now()}`;
  };

  // Helper to create proper audio URL
  const getAudioUrl = (audioPath) => {
    if (!audioPath) return '';
    
    // Toate fișierele audio sunt în Images, indiferent de extensie
    if (audioPath.startsWith('http')) {
      return audioPath;
    }
    
    // Folosim numele fișierului cu calea către directorul Images
    return `http://localhost:5000/Images/${audioPath}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Adaugă pasăre nouă</h1>
        <Link 
          to="/admin/birds" 
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" 
            />
          </svg>
          Înapoi la lista de păsări
        </Link>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Încărcare: {uploadProgress}%</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nume *
            </label>
            <input
              type="text"
              name="name"
              value={bird.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Denumire științifică *
            </label>
            <input
              type="text"
              name="scientificName"
              value={bird.scientificName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Denumire în engleză *
            </label>
            <input
              type="text"
              name="englishName"
              value={bird.englishName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Familie *
            </label>
            <input
              type="text"
              name="family"
              value={bird.family}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordin *
            </label>
            <input
              type="text"
              name="order"
              value={bird.order}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagine *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="image"
                value={bird.image}
                onChange={handleInputChange}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  imageFileInputRef.current.click();
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
              >
                Încarcă
              </button>
              <input
                type="file"
                ref={imageFileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
            {bird.image && (
              <div className="mt-2 border p-1 inline-block">
                <img 
                  src={getImageUrl(bird.image)}
                  alt={bird.name}
                  className="w-auto h-auto"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="audio"
                value={bird.audio}
                onChange={handleInputChange}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  audioFileInputRef.current.click();
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
              >
                Încarcă
              </button>
              <input
                type="file"
                ref={audioFileInputRef}
                onChange={handleAudioSelect}
                accept="audio/*"
                className="hidden"
              />
            </div>
            {bird.audio && (
              <div className="mt-2">
                <audio 
                  controls 
                  className="w-full" 
                  key={bird.audio} 
                  preload="none"
                >
                  <source 
                    src={getAudioUrl(bird.audio)} 
                    type="audio/mpeg"
                  />
                  Browserul tău nu suportă elementul audio.
                </audio>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descriere *
          </label>
          <textarea
            name="description"
            value={bird.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        {/* Aspecte */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Aspecte
            </label>
            <button
              type="button"
              onClick={() => addArrayItem('aspects')}
              className="text-indigo-600 hover:text-indigo-900"
            >
              + Adaugă aspect
            </button>
          </div>
          
          {bird.aspects.map((aspect, index) => (
            <div key={index} className="flex gap-4 items-start mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={aspect.name}
                  onChange={(e) => handleArrayInputChange(e, 'aspects', index, 'name')}
                  placeholder="Nume aspect"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={aspect.image}
                    onChange={(e) => handleArrayInputChange(e, 'aspects', index, 'image')}
                    placeholder="URL imagine"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      aspectImageRefs.current[index]?.click();
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
                  >
                    Încarcă
                  </button>
                  <input
                    type="file"
                    ref={el => aspectImageRefs.current[index] = el}
                    onChange={e => handleArrayImageSelect(e, 'aspects', index)}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {aspect.image && (
                  <div className="mt-2 border p-1 inline-block">
                    <img
                      src={getImageUrl(aspect.image)}
                      alt={aspect.name || 'Aspect'}
                      className="w-auto h-auto"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem('aspects', index)}
                className="text-red-600 hover:text-red-900 mt-2"
              >
                X
              </button>
            </div>
          ))}
        </div>

        {/* Culori pene */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Culori pene
            </label>
            <button
              type="button"
              onClick={() => addArrayItem('featherColors')}
              className="text-indigo-600 hover:text-indigo-900"
            >
              + Adaugă culoare
            </button>
          </div>
          
          {bird.featherColors.map((color, index) => (
            <div key={index} className="flex gap-4 items-start mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={color.name}
                  onChange={(e) => handleArrayInputChange(e, 'featherColors', index, 'name')}
                  placeholder="Nume culoare"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={color.image}
                    onChange={(e) => handleArrayInputChange(e, 'featherColors', index, 'image')}
                    placeholder="URL imagine"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      featherColorImageRefs.current[index]?.click();
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
                  >
                    Încarcă
                  </button>
                  <input
                    type="file"
                    ref={el => featherColorImageRefs.current[index] = el}
                    onChange={e => handleArrayImageSelect(e, 'featherColors', index)}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {color.image && (
                  <div className="mt-2 border p-1 inline-block">
                    <img
                      src={getImageUrl(color.image)}
                      alt={color.name || 'Culoare'}
                      className="w-auto h-auto"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem('featherColors', index)}
                className="text-red-600 hover:text-red-900 mt-2"
              >
                X
              </button>
            </div>
          ))}
        </div>

        {/* Habitate */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Habitate
            </label>
            <button
              type="button"
              onClick={() => addArrayItem('habitats')}
              className="text-indigo-600 hover:text-indigo-900"
            >
              + Adaugă habitat
            </button>
          </div>
          
          {bird.habitats.map((habitat, index) => (
            <div key={index} className="flex gap-4 items-start mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={habitat.name}
                  onChange={(e) => handleArrayInputChange(e, 'habitats', index, 'name')}
                  placeholder="Nume habitat"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={habitat.image}
                    onChange={(e) => handleArrayInputChange(e, 'habitats', index, 'image')}
                    placeholder="URL imagine"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      habitatImageRefs.current[index]?.click();
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
                  >
                    Încarcă
                  </button>
                  <input
                    type="file"
                    ref={el => habitatImageRefs.current[index] = el}
                    onChange={e => handleArrayImageSelect(e, 'habitats', index)}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {habitat.image && (
                  <div className="mt-2 border p-1 inline-block">
                    <img
                      src={getImageUrl(habitat.image)}
                      alt={habitat.name || 'Habitat'}
                      className="w-auto h-auto"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeArrayItem('habitats', index)}
                className="text-red-600 hover:text-red-900 mt-2"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/birds')}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Anulează
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Adaugă pasărea
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBirdAdd; 