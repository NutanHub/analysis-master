const express = require('express');
const router = express.Router();
const {
    uploadPaper,
    getPapers,
    getPaper,
    getMyPapers,
    deletePaper,
    incrementDownload
} = require('../controllers/paperController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadPaperValidation, validate } = require('../middleware/validators');
const { uploadPaper: upload } = require('../config/cloudinary');

// Public routes
router.get('/', optionalAuth, getPapers);
router.get('/:id', getPaper);
router.post('/:id/download', incrementDownload);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/upload', upload.single('file'), uploadPaperValidation, validate, uploadPaper);
router.get('/user/my-papers', getMyPapers);
router.delete('/:id', deletePaper);

module.exports = router;
