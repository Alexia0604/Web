// src/pages/user/Profile.js
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, logout, updateProfileImage } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Efect pentru a seta imaginea inițială
  useEffect(() => {
    if (user?.profileImage) {
      // Verificăm dacă URL-ul este deja complet
      const imageUrl = user.profileImage.startsWith('http') 
        ? user.profileImage 
        : `http://localhost:5000${user.profileImage}`;
      setPreviewImage(imageUrl);
    } else {
      setPreviewImage('/images/default-avatar.png');
    }
  }, [user?.profileImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validare tip fișier
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Vă rugăm să selectați o imagine (JPG, PNG sau GIF)');
      return;
    }

    // Crează un URL temporar pentru previzualizare
    const previewUrl = URL.createObjectURL(file);
    const previousImage = previewImage; // Salvăm imaginea anterioară
    setPreviewImage(previewUrl);

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/upload-profile-image', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data.imageUrl) {
        await updateProfileImage(response.data.imageUrl);
        setMessage('Imaginea de profil a fost actualizată cu succes');
        setPreviewImage(response.data.imageUrl);
      }
    } catch (err) {
      setError('Eroare la încărcarea imaginii');
      setPreviewImage(previousImage); // Revenim la imaginea anterioară în caz de eroare
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Verificări pentru parolă
    if (formData.newPassword) {
      // Verifică dacă parola actuală este completată
      if (!formData.currentPassword) {
        setError('Trebuie să introduci parola actuală pentru a schimba parola');
        return;
      }

      // Verifică dacă parola nouă și confirmarea coincid
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Parolele noi nu coincid');
        return;
      }

      // Verifică lungimea minimă a parolei
      if (formData.newPassword.length < 6) {
        setError('Parola trebuie să aibă cel puțin 6 caractere');
        return;
      }

      // Verifică dacă parola nouă este diferită de cea actuală
      if (formData.newPassword === formData.currentPassword) {
        setError('Parola nouă trebuie să fie diferită de parola actuală');
        return;
      }

      // Verifică complexitatea parolei
      const hasUpperCase = /[A-Z]/.test(formData.newPassword);
      const hasLowerCase = /[a-z]/.test(formData.newPassword);
      const hasNumbers = /\d/.test(formData.newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);

      if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
        setError('Parola trebuie să conțină cel puțin o literă mare, o literă mică, un număr și un caracter special');
        return;
      }
    }

    try {
      const updateData = {};
      if (formData.username && formData.username !== user.username) {
        updateData.username = formData.username;
      }
      
      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
        updateData.currentPassword = formData.currentPassword;
      }

      if (Object.keys(updateData).length > 0) {
        const res = await axios.put('http://localhost:5000/api/auth/profile', updateData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setMessage('Profilul a fost actualizat cu succes');
        // Resetăm câmpurile de parolă după succes
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        setMessage('Nu există modificări de salvat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Eroare la actualizarea profilului');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-blue-300 to-indigo-400 rounded-t-lg p-8">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gray-200 ${uploading ? 'opacity-50' : ''}`}>
                <img
                  src={previewImage}
                  alt=""
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleImageClick}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-avatar.png';
                  }}
                  style={{ minHeight: '100%', minWidth: '100%' }}
                />
              </div>
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleImageClick}
              >
                <div className="bg-black bg-opacity-50 rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageUpload}
            />
            <h2 className="mt-4 text-2xl font-bold text-white">{user?.username}</h2>
            <p className="text-white opacity-90">{user?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-md p-8">
          {message && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                  Nume utilizator
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Adresa de email nu poate fi modificată</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Schimbare parolă</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                    Parola actuală
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                    Parola nouă
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirmă parola nouă
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition-colors"
              >
                Salvează modificările
              </button>
              <button
                type="button"
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors"
              >
                Deconectare
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;