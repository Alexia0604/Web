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
  
  // Adăugăm state-uri pentru opțiunile din fiecare tabela
  const [aspectsOptions, setAspectsOptions] = useState([]);
  const [feathersOptions, setFeathersOptions] = useState([]);
  const [habitatsOptions, setHabitatsOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
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

  // Încărcăm datele din tabele când se încarcă componenta
  useEffect(() => {
    const fetchOptionsData = async () => {
      setIsLoadingOptions(true);
      try {
        // Aici ar trebui să faci request-uri către API pentru a obține datele
        // Deocamdată voi folosi direct datele pe care le-ai furnizat
        
        const aspectsData = [
          { _id: "67f7d6c753563001b171c01d", title: "Bufnita", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294851/silueta_bufnita_mbesit.png" },
          { _id: "67f7d6c753563001b171c01e", title: "Pasare cantatoare", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294851/pasare_cantatoare_pq9bxr.webp" },
          { _id: "67f7d6c753563001b171c01f", title: "Cioara", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294850/silueta_cioara_zbx0oi.webp" },
          { _id: "67f7d6c753563001b171c020", title: "Rapitor", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294850/rapitor_zvky2o.png" },
          { _id: "67f7d6c753563001b171c021", title: "Barza", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294849/silueta_barza_me72os.png" },
          { _id: "67f7d6c753563001b171c022", title: "Rata", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294849/silueta_rata_zh5yoj.jpg" },
          { _id: "67f7d6c753563001b171c023", title: "Ciocanitoare", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294848/aspect_ciocanitoare_qhngt6.avif" },
          { _id: "67f7d6c753563001b171c024", title: "Porumbel", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294847/silueta_porumbel_hxvx0z.webp" }
        ];
        
        const feathersData = [
          { _id: "67f7d6db53563001b171c027", title: "Roz", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294675/roz_fce5tl.png" },
          { _id: "67f7d6db53563001b171c028", title: "Rosu", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294675/rosu_lb7vdd.png" },
          { _id: "67f7d6db53563001b171c029", title: "Maro deschis", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294675/maro_deschis_gtoifb.png" },
          { _id: "67f7d6db53563001b171c02a", title: "Portocaliu", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294674/portocaliu_v7lvng.png" },
          { _id: "67f7d6db53563001b171c02b", title: "Maro", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294674/maro_gja6jh.png" },
          { _id: "67f7d6db53563001b171c02c", title: "Negru", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294674/negru_gvx6ep.png" },
          { _id: "67f7d6db53563001b171c02d", title: "Albastru", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294673/albastru_z7pzcp.png" },
          { _id: "67f7d6db53563001b171c02e", title: "Gri", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294673/gri_fd2rw3.png" },
          { _id: "67f7d6db53563001b171c02f", title: "Alb", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294673/alb_csv9ca.png" },
          { _id: "67f7d6db53563001b171c030", title: "Galben", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294673/galben_dbnpw5.png" },
          { _id: "67f7d6db53563001b171c031", title: "Verde", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294672/verde_fz0nnh.png" }
        ];
        
        const habitatsData = [
          { _id: "67f7d6ec53563001b171c034", title: "Localitate", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294910/localitate_bf5nkl.png" },
          { _id: "67f7d6ec53563001b171c035", title: "Arbori", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294910/arbori_cnib17.png" },
          { _id: "67f7d6ec53563001b171c036", title: "Camp", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294909/camp_gqdwid.png" },
          { _id: "67f7d6ec53563001b171c037", title: "Mal", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294909/mal_nbnf0j.png" },
          { _id: "67f7d6ec53563001b171c038", title: "Agricol", url: "https://res.cloudinary.com/dwewbzrjv/image/upload/v1744294908/agricol_nuiabj.png" }
        ];
        
        // Actualizăm state-urile cu datele obținute
        setAspectsOptions(aspectsData);
        setFeathersOptions(feathersData);
        setHabitatsOptions(habitatsData);
      } catch (err) {
        console.error('Eroare la încărcarea opțiunilor:', err);
        setError('A apărut o eroare la încărcarea opțiunilor disponibile.');
      } finally {
        setIsLoadingOptions(false);
      }
    };
    
    fetchOptionsData();
  }, []);

  // Adăugăm funcție pentru selectarea unei opțiuni din dropdown
  const handleSelectOption = (field, index, optionId) => {
    // Găsim opțiunea selectată în funcție de field
    let selectedOption;
    if (field === 'aspects') {
      selectedOption = aspectsOptions.find(option => option._id === optionId);
    } else if (field === 'featherColors') {
      selectedOption = feathersOptions.find(option => option._id === optionId);
    } else if (field === 'habitats') {
      selectedOption = habitatsOptions.find(option => option._id === optionId);
    }
    
    if (!selectedOption) return;
    
    // Actualizăm array-ul potrivit din bird
    setBird(prev => {
      const newArray = [...prev[field]];
      newArray[index] = {
        name: selectedOption.title,
        image: {
          url: selectedOption.url
        },
        selectedId: optionId // Păstrăm ID-ul selectat pentru a menține selecția în dropdown
      };
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

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
      [field]: [...prev[field], { name: '', image: '', selectedId: '' }]
    }));
  };

  const removeArrayItem = (field, index) => {
    setBird(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getImageUrl = (image) => {
    if (!image) return '/Images/placeholder-bird.png';
    if (typeof image === 'object') {
      if (image.url) return image.url;
      if (image.secure_url) return image.secure_url;
    }
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return `http://localhost:5000/Images/${image}`;
    }
    return '/Images/placeholder-bird.png';
  };

  const getAudioUrl = (audio) => {
    if (!audio) return '';
    if (typeof audio === 'object' && audio.url) {
      return audio.url;
    }
    if (typeof audio === 'string') {
      if (audio.startsWith('http')) {
        return audio;
      }
      return `http://localhost:5000/Images/${audio}`;
    }
    return '';
  };

  const handleFileUpload = async (event, type) => {
    try {
      setIsUploading(true);
      setError(null);
      const file = event.target.files[0];
      if (!file) return;

      // Verificăm dimensiunea fișierului
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('Fișierul este prea mare. Dimensiunea maximă permisă este de 10MB.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', type);

      const response = await axios.post('/api/admin/upload-bird-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        if (type === 'image') {
          setBird(prev => ({
            ...prev,
            image: {
              url: response.data.url,
              public_id: response.data.public_id,
              filename: response.data.filename
            }
          }));
        } else if (type === 'audio') {
          setBird(prev => ({
            ...prev,
            audio: {
              url: response.data.url,
              public_id: response.data.public_id,
              filename: response.data.filename
            }
          }));
        }
        setUploadProgress(100);
        setTimeout(() => {
          setUploadProgress(0);
          setIsUploading(false);
        }, 1000);
      } else {
        throw new Error(response.data.error || 'Eroare la încărcarea fișierului');
      }
    } catch (error) {
      console.error('Eroare la încărcarea fișierului:', error);
      setError(error.response?.data?.error || error.message || 'Eroare la încărcarea fișierului');
      setUploadProgress(0);
      setIsUploading(false);
    }
  };
  
  const handleImageSelect = (e) => {
    handleFileUpload(e, 'image');
  };
  
  const handleAudioSelect = (e) => {
    handleFileUpload(e, 'audio');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Verifică dacă toate câmpurile obligatorii sunt completate
      if (!bird.name || !bird.scientificName || !bird.englishName || 
          !bird.family || !bird.order || !bird.description) {
        setError('Toate câmpurile marcate cu * sunt obligatorii');
        return;
      }

      // Verifică dacă există o imagine principală
      if (!bird.image || (!bird.image.url && typeof bird.image !== 'string')) {
        setError('Imaginea principală este obligatorie');
        return;
      }

      // Pregătim datele pentru trimitere
      const birdData = {
        ...bird,
        // Asigurăm-ne că imaginea principală este în formatul corect
        image: typeof bird.image === 'string' ? { url: bird.image } : bird.image,
        // Asigurăm-ne că audio este în formatul corect
        audio: bird.audio ? (typeof bird.audio === 'string' ? { url: bird.audio } : bird.audio) : null,
        // Procesăm aspectele cu câmpurile title și name (conform cerinței)
        aspects: bird.aspects.map(aspect => ({
          title: aspect.name, // Pentru compatibilitate cu modelul Bird.js
          name: aspect.name,  // Pentru filtrare
          description: '',
          image: typeof aspect.image === 'string' ? { url: aspect.image } : aspect.image
        })).filter(aspect => aspect.name && aspect.image?.url),
        // Procesăm culorile penajului cu câmpurile color și name (conform cerinței)
        featherColors: bird.featherColors.map(color => ({
          color: color.name, // Pentru compatibilitate cu modelul Bird.js
          name: color.name,  // Pentru filtrare
          description: '',
          image: typeof color.image === 'string' ? { url: color.image } : color.image
        })).filter(color => color.name && color.image?.url),
        // Procesăm habitatele cu câmpul name (deja existent)
        habitats: bird.habitats.map(habitat => ({
          name: habitat.name, // Numele este deja corect
          description: '',
          image: typeof habitat.image === 'string' ? { url: habitat.image } : habitat.image
        })).filter(habitat => habitat.name && habitat.image?.url)
      };

      const response = await axios.post('/api/admin/birds', birdData, {
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

  // Render image preview
  const renderImagePreview = (imageData, field, arrayField = null, index = null) => {
    if (!imageData || !imageData.url) return null;

    return (
      <div className="mt-2">
        <img
          src={imageData.url}
          alt="Preview"
          className="max-w-xs h-auto"
          onError={(e) => {
            console.error('Eroare la încărcarea imaginii:', imageData.url);
            e.target.style.display = 'none';
          }}
        />
      </div>
    );
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
                onChange={(e) => handleImageSelect(e)}
                accept="image/*"
                className="hidden"
              />
            </div>
            {bird.image && renderImagePreview(bird.image, 'image')}
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
                onChange={(e) => handleAudioSelect(e)}
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
                <select
                  value={aspect.selectedId || ""}
                  onChange={(e) => handleSelectOption('aspects', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Selectează un aspect</option>
                  {aspectsOptions.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                {aspect.image && aspect.image.url && (
                  <div className="mt-2 border p-1 inline-block">
                    <img
                      src={getImageUrl(aspect.image)}
                      alt={aspect.name || 'Aspect'}
                      className="w-auto h-auto max-h-32"
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
                <select
                  value={color.selectedId || ""}
                  onChange={(e) => handleSelectOption('featherColors', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Selectează o culoare</option>
                  {feathersOptions.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                {color.image && color.image.url && (
                  <div className="mt-2 border p-1 inline-block">
                    <img
                      src={getImageUrl(color.image)}
                      alt={color.name || 'Culoare'}
                      className="w-auto h-auto max-h-32"
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
                <select
                  value={habitat.selectedId || ""}
                  onChange={(e) => handleSelectOption('habitats', index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Selectează un habitat</option>
                  {habitatsOptions.map((option) => (
                    <option key={option._id} value={option._id}>
                      {option.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                {habitat.image && habitat.image.url && (
                  <div className="mt-2 border p-1 inline-block">
                    <img
                      src={getImageUrl(habitat.image)}
                      alt={habitat.name || 'Habitat'}
                      className="w-auto h-auto max-h-32"
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