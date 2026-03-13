const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionPaper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuestionPaper',
        required: true
    },
    analysisType: {
        type: String,
        enum: ['full', 'topic', 'difficulty', 'custom'],
        default: 'full'
    },
    results: {
        type: mongoose.Schema.Types.Mixed, // Flexible structure for different analysis results
        required: true
    },
    aiInsights: {
        type: String,
        default: null
    },
    studyRecommendations: {
        type: String,
        default: null
    },
    timeSpent: {
        type: Number, // in seconds
        default: 0
    }
}, {
    timestamps: true
});

// Index for user's history
analysisHistorySchema.index({ user: 1, createdAt: -1 });

const AnalysisHistory = mongoose.model('AnalysisHistory', analysisHistorySchema);

module.exports = AnalysisHistory;
