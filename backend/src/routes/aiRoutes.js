const express = require('express');
const router = express.Router();
const {
    analyzePaper,
    analyzeMultiple,
    getRecommendations,
    askQuestion,
    getAnalysisHistory,
    aiHealth
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

router.post('/analyze/:paperId', analyzePaper);
router.post('/analyze-multiple', analyzeMultiple);
router.post('/recommendations/:paperId', getRecommendations);
router.post('/ask', askQuestion);
router.get('/history', getAnalysisHistory);
router.get('/health', aiHealth);

module.exports = router;
