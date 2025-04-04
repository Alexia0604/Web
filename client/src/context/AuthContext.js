// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Crearea contextului de autentificare
const AuthContext = createContext();

// URL de bază pentru API
const API_URL = 'http://localhost:5000/api';

// Funcție pentru obținerea unui cookie după nume
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Configurare axios pentru a include cookie-urile în cereri
  axios.defaults.withCredentials = true;

  const checkLoggedIn = async () => {
    try {
      setLoading(true);
      // Verificăm mai întâi cookie-ul, apoi localStorage
      let token = getCookie('token') || localStorage.getItem('token');
      console.log('Verificare token:', token); // Debug
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });

      console.log('Răspuns verificare autentificare:', response.data); // Debug

      if (response.data.success && response.data.user) {
        setIsAuthenticated(true);
        setUser(response.data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Eroare la verificarea autentificării:', error);
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Verifică autentificarea la încărcarea aplicației
  useEffect(() => {
    const token = getCookie('token');
    console.log('Token la încărcare:', token); // Debug
    if (token) {
      checkLoggedIn();
    } else {
      setLoading(false);
    }
  }, []);

  // Monitorizează schimbările în cookie
  useEffect(() => {
    const handleStorageChange = () => {
      const token = getCookie('token');
      if (!token && isAuthenticated) {
        setIsAuthenticated(false);
        setUser(null);
      } else if (token && !isAuthenticated) {
        checkLoggedIn();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  // Funcție pentru înregistrare
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      if (res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
      }
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la înregistrare');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru autentificare
  const login = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Încercare autentificare cu:', formData); // Debug
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      }, {
        withCredentials: true
      });
      
      console.log('Răspuns autentificare:', res.data); // Debug
      
      if (res.data.success && res.data.user) {
        // Salvăm token-ul în localStorage pentru persistență
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setIsAuthenticated(true);
        console.log('Autentificare reușită:', res.data.user);
      } else {
        throw new Error('Răspuns invalid de la server');
      }
      
      return res.data;
    } catch (err) {
      console.error('Eroare la autentificare:', err); // Debug
      setError(err.response?.data?.message || 'Eroare la autentificare');
      setIsAuthenticated(false);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru deconectare
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la deconectare');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru actualizarea imaginii de profil
  const updateProfileImage = async (imageUrl) => {
    if (user && user.role !== 'guest') {
      setUser(prev => ({
        ...prev,
        profileImage: imageUrl
      }));
    }
  };

  // Verificare permisiuni bazate pe rol
  const hasPermission = (requiredRole) => {
    if (!user) return false;
    
    if (requiredRole === 'admin') {
      return user.role === 'admin';
    }
    
    if (requiredRole === 'user') {
      return user.role === 'user' || user.role === 'admin';
    }
    
    // Guest - toți utilizatorii au acces
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfileImage,
        hasPermission,
        isAuthenticated,
        isAdmin: user && user.role === 'admin',
        isGuest: !user || user.role === 'guest'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook pentru utilizarea contextului de autentificare
export const useAuth = () => useContext(AuthContext);