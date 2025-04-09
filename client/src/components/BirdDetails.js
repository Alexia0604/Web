import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

const BirdDetails = ({ bird, toggleFavorite, isAuthenticated, isFavorite, similarBirds }) => {
  // Helper pentru a obține URL-ul corect pentru audio
  const getAudioUrl = (audioPath) => {
    if (!audioPath) return null;
    
    // Dacă avem deja un URL complet, îl returnăm
    if (audioPath.startsWith('http')) {
      return audioPath;
    }
    
    // Toate fișierele audio sunt în Images, nu în sounds
    return `http://localhost:5000/Images/${audioPath}`;
  };

  // Afișăm playerul audio doar dacă avem un fișier audio
  const renderAudio = () => {
    if (!bird.audio) return null;
    
    const audioUrl = getAudioUrl(bird.audio);
    
    return (
      <div className="audio-player mb-4">
        <h3 className="text-xl font-bold mb-2">Sunet</h3>
        <audio controls className="w-full">
          <source src={audioUrl} type="audio/mpeg" />
          Browser-ul dvs. nu suportă redarea audio.
        </audio>
      </div>
    );
  };

  // Helper pentru a obține URL-ul corect pentru imagine
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-bird.jpg';
    
    // Dacă avem deja un URL complet, îl returnăm
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Dacă avem doar numele fișierului, construim URL-ul
    return `http://localhost:5000/Images/${imagePath}`;
  };

  return (
    <div className="bird-details p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">{bird.name}</h1>
        {isAuthenticated && (
          <button 
            onClick={() => toggleFavorite(bird._id)}
            className="favorite-btn text-2xl focus:outline-none"
            aria-label={isFavorite ? "Șterge de la favorite" : "Adaugă la favorite"}
          >
            <FontAwesomeIcon 
              icon={isFavorite ? solidHeart : regularHeart} 
              className={isFavorite ? "text-red-500" : "text-gray-400"} 
            />
          </button>
        )}
      </div>
      
      <div className="bird-image mb-4">
        <img 
          src={getImageUrl(bird.image)} 
          alt={bird.name} 
          className="w-full h-auto rounded-lg shadow-sm"
        />
      </div>
      
      {renderAudio()}
      
      <div className="bird-info grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Detalii științifice</h3>
          <p><strong>Denumire științifică:</strong> <em>{bird.scientificName}</em></p>
          <p><strong>Denumire în engleză:</strong> {bird.englishName}</p>
          <p><strong>Familie:</strong> {bird.family}</p>
          <p><strong>Ordin:</strong> {bird.order}</p>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-2">Caracteristici</h3>
          {bird.size && <p><strong>Mărime:</strong> {bird.size}</p>}
          {bird.weight && <p><strong>Greutate:</strong> {bird.weight}</p>}
          {bird.wingspan && <p><strong>Anvergură aripi:</strong> {bird.wingspan}</p>}
          {bird.lifespan && <p><strong>Speranță de viață:</strong> {bird.lifespan}</p>}
        </div>
      </div>
      
      <div className="bird-description mb-6">
        <h3 className="text-xl font-bold mb-2">Descriere</h3>
        <p className="text-gray-700 whitespace-pre-line">{bird.description}</p>
      </div>
      
      {bird.habitats && bird.habitats.length > 0 && (
        <div className="bird-habitats mb-6">
          <h3 className="text-xl font-bold mb-2">Habitate</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bird.habitats.map((habitat, index) => (
              <div key={index} className="habitat bg-gray-100 p-3 rounded-lg">
                {habitat.image && (
                  <img 
                    src={getImageUrl(habitat.image)} 
                    alt={habitat.name} 
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <h4 className="font-bold">{habitat.name}</h4>
                <p className="text-sm text-gray-700">{habitat.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {similarBirds && similarBirds.length > 0 && (
        <div className="similar-birds">
          <h3 className="text-xl font-bold mb-2">Păsări similare</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarBirds.map(similarBird => (
              <Link 
                to={`/birds/${similarBird._id}`} 
                key={similarBird._id}
                className="similar-bird bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition"
              >
                <img 
                  src={getImageUrl(similarBird.image)} 
                  alt={similarBird.name} 
                  className="w-full h-24 object-cover rounded-lg mb-1"
                />
                <p className="text-center font-medium">{similarBird.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BirdDetails; 