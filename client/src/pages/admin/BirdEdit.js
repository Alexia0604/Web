import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const BirdEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const imageFileInputRef = useRef(null);
  const audioFileInputRef = useRef(null);
  
  // State pentru opțiunile din fiecare tabela
  const [aspectsOptions, setAspectsOptions] = useState([]);
  const [feathersOptions, setFeathersOptions] = useState([]);
  const [habitatsOptions, setHabitatsOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  // State inițial pentru pasăre
  const [bird, setBird] = useState({
    name: "",
    scientificName: "",
    englishName: "",
    family: "",
    order: "",
    description: "",
    image: null,
    audio: null,
    aspects: [],
    featherColors: [],
    habitats: []
  });
  
  // State pentru fișiere
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
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
  
  // Obținem datele păsării
  useEffect(() => {
    const fetchBird = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/birds/${id}`, {
          withCredentials: true
        });
        const birdData = response.data;
        
        // Map the bird data to our state format
        setBird({
          ...birdData,
          image: birdData.image || null,
          audio: birdData.audio || null,
          aspects: birdData.aspects?.map(aspect => ({
            name: aspect.title || aspect.name || '',
            image: typeof aspect.image === 'string' ? { url: aspect.image } : aspect.image,
            selectedId: aspect._id || ''
          })) || [],
          featherColors: birdData.featherColors?.map(color => ({
            name: color.color || color.name || '',
            image: typeof color.image === 'string' ? { url: color.image } : color.image,
            selectedId: color._id || ''
          })) || [],
          habitats: birdData.habitats?.map(habitat => ({
            name: habitat.name || '',
            image: typeof habitat.image === 'string' ? { url: habitat.image } : habitat.image,
            selectedId: habitat._id || ''
          })) || []
        });
        
        // Setăm și previzualizarea imaginii
        if (birdData.image) {
          setImagePreview(`${API_BASE_URL}/Images/${birdData.image}`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bird:', error);
        setError('Error fetching bird data');
        setLoading(false);
      }
    };
    
    fetchBird();
  }, [id]);
  
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
    if (typeof image === 'object' && image !== null) {
      if (image.url) return image.url;
      if (image.secure_url) return image.secure_url;
    }
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return `${API_BASE_URL}/Images/${image}`;
    }
    return '/Images/placeholder-bird.png';
  };

  const getAudioUrl = (audio) => {
    if (!audio) return '';
    if (typeof audio === 'object' && audio !== null && audio.url) {
      return audio.url;
    }
    if (typeof audio === 'string') {
      if (audio.startsWith('http')) {
        return audio;
      }
      return `${API_BASE_URL}/Images/${audio}`;
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
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadType', type);

      const response = await axios.post(`${API_BASE_URL}/api/admin/upload-bird-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        withCredentials: true
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
  
  // Render image preview
  const renderImagePreview = (imageData, field, arrayField = null, index = null) => {
    // Dacă este câmp audio, returnăm null - nu afișăm nimic
    if (field === 'audio') return null;
    
    let imageUrl = '';
    
    if (imageData && typeof imageData === 'object' && imageData.url) {
      imageUrl = imageData.url;
    } else if (imageData && typeof imageData === 'string') {
      imageUrl = imageData.startsWith('http') ? imageData : `${API_BASE_URL}/Images/${imageData}`;
    } else {
      imageUrl = '/Images/placeholder-bird.png';
    }
    
    return (
      <div className="relative w-32 h-32 bg-gray-100 rounded border overflow-hidden">
        <img
          src={imageUrl}
          alt={arrayField ? `${field} preview` : 'Bird preview'}
          className="w-full h-full object-cover"
        />
        {field === 'image' && !arrayField && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
            <label className="cursor-pointer bg-blue-600 text-white py-1 px-2 rounded text-xs">
              Schimbă
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageSelect}
                ref={imageFileInputRef}
              />
            </label>
          </div>
        )}
      </div>
    );
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Transformăm datele pentru a se potrivi cu ceea ce așteaptă API-ul
      const birdData = {
        ...bird,
        aspects: bird.aspects.map(aspect => ({
          title: aspect.name || '',
          description: aspect.description || '',
          image: aspect.image
        })),
        featherColors: bird.featherColors.map(color => ({
          color: color.name || '',
          description: color.description || '',
          image: color.image
        })),
        habitats: bird.habitats.map(habitat => ({
          name: habitat.name || '',
          description: habitat.description || '',
          image: habitat.image
        }))
      };
      
      // Trimitem datele către API
      const response = await axios.put(`${API_BASE_URL}/api/admin/birds/${id}`, birdData, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSuccessMessage('Pasărea a fost actualizată cu succes!');
        setTimeout(() => {
          navigate('/admin/birds');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Eroare la actualizarea păsării');
      }
    } catch (error) {
      console.error('Eroare la trimiterea datelor:', error);
      setError(error.response?.data?.message || error.message || 'Eroare la actualizarea păsării');
      window.scrollTo(0, 0);
    }
  };
  
  if (loading && !bird.name) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Editare pasăre: {bird.name}</h1>
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
            {renderImagePreview(bird.image, 'image')}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio
            </label>
            <div>
              <label className="cursor-pointer bg-blue-600 text-white py-2 px-4 rounded inline-block">
                Schimbă
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={handleAudioSelect}
                  ref={audioFileInputRef}
                />
              </label>
            </div>
            {bird.audio && bird.audio.url && (
              <div className="mt-3">
                <audio controls className="w-full">
                  <source src={bird.audio.url} type="audio/mpeg" />
                  Browser-ul tău nu suportă elementul audio.
                </audio>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descriere
          </label>
          <textarea
            name="description"
            value={bird.description}
            onChange={handleInputChange}
            rows="5"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          ></textarea>
        </div>

        {/* Secțiunea 2: Aspecte, Culori și Habitate */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Clasificare și Caracteristici</h3>
          
          {/* Aspecte */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Aspecte</h4>
            {bird.aspects.map((aspect, index) => (
              <div key={`aspect-${index}`} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nume aspect
                    </label>
                    <select
                      value={aspect.selectedId || ''}
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
                  <div className="w-32">
                    {aspect.image && (
                      <div className="mt-2">
                        <img 
                          src={aspect.image.url || aspect.image} 
                          alt={aspect.name} 
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('aspects', index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('aspects')}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
            >
              Adaugă aspect
            </button>
          </div>
          
          {/* Culori Penaj */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Culori Penaj</h4>
            {bird.featherColors.map((color, index) => (
              <div key={`color-${index}`} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Culoare
                    </label>
                    <select
                      value={color.selectedId || ''}
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
                  <div className="w-32">
                    {color.image && (
                      <div className="mt-2">
                        <img 
                          src={color.image.url || color.image} 
                          alt={color.name} 
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('featherColors', index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('featherColors')}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
            >
              Adaugă culoare
            </button>
          </div>
          
          {/* Habitate */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Habitate</h4>
            {bird.habitats.map((habitat, index) => (
              <div key={`habitat-${index}`} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Habitat
                    </label>
                    <select
                      value={habitat.selectedId || ''}
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
                  <div className="w-32">
                    {habitat.image && (
                      <div className="mt-2">
                        <img 
                          src={habitat.image.url || habitat.image} 
                          alt={habitat.name} 
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('habitats', index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('habitats')}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded"
            >
              Adaugă habitat
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-8 flex justify-between">
          <Link 
            to="/admin/birds" 
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Înapoi la lista de păsări
          </Link>
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={isUploading}
          >
            {isUploading ? 'Se actualizează...' : 'Salvează modificările'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BirdEdit;