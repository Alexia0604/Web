import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Funcție pentru rezolvarea URL-urilor de imagini
const resolveImageUrl = (imagePath) => {
  // Dacă imaginea este deja un URL complet, returnează-l
  if (imagePath?.startsWith('http')) return imagePath;
  
  // Altfel, folosește URL-ul de bază pentru imagini
  return imagePath 
    ? (imagePath.startsWith('/') 
      ? imagePath 
      : `/images/${imagePath}`)
    : '/images/placeholder-bird.png';
};

// Procesează o pasăre pentru a avea URL-uri corecte
const processBird = (bird) => {
  if (!bird) return null;

  return {
    ...bird,
    imageUrl: resolveImageUrl(bird.imageUrl || bird.image),
    aspects: bird.aspects?.map(aspect => ({
      ...aspect,
      imageUrl: resolveImageUrl(aspect.imageUrl || aspect.image)
    })),
    featherColors: bird.featherColors?.map(color => ({
      ...color,
      imageUrl: resolveImageUrl(color.imageUrl || color.image)
    })),
    habitats: bird.habitats?.map(habitat => ({
      ...habitat,
      imageUrl: resolveImageUrl(habitat.imageUrl || habitat.image)
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
    
    return {
      birds: response.data.birds.map(processBird),
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('Eroare la obținerea păsărilor:', error);
    throw error;
  }
};

// Obține mai multe păsări după ID-uri
export const getBirdsByIds = async (ids) => {
  try {
    const response = await axios.get(`${API_URL}/birds/byIds`, {
      params: { ids: ids.join(',') }
    });
    
    return response.data.map(processBird);
  } catch (error) {
    console.error('Eroare la obținerea păsărilor după ID-uri:', error);
    throw error;
  }
};

// Obține o singură pasăre după ID
export const getBirdById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/birds/${id}`);
    return processBird(response.data);
  } catch (error) {
    console.error(`Eroare la obținerea păsării cu ID ${id}:`, error);
    throw error;
  }
};

// Obține opțiunile de filtrare
export const getFilterOptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/birds/filter-options`);
    
    // Procesează opțiunile de filtrare pentru a avea imagini corecte
    return {
      aspects: response.data.aspects.map(aspect => ({
        ...aspect,
        image: resolveImageUrl(aspect.image)
      })),
      featherColors: response.data.featherColors.map(color => ({
        ...color,
        image: resolveImageUrl(color.image)
      })),
      habitats: response.data.habitats.map(habitat => ({
        ...habitat,
        image: resolveImageUrl(habitat.image)
      }))
    };
  } catch (error) {
    console.error('Eroare la obținerea opțiunilor de filtrare:', error);
    throw error;
  }
};

// Filtrează păsările după criterii
export const filterBirds = async (criteria) => {
  try {
    const response = await axios.get(`${API_URL}/birds/filter`, {
      params: criteria
    });
    
    return response.data.map(processBird);
  } catch (error) {
    console.error('Eroare la filtrarea păsărilor:', error);
    throw error;
  }
};