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

  const checkLoggedIn = async (retryCount = 0, maxRetries = 2) => {
    try {
      console.log('Checking authentication status...');
      
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true,
      });

      console.log('Response from /auth/me:', response.data);

      if (response.data.success && response.data.user) {
        const userData = response.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        console.log('User authenticated successfully:', userData);
      } else {
        console.log('No valid user data in response');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      if (error.response?.status === 401 && retryCount < maxRetries) {
        console.log(`Retrying auth check (${retryCount + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return checkLoggedIn(retryCount + 1, maxRetries);
      }
      if (error.response?.status === 404) {
        console.log('User not found, clearing auth state');
        setUser(null);
        setIsAuthenticated(false);
        // Opțional: șterge cookie-ul din browser
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Initial auth check on mount');
    checkLoggedIn();
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

  const updateProfileImage = async (imageUrl) => {
    if (user && user.role !== 'guest') {
      setUser((prev) => ({
        ...prev,
        profileImage: imageUrl,
      }));
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
        logout,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        isGuest: !user,
        updateProfileImage,
        hasPermission,
        checkLoggedIn,
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