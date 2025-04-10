import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

const BirdEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State inițial pentru pasăre
  const [formData, setFormData] = useState({
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
  
  // Obținem datele păsării
  useEffect(() => {
    const fetchBird = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/birds/${id}`, {
          withCredentials: true
        });
        const bird = response.data;
        setFormData({
          ...bird,
          image: bird.image || null,
          audio: bird.audio || null,
          aspects: bird.aspects || [],
          featherColors: bird.featherColors || [],
          habitats: bird.habitats || []
        });
        
        // Setăm și previzualizarea imaginii
        if (bird.image) {
          setImagePreview(`${API_BASE_URL}/Images/${bird.image}`);
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
  
  // Handler pentru schimbările în input-uri
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler pentru obiecte din array-uri (aspecte, culori, habitate)
  const handleArrayObjectChange = (e, index, arrayName, field) => {
    const { value } = e.target;
    setFormData(prev => {
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
      const response = await axios.post(`${API_BASE_URL}/api/admin/upload-bird-file`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setFormData(prev => {
          const updatedArray = [...prev[arrayName]];
          updatedArray[index] = {
            ...updatedArray[index],
            image: {
              url: response.data.file.url,
              public_id: response.data.file.public_id,
              filename: response.data.file.filename
            }
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
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], { name: "", image: "" }]
    }));
  };
  
  // Șterge un element dintr-un array
  const handleRemoveArrayItem = (index, arrayName) => {
    setFormData(prev => {
      const updatedArray = [...prev[arrayName]];
      updatedArray.splice(index, 1);
      return {
        ...prev,
        [arrayName]: updatedArray
      };
    });
  };
  
  // Handler pentru fișierul de imagine
  const handleImageChange = async (e, field, arrayField = null, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/upload-bird-file`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { url, public_id, filename } = response.data;
      
      if (arrayField) {
        setFormData(prev => {
          const newArray = [...prev[arrayField]];
          newArray[index] = {
            ...newArray[index],
            image: { url, public_id, filename }
          };
          return { ...prev, [arrayField]: newArray };
        });
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: { url, public_id, filename }
        }));
      }
    } catch (error) {
      console.error('Eroare la încărcarea imaginii:', error);
      alert('Eroare la încărcarea imaginii.');
    }
  };
  
  // Handler pentru fișierul audio
  const handleAudioChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/admin/upload-bird-file`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          audio: {
            url: response.data.file.url,
            public_id: response.data.file.public_id,
            filename: response.data.file.filename
          }
        }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Eroare la încărcarea fișierului audio:', error);
      alert('Eroare la încărcarea fișierului audio.');
      setLoading(false);
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
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/api/admin/birds/${id}`, formData, {
        withCredentials: true
      });
      navigate('/admin/birds');
    } catch (error) {
      console.error('Eroare la actualizarea păsării:', error);
      setError('Eroare la actualizarea păsării');
      setLoading(false);
    }
  };
  
  if (loading && !formData.name) {
    return <div className="text-center p-4">Se încarcă...</div>;
  }
  
  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Editare Pasăre: {formData.name}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informații de bază */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nume:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
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
                value={formData.scientificName}
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
                value={formData.englishName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Familie:</label>
              <input
                type="text"
                name="family"
                value={formData.family}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium">Ordin:</label>
              <input
                type="text"
                name="order"
                value={formData.order}
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
                value={formData.description}
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
                  onChange={(e) => handleImageChange(e, 'image')}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {formData.image && renderImagePreview(formData.image, 'image')}
              </div>
              
              <div>
                <label className="block text-sm font-medium">Audio:</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="mt-1 block w-full"
                />
                {formData.audio && (
                  <audio controls className="mt-2">
                    <source src={formData.audio.url} type="audio/mpeg" />
                    Browser-ul tău nu suportă elementul audio.
                  </audio>
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
          
          {formData.aspects.map((aspect, index) => (
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
                  {aspect.image?.url && (
                    <div className="mt-2">
                      <img 
                        src={aspect.image.url}
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
          
          {formData.aspects.length === 0 && (
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
          
          {formData.featherColors.map((color, index) => (
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
                  {color.image?.url && (
                    <div className="mt-2">
                      <img 
                        src={color.image.url}
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
          
          {formData.featherColors.length === 0 && (
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
          
          {formData.habitats.map((habitat, index) => (
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
                  {habitat.image?.url && (
                    <div className="mt-2">
                      <img 
                        src={habitat.image.url}
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
          
          {formData.habitats.length === 0 && (
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

export default BirdEdit;