import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Funcție pentru rezolvarea URL-urilor de imagini
const resolveImageUrl = (image) => {
  if (!image) return '/images/placeholder-bird.png';
  
  // Dacă imaginea este un obiect Cloudinary
  if (typeof image === 'object' && image.url) {
    return image.url;
  }
  
  // Dacă imaginea este un string (URL sau path)
  if (typeof image === 'string') {
    if (image.startsWith('http')) {
      return image;
    }
    return `/images/${image}`;
  }
  
  return '/images/placeholder-bird.png';
};

// Funcție pentru rezolvarea URL-urilor audio
const resolveAudioUrl = (audio) => {
  if (!audio) return '';
  
  // Dacă audio este un obiect Cloudinary
  if (typeof audio === 'object' && audio.url) {
    return audio.url;
  }
  
  // Dacă audio este un string (URL sau path)
  if (typeof audio === 'string') {
    if (audio.startsWith('http')) {
      return audio;
    }
    return `/audio/${audio}`;
  }
  
  return '';
};

// Procesează o pasăre pentru a avea URL-uri corecte
const processBird = (bird) => {
  if (!bird) return null;

  return {
    ...bird,
    imageUrl: resolveImageUrl(bird.image),
    audioUrl: resolveAudioUrl(bird.audio),
    aspects: bird.aspects?.map(aspect => ({
      ...aspect,
      imageUrl: resolveImageUrl(aspect.image)
    })),
    featherColors: bird.featherColors?.map(color => ({
      ...color,
      imageUrl: resolveImageUrl(color.image)
    })),
    habitats: bird.habitats?.map(habitat => ({
      ...habitat,
      imageUrl: resolveImageUrl(habitat.image)
    }))
  };
};

// Obține toate păsările cu paginare
export const getAllBirds = async (page = 1, limit = 12, searchTerm = '') => {
  try {
    const response = await axios.get(`${API_URL}/birds`, {
      params: {
        page,
        limit,
        search: searchTerm
      }
    });
    
    if (!response.data || !response.data.birds) {
      throw new Error('Răspuns invalid de la server');
    }

    return {
      birds: response.data.birds.map(processBird),
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Eroare la obținerea păsărilor:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Eroare la obținerea păsărilor');
    } else if (error.request) {
      throw new Error('Nu s-a putut comunica cu serverul. Verificați conexiunea la internet.');
    } else {
      throw new Error(error.message || 'A apărut o eroare neașteptată');
    }
  }
};

// Obține mai multe păsări după ID-uri
export const getBirdsByIds = async (ids) => {
  try {
    const response = await axios.get(`${API_URL}/birds/byIds`, {
      params: { ids: ids.join(',') }
    });
    
    if (!response.data) {
      throw new Error('Răspuns invalid de la server');
    }

    return response.data.map(processBird);
  } catch (error) {
    console.error('Eroare la obținerea păsărilor după ID-uri:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Eroare la obținerea păsărilor');
    } else if (error.request) {
      throw new Error('Nu s-a putut comunica cu serverul. Verificați conexiunea la internet.');
    } else {
      throw new Error(error.message || 'A apărut o eroare neașteptată');
    }
  }
};

// Obține o singură pasăre după ID
export const getBirdById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/birds/${id}`);
    
    if (!response.data) {
      throw new Error('Răspuns invalid de la server');
    }

    return processBird(response.data);
  } catch (error) {
    console.error(`Eroare la obținerea păsării cu ID ${id}:`, error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Eroare la obținerea păsării');
    } else if (error.request) {
      throw new Error('Nu s-a putut comunica cu serverul. Verificați conexiunea la internet.');
    } else {
      throw new Error(error.message || 'A apărut o eroare neașteptată');
    }
  }
};

// Obține opțiunile de filtrare
export const getFilterOptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/birds/filter-options`);
    
    if (!response.data) {
      throw new Error('Răspuns invalid de la server');
    }

    return {
      aspects: response.data.aspects?.map(aspect => ({
        ...aspect,
        image: resolveImageUrl(aspect.image)
      })) || [],
      featherColors: response.data.featherColors?.map(color => ({
        ...color,
        image: resolveImageUrl(color.image)
      })) || [],
      habitats: response.data.habitats?.map(habitat => ({
        ...habitat,
        image: resolveImageUrl(habitat.image)
      })) || []
    };
  } catch (error) {
    console.error('Eroare la obținerea opțiunilor de filtrare:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Eroare la obținerea opțiunilor de filtrare');
    } else if (error.request) {
      throw new Error('Nu s-a putut comunica cu serverul. Verificați conexiunea la internet.');
    } else {
      throw new Error(error.message || 'A apărut o eroare neașteptată');
    }
  }
};

// Filtrează păsările după criterii
export const filterBirds = async (criteria) => {
  try {
    const response = await axios.get(`${API_URL}/birds/filter`, {
      params: criteria
    });
    
    if (!response.data) {
      throw new Error('Răspuns invalid de la server');
    }

    return response.data.map(processBird);
  } catch (error) {
    console.error('Eroare la filtrarea păsărilor:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Eroare la filtrarea păsărilor');
    } else if (error.request) {
      throw new Error('Nu s-a putut comunica cu serverul. Verificați conexiunea la internet.');
    } else {
      throw new Error(error.message || 'A apărut o eroare neașteptată');
    }
  }
};