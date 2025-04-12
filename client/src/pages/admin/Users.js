// src/pages/admin/Users.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          withCredentials: true
        });
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        setError('Eroare la încărcarea utilizatorilor');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePromoteToAdmin = async (userId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}/role`,
        { role: 'admin' }, // Trimitem noul rol în body
        { withCredentials: true }
      );
      setUsers(users.map(user =>
        user._id === userId ? { ...user, role: 'admin' } : user
      ));
      setSuccessMessage('Utilizatorul a fost promovat la administrator');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Eroare promovare:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(err.response?.data?.message || 'Eroare la promovarea utilizatorului');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        withCredentials: true
      });
      
      // Actualizare stare locală
      setUsers(users.filter(user => user._id !== userId));
      
      setSuccessMessage('Utilizatorul a fost șters cu succes');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Eroare la ștergerea utilizatorului');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filtrare utilizatori după termenul de căutare
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Gestionare utilizatori</h1>
        <Link 
          to="/admin" 
          className="flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" 
            />
          </svg>
          Înapoi la panou
        </Link>
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Caută după nume sau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilizator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acțiuni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Nu s-au găsit utilizatori care să corespundă căutării
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                        {user.profileImage ? (
                          <img
                            src={`http://localhost:5000/uploads/profile-images/${user.profileImage}`}
                            alt={user.username}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.parentElement.nextElementSibling;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                      </div>
                      <div 
                        className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center"
                        style={{ display: user.profileImage ? 'none' : 'flex' }}
                      >
                        <span className="text-gray-500 text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handlePromoteToAdmin(user._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Fă admin
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;