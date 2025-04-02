// src/pages/admin/Birds.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBirds = () => {
  const [birds, setBirds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchBirds = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/birds', {
          withCredentials: true
        });
        setBirds(res.data.birds);
        setLoading(false);
      } catch (err) {
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
      await axios.delete(`http://localhost:5000/api/birds/${birdId}`, {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestionare păsări</h1>
        <a
          href="/admin/birds/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Adaugă pasăre nouă
        </a>
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                      {bird.images && bird.images[0] ? (
                        <img 
                          src={bird.images[0].url} 
                          alt={bird.name} 
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No img</span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">{bird.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 italic">{bird.scientificName || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/admin/birds/edit/${bird._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Editează
                    </a>
                    <button
                      onClick={() => handleDeleteBird(bird._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Șterge
                    </button>
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