// Configurări globale pentru aplicație
export const API_BASE_URL = 'http://localhost:5000';
export const IMAGES_PATH = '/Images';
export const SOUNDS_PATH = '/sounds';

// Funcții de utilitate pentru generarea URL-urilor
export const getImageUrl = (imagePath) => {
  if (!imagePath) return `${API_BASE_URL}/Images/placeholder-bird.png`;
  
  if (imagePath.startsWith('http')) {
    return `${imagePath}?t=${Date.now()}`;
  }
  
  return `${API_BASE_URL}/Images/${imagePath}?t=${Date.now()}`;
};

export const getAudioUrl = (audioPath) => {
  if (!audioPath) return null;
  
  if (audioPath.startsWith('http')) {
    return audioPath;
  }
  
  return `${API_BASE_URL}/sounds/${audioPath}`;
}; 