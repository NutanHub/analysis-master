const QuestionPaper = require('../models/QuestionPaper');
const AnalysisHistory = require('../models/AnalysisHistory');
const asyncHandler = require('../utils/asyncHandler');
const { cloudinary } = require('../config/cloudinary');
const { analyzeQuestionPaper, generateStudyRecommendations } = require('../config/gemini');

// @desc    Upload question paper
// @route   POST /api/papers/upload
// @access  Private
const uploadPaper = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload a file'
        });
    }

    const { title, subject, course, semester, year, totalMarks, duration, tags } = req.body;

    // Determine file type
    const fileType = req.file.mimetype.includes('pdf') ? 'pdf' : 'image';

    // Create question paper document
    const questionPaper = await QuestionPaper.create({
        title,
        subject,
        course,
        semester,
        year,
        totalMarks,
        duration,
        fileUrl: req.file.path,
        fileType,
        cloudinaryId: req.file.filename,
        uploadedBy: req.user._id,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        status: 'pending'
    });

    res.status(201).json({
        success: true,
        message: 'Question paper uploaded successfully',
        data: questionPaper
    });
});

// @desc    Get all question papers
// @route   GET /api/papers
// @access  Public
const getPapers = asyncHandler(async (req, res, next) => {
    const { subject, year, course, semester, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { isPublic: true };

    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (year) query.year = parseInt(year);
    if (course) query.course = { $regex: course, $options: 'i' };
    if (semester) query.semester = semester;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
        ];
    }

    // Execute query with pagination
    const papers = await QuestionPaper.find(query)
        .populate('uploadedBy', 'firstName lastName username')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const count = await QuestionPaper.countDocuments(query);

    res.status(200).json({
        success: true,
        count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        data: papers
    });
});

// @desc    Get single question paper
// @route   GET /api/papers/:id
// @access  Public
const getPaper = asyncHandler(async (req, res, next) => {
    const paper = await QuestionPaper.findById(req.params.id)
        .populate('uploadedBy', 'firstName lastName username avatar');

    if (!paper) {
        return res.status(404).json({
            success: false,
            message: 'Question paper not found'
        });
    }

    // Increment views
    paper.views += 1;
    await paper.save();

    res.status(200).json({
        success: true,
        data: paper
    });
});

// @desc    Get user's uploaded papers
// @route   GET /api/papers/my-papers
// @access  Private
const getMyPapers = asyncHandler(async (req, res, next) => {
    const papers = await QuestionPaper.find({ uploadedBy: req.user._id })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: papers.length,
        data: papers
    });
});

// @desc    Delete question paper
// @route   DELETE /api/papers/:id
// @access  Private
const deletePaper = asyncHandler(async (req, res, next) => {
    const paper = await QuestionPaper.findById(req.params.id);

    if (!paper) {
        return res.status(404).json({
            success: false,
            message: 'Question paper not found'
        });
    }

    // Make sure user is paper owner
    if (paper.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this paper'
        });
    }

    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(paper.cloudinaryId);

    // Delete paper
    await paper.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Question paper deleted successfully'
    });
});

// @desc    Increment download count
// @route   POST /api/papers/:id/download
// @access  Public
const incrementDownload = asyncHandler(async (req, res, next) => {
    const paper = await QuestionPaper.findById(req.params.id);

    if (!paper) {
        return res.status(404).json({
            success: false,
            message: 'Question paper not found'
        });
    }

    paper.downloads += 1;
    await paper.save();

    res.status(200).json({
        success: true,
        message: 'Download count updated'
    });
});

module.exports = {
    uploadPaper,
    getPapers,
    getPaper,
    getMyPapers,
    deletePaper,
    incrementDownload
};
