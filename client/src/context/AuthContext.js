import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  axios.defaults.withCredentials = true;

  const checkAuthStatus = async () => {
    try {
      console.log('Checking authentication status...');
      const response = await axios.get(`${API_URL}/auth/me`);
      const userData = response.data.user;
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      console.log('Auth state updated:', userData);
    } catch (error) {
      console.error('Error checking auth status:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
      }
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initial auth check on mount');
    checkAuthStatus();
  }, []);

  const login = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/auth/login`, formData, {
        withCredentials: true,
      });

      console.log('Login response:', res.data);

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res.data;
      } else {
        throw new Error('Login failed: No user data returned');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Eroare la autentificare');
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/auth/register`, formData, {
        withCredentials: true,
      });

      console.log('Register response:', res.data);

      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        return res.data;
      } else {
        throw new Error('Registration failed: No user data returned');
      }
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Eroare la înregistrare');
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('User logged out successfully');
    } catch (err) {
      console.error('Logout error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Eroare la deconectare');
    }
  };

  const updateProfileImage = async (profileImageData) => {
    if (user && user.role !== 'guest') {
      console.log('Actualizare imagine profil:', profileImageData);
      
      // Dacă avem un obiect complet, îl folosim direct
      if (typeof profileImageData === 'object' && profileImageData.url) {
        setUser((prev) => ({
          ...prev,
          profileImage: profileImageData,
        }));
      } 
      // Dacă avem doar un URL, îl folosim pentru compatibilitate cu codul existent
      else if (typeof profileImageData === 'string') {
        setUser((prev) => ({
          ...prev,
          profileImage: profileImageData,
        }));
      }
      // Dacă nu avem nimic valid, nu facem nimic
      else {
        console.warn('Format nevalid pentru imagine profil:', profileImageData);
      }
    }
  };

  const hasPermission = (requiredRole) => {
    console.log('Checking permission - user:', user);
    console.log('Required role:', requiredRole);

    if (!user) return false;

    if (requiredRole === 'admin') {
      return user.role === 'admin';
    }

    if (requiredRole === 'user') {
      return user.role === 'user' || user.role === 'admin';
    }

    return true; // Guest access
  };

  useEffect(() => {
    console.log('Auth state updated:', { user, isAuthenticated, loading });
  }, [user, isAuthenticated, loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        isGuest: !user,
        updateProfileImage,
        hasPermission,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie folosit în interiorul unui AuthProvider');
  }
  return context;
};