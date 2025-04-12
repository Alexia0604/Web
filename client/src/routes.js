import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.js';
import Signup from './pages/Signup.js';
import BirdEncyclopedia from './pages/BirdEncyclopedia.jsx';
import BirdFilter from './pages/BirdFilter.jsx';
import Contact from './components/Contact.jsx';
import { PrivateRoute, AdminRoute } from './components/routing/ProtectedRoute.js';
import Favorites from './pages/user/Favorites.js';
import Profile from './pages/user/Profile.js';
import AdminDashboard from './pages/admin/Dashboard.js';
import AdminUsers from './pages/admin/Users.js';
import AdminBirds from './pages/admin/Birds.js';
import AdminBirdAdd from './pages/admin/BirdAdd.js';
import AdminBirdEdit from './pages/admin/BirdEdit.js';
import NotFound from './pages/NotFound.js';
import BirdQuizGame from './pages/BirdQuizGame.js';
import QuizHistory from './pages/QuizHistory.js';
import BirdDetail from './pages/BirdDetail.js';
import Quiz from './pages/Quiz.js';
import ForgotPassword from './pages/ForgotPassword.js';
import Forum from './pages/Forum/Forum.js';
import NewTopic from './pages/Forum/NewTopic.js';
import TopicView from './pages/Forum/TopicView.js';

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
      <Route path="/birds/:id" element={<BirdDetail />} />
      <Route path="/birds/filter" element={<BirdFilter />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/forum" element={<Forum />} />
      <Route path="/forum/topic/:id" element={<TopicView />} />

      {/* Rute protejate - folosind componenta PrivateRoute direct */}
      <Route path="/forum/new-topic" element={
        <PrivateRoute>
          <NewTopic />
        </PrivateRoute>
      } />
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
      <Route path="/admin/birds/add" element={
        <AdminRoute>
          <AdminBirdAdd />
        </AdminRoute>
      } />

       {/* Rută pentru editarea păsărilor */}
       <Route path="/admin/birds/edit/:id" element={
        <AdminRoute>
          <AdminBirdEdit />
        </AdminRoute>
      } />

      {/* Rută 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;