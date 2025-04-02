// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
          withCredentials: true
        });
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        setError('Eroare la încărcarea statisticilor');
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panou de administrare</h1>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
          Admin: {user?.username}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Utilizatori</h2>
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold">{stats?.users?.total || 0}</span>
            <Link to="/admin/users" className="text-indigo-600 hover:text-indigo-800">
              Gestionează
            </Link>
          </div>
          <div className="mt-4 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Utilizatori standard:</span>
              <span className="font-medium">{stats?.users?.regular || 0}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Administratori:</span>
              <span className="font-medium">{stats?.users?.admins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilizatori noi (30 zile):</span>
              <span className="font-medium">{stats?.users?.newLast30Days || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Păsări în catalog</h2>
          <div className="flex justify-between items-center">
            <span className="text-3xl font-bold">{stats?.birds?.total || 0}</span>
            <Link to="/admin/birds" className="text-indigo-600 hover:text-indigo-800">
              Gestionează
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Acțiuni rapide</h2>
          <div className="space-y-2">
            <Link to="/admin/birds/add" className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center">
              Adaugă pasăre nouă
            </Link>
            <Link to="/admin/users/add" className="block w-full px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 text-center">
              Adaugă utilizator nou
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Activitate recentă</h2>
          <div className="text-center py-8 text-gray-500">
            Funcționalitate în dezvoltare
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Statistici sistem</h2>
          <div className="text-center py-8 text-gray-500">
            Funcționalitate în dezvoltare
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;