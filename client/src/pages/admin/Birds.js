// src/pages/admin/Birds.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminBirds = () => {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBirds = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/birds', {
          withCredentials: true
        });
        
        // Folosim direct păsările returnate de server
        setBirds(res.data.birds);
        setLoading(false);
      } catch (err) {
        console.error('Eroare la încărcarea păsărilor:', err);
        setError('Eroare la încărcarea păsărilor');
        setLoading(false);
      }
    };

    fetchBirds();
  }, []);

  const handleDeleteBird = async (birdId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi această pasăre?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/birds/${birdId}`, {
        withCredentials: true
      });
      
      // Actualizare stare locală
      setBirds(birds.filter(bird => bird._id !== birdId));
      
      setSuccessMessage('Pasărea a fost ștearsă cu succes');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Eroare la ștergerea păsării');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filtrare păsări după termenul de căutare
  const filteredBirds = birds.filter(bird => 
    bird.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bird.scientificName && bird.scientificName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Gestionare păsări</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to="/admin" 
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
            Înapoi la panou
          </Link>
          <Link
            to="/admin/birds/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full sm:w-auto text-center"
          >
            Adaugă pasăre nouă
          </Link>
        </div>
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

      <div className="mb-6">
        <input
          type="text"
          placeholder="Caută după nume..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pasăre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Denumire științifică
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBirds.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  Nu s-au găsit păsări care să corespundă căutării
                </td>
              </tr>
            ) : (
              filteredBirds.map(bird => (
                <tr key={bird._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {bird.image && bird.image.url ? (
                        <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={bird.image.url} 
                            alt={bird.name} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error('Eroare la încărcarea imaginii:', bird.image.url);
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.nextElementSibling;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        </div>
                      ) : null}
                      <div 
                        className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center"
                        style={{ display: bird.image ? 'none' : 'flex' }}
                      >
                        <span className="text-gray-500 text-xs">No img</span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{bird.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 italic">{bird.scientificName || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-4">
                      <Link
                        to={`/admin/birds/edit/${bird._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editează
                      </Link>
                      <button
                        onClick={() => handleDeleteBird(bird._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBirds;