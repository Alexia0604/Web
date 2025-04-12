const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs').promises;
const config = require('../config/config');

// Configurare Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Funcție pentru a construi URL-ul Cloudinary
const buildCloudinaryUrl = async (public_id, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(public_id, { resource_type: resourceType });
    return result.secure_url;
  } catch (error) {
    console.error(`Eroare la obținerea URL-ului pentru ${public_id}:`, error);
    return null;
  }
};

// Funcție generică pentru încărcarea fișierelor
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      use_filename: false,
      unique_filename: true,
      overwrite: false,
      ...options
    });

    // Ștergem fișierul temporar după upload
    await fs.unlink(filePath).catch(err => 
      console.warn('Warning: Could not delete temporary file:', err)
    );

    return {
      url: result.secure_url,
      public_id: result.public_id,
      filename: result.original_filename
    };
  } catch (error) {
    // Încercăm să ștergem fișierul temporar chiar și în caz de eroare
    await fs.unlink(filePath).catch(() => {});
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

// Funcție pentru încărcarea imaginilor
const uploadImage = async (filePath, folder = 'misc') => {
  const timestamp = Date.now();
  const uniqueSuffix = Math.round(Math.random() * 1E9);
  
  return uploadToCloudinary(filePath, {
    folder,
    resource_type: 'image',
    public_id: `${folder}_${timestamp}_${uniqueSuffix}`
  });
};

// Funcție pentru încărcarea fișierelor audio
const uploadAudio = async (filePath, folder = 'audio') => {
  const timestamp = Date.now();
  const uniqueSuffix = Math.round(Math.random() * 1E9);
  
  return uploadToCloudinary(filePath, {
    folder,
    resource_type: 'auto',
    format: 'mp3',
    public_id: `${folder}_${timestamp}_${uniqueSuffix}`
  });
};

// Ștergere fișier din Cloudinary
const deleteFile = async (public_id, resource_type = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
};

// Funcții pentru încărcarea imaginilor în foldere specifice
const uploadBirdImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'birds',
      resource_type: 'image',
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      filename: result.original_filename
    };
  } catch (error) {
    console.error('Eroare la încărcarea imaginii păsării:', error);
    throw error;
  }
};

const uploadAspectImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'aspects',
      resource_type: 'image',
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      filename: result.original_filename
    };
  } catch (error) {
    console.error('Eroare la încărcarea imaginii aspectului:', error);
    throw error;
  }
};

const uploadFeatherImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'feathers',
      resource_type: 'image',
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      filename: result.original_filename
    };
  } catch (error) {
    console.error('Eroare la încărcarea imaginii penajului:', error);
    throw error;
  }
};

const uploadHabitatImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'habitats',
      resource_type: 'image',
      use_filename: true,
      unique_filename: false,
      overwrite: true
    });
    return {
      url: result.secure_url,
      public_id: result.public_id,
      filename: result.original_filename
    };
  } catch (error) {
    console.error('Eroare la încărcarea imaginii habitatului:', error);
    throw error;
  }
};

// Funcție pentru încărcarea imaginilor de profil
const uploadProfileImage = async (filePath) => {
  const timestamp = Date.now();
  const uniqueSuffix = Math.round(Math.random() * 1E9);
  
  return uploadToCloudinary(filePath, {
    folder: 'profile-images',
    resource_type: 'image',
    public_id: `profile_${timestamp}_${uniqueSuffix}`
  });
};

// Configurare storage pentru multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'birds',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp3', 'wav'],
    use_filename: true,
    unique_filename: false,
    overwrite: true
  }
});

const upload = multer({ storage: storage });

module.exports = {
  uploadBirdImage,
  uploadAspectImage,
  uploadFeatherImage,
  uploadHabitatImage,
  uploadAudio,
  deleteFile,
  buildCloudinaryUrl,
  upload,
  cloudinary,
  uploadImage,
  uploadProfileImage
}; 