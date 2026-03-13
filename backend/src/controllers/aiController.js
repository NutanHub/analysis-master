const QuestionPaper = require('../models/QuestionPaper');
const AnalysisHistory = require('../models/AnalysisHistory');
const asyncHandler = require('../utils/asyncHandler');
const { 
    analyzeQuestionPaper, 
    analyzeMultiplePapers,
    generateStudyRecommendations, 
    answerQuestion,
    analyzeText
} = require('../config/gemini');
const { extractText } = require('../utils/textExtractor');
const { parsePaper } = require('../utils/paperParser');

// Helper function to extract text from paper
// In production, integrate with OCR library like Tesseract or Google Vision API
const extractTextFromPaper = async (paper) => {
    // For now, return a formatted string with available data
    // TODO: Implement actual OCR for PDF/image files
    return `
QUESTION PAPER
Subject: ${paper.subject}
Course: ${paper.course || 'Not specified'}
Scheme: ${paper.scheme || 'Not specified'}
Year: ${paper.year || 'Current'}
Exam Type: ${paper.examType || 'Not specified'}
Title: ${paper.title}
Duration: ${paper.duration || 'Not specified'}
Total Marks: ${paper.totalMarks || 'Not specified'}

File: ${paper.fileUrl}

[Note: This is metadata from the uploaded paper. In production, actual text would be extracted from the PDF/image using OCR]
    `.trim();
};

// @desc    Analyze question paper with AI
// @route   POST /api/ai/analyze/:paperId
// @access  Private
const analyzePaper = asyncHandler(async (req, res, next) => {
    const paper = await QuestionPaper.findById(req.params.paperId);

    if (!paper) {
        return res.status(404).json({
            success: false,
            message: 'Question paper not found'
        });
    }

    // Check if paper belongs to user
    if (paper.uploadedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to analyze this paper'
        });
    }

    let localAnalysis = null;
    let aiQuotaExceeded = false;
    try {
        // Extract text from uploaded paper (PDF preferred)
        const paperText = await extractText(paper.fileUrl, paper.fileType, paper.cloudinaryId);
        const hasText = paperText && paperText.length > 200;
        
        if (hasText) {
            console.log(`📄 First 500 chars of extracted text:\n${paperText.substring(0, 500)}\n---`);
        }
        
        localAnalysis = hasText ? parsePaper(paperText) : null;
        
        if (localAnalysis) {
            console.log(`📊 Local parser results: ${localAnalysis.totalQuestions} questions, ${localAnalysis.importantQuestions?.length || 0} important`);
            console.log(`📌 Important questions:`, localAnalysis.importantQuestions);
        } else {
            console.warn('⚠️ Local parser returned null - no text or parsing failed');
        }

        console.log('Analyzing paper with Gemini AI...');
        
        // Analyze with Gemini AI
        let aiAnalysis;
        try {
            const aiAnalysisRaw = await analyzeQuestionPaper(paperText || '');
            
            // Parse JSON response from Gemini
            try {
                // Extract JSON from response (Gemini might wrap it in markdown)
                const jsonMatch = aiAnalysisRaw.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiAnalysis = JSON.parse(jsonMatch[0]);
                } else {
                    aiAnalysis = JSON.parse(aiAnalysisRaw);
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', parseError);
                // Return raw response if parsing fails
                aiAnalysis = {
                    isValid: true,
                    rawResponse: aiAnalysisRaw,
                    parseError: 'Could not parse structured response'
                };
            }
        } catch (aiError) {
            console.error('AI Analysis error:', aiError.message);
            if (aiError.quotaExceeded) {
                aiQuotaExceeded = true;
                aiAnalysis = null;
            } else {
                aiAnalysis = null;
            }
        }

        // Check if document is valid question paper
        if (aiAnalysis && aiAnalysis.isValid === false && !localAnalysis) {
            paper.status = 'invalid';
            await paper.save();

            return res.status(400).json({
                success: false,
                message: aiAnalysis.message || 'Invalid question paper',
                reason: aiAnalysis.reason,
                data: {
                    isValid: false,
                    paper: {
                        id: paper._id,
                        title: paper.title
                    }
                }
            });
        }

        // Choose best available analysis
        const finalAnalysis = (aiAnalysis && aiAnalysis.isValid) ? aiAnalysis : (localAnalysis || {
            totalQuestions: 0,
            questions: [],
            importantQuestions: [],
            topicAnalysis: {},
            repeatedPatterns: [],
            examPredictions: {
                highProbabilityQuestions: [],
                mustStudyTopics: [],
                expectedQuestionTypes: [],
                preparationAdvice: 'Unable to extract questions from the document. Please ensure the document is a valid MSBTE question paper.'
            },
            summary: {
                keyInsights: 'Document could not be analyzed. Please check the file format.',
                studyRecommendations: 'Please try uploading a clear PDF or image of the question paper.',
                timeAllocation: 'N/A'
            }
        });

        // Update paper with analysis
        paper.analysis = {
            aiAnalysis: JSON.stringify(finalAnalysis),
            analyzedAt: Date.now(),
            aiQuotaExceeded: aiQuotaExceeded,
            source: aiAnalysis && aiAnalysis.isValid ? 'gemini' : 'local'
        };
        paper.status = 'analyzed';
        await paper.save();

        // Save to analysis history
        const analysisRecord = await AnalysisHistory.create({
            user: req.user._id,
            questionPaper: paper._id,
            analysisType: 'full',
            results: {
                analysis: finalAnalysis,
                metadata: {
                    subject: paper.subject,
                    year: paper.year,
                    totalMarks: paper.totalMarks,
                    scheme: paper.scheme,
                    course: paper.course
                }
            },
            aiInsights: finalAnalysis?.summary?.keyInsights || 'Analysis completed',
            studyRecommendations: finalAnalysis?.summary?.studyRecommendations || 'Please try again with a valid question paper'
        });

        res.status(200).json({
            success: true,
            message: aiQuotaExceeded 
                ? 'Paper analyzed with local parser (Gemini API quota exceeded for today)'
                : 'Paper analyzed successfully',
            data: {
                isValid: true,
                analysis: finalAnalysis,
                aiQuotaExceeded,
                analysisSource: aiAnalysis && aiAnalysis.isValid ? 'Gemini AI' : 'Local Parser',
                quotaMessage: aiQuotaExceeded 
                    ? 'Important questions are extracted from the paper. For deeper AI insights, please upgrade your API key or try again tomorrow.'
                    : null,
                paper: {
                    id: paper._id,
                    title: paper.title,
                    subject: paper.subject,
                    status: paper.status
                },
                analysisId: analysisRecord._id
            }
        });
    } catch (error) {
        console.error('Analysis error:', error);
        const isModelError = typeof error?.message === 'string' && (
            error.message.includes('Failed to analyze text with AI') ||
            error.message.includes('models/') ||
            error.message.includes('GoogleGenerativeAIError') ||
            error.message.includes('GoogleGenerativeAIFetchError')
        );

        if (isModelError) {
            // Provide limited, offline-friendly analysis so user isn't blocked
            const fallbackAnalysis = (() => {
                if (localAnalysis) {
                    // Annotate local analysis as limited
                    return {
                        ...localAnalysis,
                        summary: {
                            ...(localAnalysis.summary || {}),
                            keyInsights: 'Local analysis (AI unavailable)',
                            studyRecommendations: 'This is a baseline from text parsing. Re-run with AI for deeper insights and patterns.'
                        }
                    };
                }
                return {
                    isValid: true,
                    subject: paper.subject,
                    totalQuestions: 0,
                    totalMarks: paper.totalMarks,
                    questions: [],
                    topicAnalysis: {},
                    importantQuestions: [],
                    repeatedPatterns: [],
                    examPredictions: {
                        highProbabilityQuestions: [],
                        mustStudyTopics: [],
                        expectedQuestionTypes: [],
                        preparationAdvice: 'AI service is temporarily unavailable. Focus on last 3 years papers, higher-mark questions, and core syllabus topics for now.'
                    },
                    summary: {
                        keyInsights: 'Limited analysis: no text extracted',
                        studyRecommendations: 'Upload a PDF question paper; images require OCR.',
                        timeAllocation: 'Allocate more time to high-mark sections from the syllabus.'
                    }
                };
            })();

            paper.analysis = {
                aiAnalysis: JSON.stringify(fallbackAnalysis),
                analyzedAt: Date.now()
            };
            paper.status = 'analyzed';
            await paper.save();

            return res.status(200).json({
                success: true,
                message: 'Limited analysis shown (AI temporarily unavailable).',
                data: {
                    isValid: true,
                    analysis: fallbackAnalysis,
                    paper: {
                        id: paper._id,
                        title: paper.title,
                        subject: paper.subject,
                        status: paper.status
                    }
                }
            });
        }

        // Non-AI error
        paper.status = 'failed';
        await paper.save();
        return res.status(500).json({
            success: false,
            message: 'Failed to analyze paper with AI',
            error: error.message
        });
    }
});

// @desc    Analyze multiple papers to find repeated questions
// @route   POST /api/ai/analyze-multiple
// @access  Private
const analyzeMultiple = asyncHandler(async (req, res, next) => {
    const { paperIds } = req.body;

    if (!paperIds || paperIds.length < 2) {
        return res.status(400).json({
            success: false,
            message: 'Please provide at least 2 paper IDs to compare'
        });
    }

    try {
        // Fetch all papers
        const papers = await QuestionPaper.find({
            _id: { $in: paperIds },
            uploadedBy: req.user._id,
            status: 'analyzed'
        });

        if (papers.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Not enough analyzed papers found. Please analyze papers first.'
            });
        }

        // Prepare data for multi-paper analysis
        const papersData = papers.map(paper => ({
            id: paper._id,
            title: paper.title,
            subject: paper.subject,
            year: paper.year,
            scheme: paper.scheme,
            analysis: (() => { try { return JSON.parse(paper.analysis.aiAnalysis || '{}'); } catch { return {}; } })()
        }));

        console.log(`Analyzing ${papers.length} papers together for patterns...`);

        // Analyze multiple papers with Gemini
        const multiAnalysisRaw = await analyzeMultiplePapers(papersData);
        
        // Parse response
        let multiAnalysis;
        try {
            const jsonMatch = multiAnalysisRaw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                multiAnalysis = JSON.parse(jsonMatch[0]);
            } else {
                multiAnalysis = JSON.parse(multiAnalysisRaw);
            }
        } catch (parseError) {
            multiAnalysis = {
                rawResponse: multiAnalysisRaw
            };
        }

        // Save multi-paper analysis
        const analysisRecord = await AnalysisHistory.create({
            user: req.user._id,
            analysisType: 'custom',
            results: {
                papers: papersData.map(p => ({ id: p.id, title: p.title, year: p.year })),
                analysis: multiAnalysis
            },
            aiInsights: JSON.stringify(multiAnalysis.predictions || {})
        });

        res.status(200).json({
            success: true,
            message: 'Multiple papers analyzed successfully',
            data: {
                analysis: multiAnalysis,
                papersAnalyzed: papers.length,
                analysisId: analysisRecord._id
            }
        });
    } catch (error) {
        console.error('Multi-paper analysis error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to analyze multiple papers',
            error: error.message
        });
    }
});

// @desc    Get study recommendations
// @route   POST /api/ai/recommendations/:paperId
// @access  Private
const getRecommendations = asyncHandler(async (req, res, next) => {
    const paper = await QuestionPaper.findById(req.params.paperId);

    if (!paper) {
        return res.status(404).json({
            success: false,
            message: 'Question paper not found'
        });
    }

    if (!paper.analysis || !paper.analysis.aiAnalysis) {
        return res.status(400).json({
            success: false,
            message: 'Paper has not been analyzed yet. Please analyze it first.'
        });
    }

    try {
        // Get user's previous analysis history
        const userHistory = await AnalysisHistory.find({ user: req.user._id })
            .limit(5)
            .sort({ createdAt: -1 });

        // Generate recommendations
        const recommendations = await generateStudyRecommendations(
            paper.analysis.aiAnalysis,
            userHistory
        );

        res.status(200).json({
            success: true,
            data: {
                recommendations,
                paper: {
                    id: paper._id,
                    title: paper.title,
                    subject: paper.subject
                }
            }
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate recommendations',
            error: error.message
        });
    }
});

// @desc    Ask AI a question
// @route   POST /api/ai/ask
// @access  Private
const askQuestion = asyncHandler(async (req, res, next) => {
    const { question, context } = req.body;

    if (!question) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a question'
        });
    }

    try {
        const answer = await answerQuestion(question, context || '');

        res.status(200).json({
            success: true,
            data: {
                question,
                answer
            }
        });
    } catch (error) {
        console.error('Ask question error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get answer from AI',
            error: error.message
        });
    }
});

// @desc    Get user's analysis history
// @route   GET /api/ai/history
// @access  Private
const getAnalysisHistory = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10 } = req.query;

    const history = await AnalysisHistory.find({ user: req.user._id })
        .populate('questionPaper', 'title subject year scheme status')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const count = await AnalysisHistory.countDocuments({ user: req.user._id });

    res.status(200).json({
        success: true,
        count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        data: history
    });
});

// @desc    AI health check (diagnose model availability)
// @route   GET /api/ai/health
// @access  Private
const aiHealth = asyncHandler(async (req, res, next) => {
    try {
        const result = await analyzeText('Health check', 'ping');
        return res.status(200).json({ success: true, message: 'AI reachable', sample: result.slice(0, 100) });
    } catch (error) {
        return res.status(503).json({ success: false, message: 'AI unreachable or misconfigured', error: error.message });
    }
});

module.exports = {
    analyzePaper,
    analyzeMultiple,
    getRecommendations,
    askQuestion,
    getAnalysisHistory,
    aiHealth
};
