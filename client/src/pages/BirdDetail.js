import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BirdDetail = () => {
  const { id } = useParams();
  const [bird, setBird] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBird = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/birds/${id}`);
        setBird(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Eroare la încărcarea datelor');
      } finally {
        setLoading(false);
      }
    };

    fetchBird();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Eroare!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!bird) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Atenție!</strong>
          <span className="block sm:inline"> Pasărea nu a fost găsită.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{bird.name}</h1>
          
          {bird.image && (
            <div className="mb-6">
              <img
                src={bird.image}
                alt={bird.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Caracteristici</h2>
              <ul className="space-y-2">
                <li><span className="font-medium">Specie:</span> {bird.species}</li>
                <li><span className="font-medium">Familie:</span> {bird.family}</li>
                <li><span className="font-medium">Habitat:</span> {bird.habitat}</li>
                <li><span className="font-medium">Dimensiune:</span> {bird.size}</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Descriere</h2>
              <p className="text-gray-600">{bird.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirdDetail; 