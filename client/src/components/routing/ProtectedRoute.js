import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Rută protejată pentru utilizatori autentificați (User și Admin)
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

// Rută protejată doar pentru administratori
export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>;
  }

  // Verificăm dacă utilizatorul este autentificat și are rolul de admin
  const hasAdminAccess = isAuthenticated && user && user.role === 'admin';
  
  console.log('AdminRoute - User:', user);
  console.log('AdminRoute - isAuthenticated:', isAuthenticated);
  console.log('AdminRoute - hasAdminAccess:', hasAdminAccess);
  
  return hasAdminAccess ? children : <Navigate to="/" state={{ from: location }} replace />;
};