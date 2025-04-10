import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const AdminUserAdd = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const profileImageRef = useRef(null);
  
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: '',
    role: 'user'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/admin/upload-bird-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUser(prev => ({
        ...prev,
        profileImage: {
          url: response.data.fullUrl,
          public_id: response.data.public_id,
          filename: response.data.filename
        }
      }));
    } catch (error) {
      console.error('Eroare la încărcarea imaginii de profil:', error);
      setError('Eroare la încărcarea imaginii de profil');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/Images/placeholder-user.png';
    
    if (imagePath.startsWith('http')) {
      return `${imagePath}?t=${Date.now()}`;
    }
    
    return `http://localhost:5000/Images/${imagePath}?t=${Date.now()}`;
  };

  const handleProfileImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verifică dacă toate câmpurile obligatorii sunt completate
    if (!user.username || !user.email || !user.password) {
      setError('Toate câmpurile marcate cu * sunt obligatorii');
      return;
    }
    
    // Verifică dacă parolele coincid
    if (user.password !== user.confirmPassword) {
      setError('Parolele nu coincid');
      return;
    }
    
    // Verifică complexitatea parolei
    if (user.password.length < 6) {
      setError('Parola trebuie să aibă cel puțin 6 caractere');
      return;
    }
    
    try {
      const userData = {
        username: user.username,
        email: user.email,
        password: user.password,
        profileImage: user.profileImage,
        role: user.role
      };
      
      const response = await axios.post('http://localhost:5000/api/admin/users', userData, {
        withCredentials: true
      });
      
      setSuccessMessage('Utilizatorul a fost adăugat cu succes');
      
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err) {
      console.error('Eroare la adăugarea utilizatorului:', err);
      setError(err.response?.data?.message || 'Eroare la adăugarea utilizatorului');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Adaugă utilizator nou</h1>
        <Link 
          to="/admin/users" 
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
          Înapoi la lista de utilizatori
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

      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">Încărcare: {uploadProgress}%</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nume utilizator *
            </label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parola *
            </label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Minim 6 caractere</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmare parola *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagine de profil
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                name="profileImage"
                value={user.profileImage.filename}
                onChange={handleInputChange}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Nume fișier sau calea către imagine"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  profileImageRef.current.click();
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
              >
                Încarcă
              </button>
              <input
                type="file"
                ref={profileImageRef}
                onChange={handleProfileImageSelect}
                accept="image/*"
                className="hidden"
              />
            </div>
            {user.profileImage.filename && (
              <div className="mt-2 border p-1 inline-block">
                <img
                  src={getImageUrl(user.profileImage.filename)}
                  alt="Profile"
                  className="w-auto h-auto"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              name="role"
              value={user.role}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="user">Utilizator</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Anulează
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Adaugă utilizator
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminUserAdd; 