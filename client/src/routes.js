import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BirdEncyclopedia from './pages/BirdEncyclopedia';
import BirdFilter from './pages/BirdFilter';
import Contact from './components/Contact';
import About from './components/About';
import { PrivateRoute, AdminRoute } from './components/routing/ProtectedRoute';
import Favorites from './pages/user/Favorites';
import Profile from './pages/user/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminBirds from './pages/admin/Birds';
import NotFound from './pages/NotFound';
import BirdQuizGame from './pages/BirdQuizGame';
import QuizHistory from './pages/QuizHistory';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rute publice */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/encyclopedia" element={<BirdEncyclopedia />} />
      <Route path="/search" element={<BirdFilter />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />

      {/* Rute protejate - folosind componenta PrivateRoute direct */}
      <Route path="/games" element={
        <PrivateRoute>
          <BirdQuizGame />
        </PrivateRoute>
      } />
      <Route path="/quiz-history" element={
  <PrivateRoute>
    <QuizHistory />
  </PrivateRoute>
} />
      <Route path="/favorites" element={
        <PrivateRoute>
          <Favorites />
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />

      {/* Rute admin */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      } />
      <Route path="/admin/birds" element={
        <AdminRoute>
          <AdminBirds />
        </AdminRoute>
      } />

      {/* Rută 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;