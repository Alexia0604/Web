// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Crearea contextului de autentificare
const AuthContext = createContext();

// URL de bază pentru API
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configurare axios pentru a include cookie-urile în cereri
  axios.defaults.withCredentials = true;

  // Verifică autentificarea la încărcarea aplicației
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        // Verifică mai întâi dacă există semne de autentificare
        // Poți verifica localStorage, sessionStorage sau cookies
        const hasAuthToken = document.cookie.includes('authToken=') || localStorage.getItem('authToken');
        
        if (!hasAuthToken) {
          // Dacă nu există token, setăm direct rolul ca 'guest' fără a face cerere
          setUser({ role: 'guest' });
          setLoading(false);
          return;
        }
        
        // Dacă există token, verificăm validitatea lui
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser(res.data);
      } catch (err) {
        // Dacă tokenul nu este valid, setăm rolul 'guest'
        setUser({ role: 'guest' });
      } finally {
        setLoading(false);
      }
    };
  
    checkLoggedIn();
  }, []);

  // Funcție pentru înregistrare
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      setUser(res.data.user);
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
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la autentificare');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Funcție pentru deconectare
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/logout`);
      setUser({ role: 'guest' });
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la deconectare');
      throw err;
    } finally {
      setLoading(false);
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
        hasPermission,
        isAuthenticated: user && user.role !== 'guest',
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