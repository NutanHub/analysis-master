const mongoose = require('mongoose');

const questionPaperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Paper title is required'],
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    course: {
        type: String,
        trim: true
    },
    semester: {
        type: String,
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Year is required']
    },
    totalMarks: {
        type: Number,
        required: [true, 'Total marks is required']
    },
    duration: {
        type: String, // e.g., "3 hours"
        trim: true
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required']
    },
    fileType: {
        type: String,
        enum: ['pdf', 'image'],
        required: true
    },
    cloudinaryId: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    analysis: {
        questionTypes: [{
            type: {
                type: String,
                enum: ['MCQ', 'Short Answer', 'Long Answer', 'Numerical', 'Theory', 'Practical']
            },
            count: Number,
            marks: Number
        }],
        topics: [{
            name: String,
            marks: Number,
            percentage: Number
        }],
        difficulty: {
            easy: { type: Number, default: 0 },
            medium: { type: Number, default: 0 },
            hard: { type: Number, default: 0 }
        },
        aiAnalysis: {
            type: String, // JSON string of AI analysis
            default: null
        },
        analyzedAt: Date
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    downloads: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [String],
    status: {
        type: String,
        enum: ['pending', 'analyzed', 'failed', 'invalid'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Index for better search performance
questionPaperSchema.index({ subject: 1, year: -1 });
questionPaperSchema.index({ uploadedBy: 1 });
questionPaperSchema.index({ tags: 1 });

const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);

module.exports = QuestionPaper;
