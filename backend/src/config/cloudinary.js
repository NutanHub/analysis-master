const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for question papers
const paperStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isPdf = file.mimetype === 'application/pdf';
        return {
            folder: 'question-papers',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            resource_type: isPdf ? 'raw' : 'image',
            access_mode: 'public',
            public_id: file.originalname.split('.')[0] + '_' + Date.now()
        };
    }
});

// Create storage for general uploads
const generalStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        resource_type: 'auto'
    }
});

// Create storage for user avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
    }
});

// Create multer instances
const uploadPaper = multer({
    storage: paperStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const uploadGeneral = multer({
    storage: generalStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = {
    cloudinary,
    uploadPaper,
    uploadGeneral,
    uploadAvatar
};
