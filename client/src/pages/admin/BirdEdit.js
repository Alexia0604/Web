import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../config/config'; // importăm configurația pentru paths

const EditarePasare = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State inițial pentru pasăre
  const [pasare, setPasare] = useState({
    name: "",
    scientificName: "",
    englishName: "",
    family: "",
    order: "",
    description: "",
    aspects: [],
    featherColors: [],
    habitats: [],
    image: "",
    audio: ""
  });
  
  // State pentru fișiere
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Obținem datele păsării
  useEffect(() => {
    const fetchPasare = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/birds/${id}`);
        setPasare(response.data);
        
        // Setăm și previzualizarea imaginii
        if (response.data.image) {
          setImagePreview(`${config.assetsUrl}${response.data.image}`);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Eroare la încărcarea datelor păsării');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchPasare();
  }, [id]);
  
  // Handler pentru schimbările în input-uri
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasare(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler pentru obiecte din array-uri (aspecte, culori, habitate)
  const handleArrayObjectChange = (e, index, arrayName, field) => {
    const { value } = e.target;
    setPasare(prev => {
      const updatedArray = [...prev[arrayName]];
      updatedArray[index] = {
        ...updatedArray[index],
        [field]: value
      };
      return {
        ...prev,
        [arrayName]: updatedArray
      };
    });
  };
  
  // Handler pentru încărcarea de imagini pentru obiecte din array-uri
  const handleArrayImageUpload = async (e, index, arrayName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post('/api/admin/upload-bird-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setPasare(prev => {
          const updatedArray = [...prev[arrayName]];
          updatedArray[index] = {
            ...updatedArray[index],
            image: response.data.file.path
          };
          return {
            ...prev,
            [arrayName]: updatedArray
          };
        });
      }
    } catch (error) {
      console.error('Eroare la încărcarea imaginii:', error);
      alert('Eroare la încărcarea imaginii.');
    }
  };
  
  // Adaugă un element nou într-un array
  const handleAddArrayItem = (arrayName) => {
    setPasare(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { name: "", image: "" }]
    }));
  };
  
  // Șterge un element dintr-un array
  const handleRemoveArrayItem = (index, arrayName) => {
    setPasare(prev => {
      const updatedArray = [...prev[arrayName]];
      updatedArray.splice(index, 1);
      return {
        ...prev,
        [arrayName]: updatedArray
      };
    });
  };
  
  // Handler pentru fișierul de imagine
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (pasare.image) {
      formData.append('oldFilePath', pasare.image);
    }
    
    try {
      setLoading(true);
      const response = await axios.post('/api/admin/upload-bird-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setPasare(prev => ({
          ...prev,
          image: response.data.file.path
        }));
        setImagePreview(`${config.assetsUrl || ''}/Images/${response.data.file.path}`);
      }
      setLoading(false);
    } catch (error) {
      console.error('Eroare la încărcarea imaginii:', error);
      alert('Eroare la încărcarea imaginii.');
      setLoading(false);
    }
  };
  
  // Handler pentru fișierul audio
  const handleAudioChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (pasare.audio) {
      formData.append('oldFilePath', pasare.audio);
    }
    
    try {
      setLoading(true);
      const response = await axios.post('/api/admin/upload-bird-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setPasare(prev => ({
          ...prev,
          audio: response.data.file.path
        }));
        setAudioFile(null); // Resetăm fișierul pentru a folosi URL-ul de pe server
      }
      setLoading(false);
    } catch (error) {
      console.error('Eroare la încărcarea fișierului audio:', error);
      alert('Eroare la încărcarea fișierului audio.');
      setLoading(false);
    }
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Trimitem datele direct, fără FormData deoarece am încărcat deja fișierele
      const response = await axios.put(`/api/admin/birds/${id}`, pasare);
      
      if (response.data) {
        alert('Pasărea a fost actualizată cu succes!');
        // Redirecționăm către pagina de administrare a păsărilor
        navigate('/admin/birds');
      }
    } catch (err) {
      setError('Eroare la salvarea păsării: ' + (err.response?.data?.message || err.message));
      setLoading(false);
      console.error(err);
    }
  };
  
  if (loading && !pasare.name) {
    return <div className="text-center p-4">Se încarcă...</div>;
  }
  
  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Editare Pasăre: {pasare.name}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informații de bază */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nume:</label>
              <input
                type="text"
                name="name"
                value={pasare.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Denumire Științifică:</label>
              <input
                type="text"
                name="scientificName"
                value={pasare.scientificName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Denumire în Engleză:</label>
              <input
                type="text"
                name="englishName"
                value={pasare.englishName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Familie:</label>
              <input
                type="text"
                name="family"
                value={pasare.family}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Ordin:</label>
              <input
                type="text"
                name="order"
                value={pasare.order}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Descriere:</label>
              <textarea
                name="description"
                value={pasare.description}
                onChange={handleChange}
                rows="5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Imagine:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Previzualizare" 
                      className="h-32 object-contain"
                    />
                  </div>
                )}
                {pasare.image && !imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={`${config.assetsUrl || ''}/Images/${pasare.image}`} 
                      alt="Imagine pasăre" 
                      className="h-32 object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium">Audio:</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="mt-1 block w-full"
                />
                {pasare.audio && (
                  <div className="mt-2">
                    <audio 
                      controls 
                      src={`${config.audioUrl}/${pasare.audio}`}
                      className="w-full"
                    ></audio>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Aspecte */}
        <div className="border p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Aspecte</h3>
            <button 
              type="button"
              onClick={() => handleAddArrayItem('aspects')}
              className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adaugă aspect
            </button>
          </div>
          
          {pasare.aspects.map((aspect, index) => (
            <div key={`aspect-${index}`} className="border p-3 mb-3 rounded-md bg-gray-50">
              <div className="flex flex-col md:flex-row gap-3 mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Nume aspect:</label>
                  <input
                    type="text"
                    value={aspect.name || ""}
                    onChange={(e) => handleArrayObjectChange(e, index, 'aspects', 'name')}
                    className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    placeholder="Numele aspectului"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Imagine:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleArrayImageUpload(e, index, 'aspects')}
                    className="w-full"
                  />
                  {aspect.image && (
                    <div className="mt-2">
                      <img 
                        src={`${config.assetsUrl || ''}/Images/${aspect.image}`}
                        alt={aspect.name || "Imagine aspect"} 
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(index, 'aspects')}
                  className="px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                >
                  Șterge aspect
                </button>
              </div>
            </div>
          ))}
          
          {pasare.aspects.length === 0 && (
            <p className="text-gray-500 italic">Niciun aspect adăugat</p>
          )}
        </div>
        
        {/* Culori pene */}
        <div className="border p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Culori Pene</h3>
            <button 
              type="button"
              onClick={() => handleAddArrayItem('featherColors')}
              className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adaugă culoare
            </button>
          </div>
          
          {pasare.featherColors.map((color, index) => (
            <div key={`color-${index}`} className="border p-3 mb-3 rounded-md bg-gray-50">
              <div className="flex flex-col md:flex-row gap-3 mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Nume culoare:</label>
                  <input
                    type="text"
                    value={color.name || ""}
                    onChange={(e) => handleArrayObjectChange(e, index, 'featherColors', 'name')}
                    className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    placeholder="Numele culorii"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Imagine:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleArrayImageUpload(e, index, 'featherColors')}
                    className="w-full"
                  />
                  {color.image && (
                    <div className="mt-2">
                      <img 
                        src={`${config.assetsUrl || ''}/Images/${color.image}`}
                        alt={color.name || "Imagine culoare"} 
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(index, 'featherColors')}
                  className="px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                >
                  Șterge culoare
                </button>
              </div>
            </div>
          ))}
          
          {pasare.featherColors.length === 0 && (
            <p className="text-gray-500 italic">Nicio culoare adăugată</p>
          )}
        </div>
        
        {/* Habitate */}
        <div className="border p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Habitate</h3>
            <button 
              type="button"
              onClick={() => handleAddArrayItem('habitats')}
              className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              + Adaugă habitat
            </button>
          </div>
          
          {pasare.habitats.map((habitat, index) => (
            <div key={`habitat-${index}`} className="border p-3 mb-3 rounded-md bg-gray-50">
              <div className="flex flex-col md:flex-row gap-3 mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Nume habitat:</label>
                  <input
                    type="text"
                    value={habitat.name || ""}
                    onChange={(e) => handleArrayObjectChange(e, index, 'habitats', 'name')}
                    className="w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    placeholder="Numele habitatului"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Imagine:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleArrayImageUpload(e, index, 'habitats')}
                    className="w-full"
                  />
                  {habitat.image && (
                    <div className="mt-2">
                      <img 
                        src={`${config.assetsUrl || ''}/Images/${habitat.image}`}
                        alt={habitat.name || "Imagine habitat"} 
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(index, 'habitats')}
                  className="px-2 py-1 bg-red-600 text-white rounded-md text-sm"
                >
                  Șterge habitat
                </button>
              </div>
            </div>
          ))}
          
          {pasare.habitats.length === 0 && (
            <p className="text-gray-500 italic">Niciun habitat adăugat</p>
          )}
        </div>
        
        {/* Butoane acțiuni */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/birds')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md"
          >
            Anulează
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md"
            disabled={loading}
          >
            {loading ? 'Se salvează...' : 'Salvează modificările'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarePasare;