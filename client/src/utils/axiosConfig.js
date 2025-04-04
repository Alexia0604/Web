import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configurare globală pentru axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor pentru request-uri
axiosInstance.interceptors.request.use(
  (config) => {
    // Poți adăuga aici logica pentru token sau alte header-uri
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pentru răspunsuri
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Poți adăuga aici logica pentru deconectare sau reîmprospătare token
      console.error('Sesiune expirată. Te rugăm să te autentifici din nou.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 