const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommerce',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Initialize multer
const upload = multer({ storage: storage });

// For local storage (fallback)
const localStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const localUpload = multer({
  storage: localStorage,
  fileFilter: function(req, file, cb) {
    const filetypes = /jpe?g|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: Images Only!');
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Check if cloudinary is configured
const useCloudinary = process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_API_KEY;

module.exports = useCloudinary ? upload : localUpload;
