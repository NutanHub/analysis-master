const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the generative model (prefer broadly available model)
const getGeminiModel = (modelName = 'gemini-1.5-flash-latest') => {
  return genAI.getGenerativeModel({ model: modelName });
};

// Get vision/multimodal model for image/PDF analysis
const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
};

// Analyze text with Gemini
const analyzeText = async (prompt, text) => {
  const fullPrompt = `${prompt}\n\nText to analyze:\n${text}`;
  // Try models in order of availability and capability
  const candidates = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-pro',
    'gemini-1.0-pro'
  ];
  let lastError;
  let quotaExceeded = false;
  for (const name of candidates) {
    try {
      console.log(`Attempting to use model: ${name}`);
      const model = getGeminiModel(name);
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      console.log(`Successfully used model: ${name}`);
      return response.text();
    } catch (error) {
      lastError = error;
      const msg = String(error?.message || '');
      const status = error?.status;
      const isModel404 = msg.includes('models/') && msg.includes('Not Found');
      const isQuota429 = status === 429 || msg.includes('quota');
      
      console.warn(`Model ${name} failed (404: ${isModel404}, 429: ${isQuota429}): ${msg.substring(0, 100)}`);
      
      // Stop immediately on quota errors or non-404 errors
      if (isQuota429 || !isModel404) {
        quotaExceeded = isQuota429;
        break;
      }
    }
  }
  console.error('Error analyzing text with Gemini:', lastError);
  const err = new Error(quotaExceeded ? 'API_QUOTA_EXCEEDED' : 'Failed to analyze text with AI');
  err.quotaExceeded = quotaExceeded;
  throw err;
};

// Analyze question paper
const analyzeQuestionPaper = async (paperText) => {
    const prompt = `You are an expert in analyzing MSBTE (Maharashtra State Board of Technical Education) question papers and identifying important/repeated questions.
    
    CRITICAL TASK:
    1. First, VALIDATE if this is actually a question paper. Check for:
       - Presence of questions (numbered or bulleted)
       - Academic/educational content
       - Marks distribution
       - Typical question paper structure
    
    2. If NOT a valid question paper, respond with:
       {
         "isValid": false,
         "message": "This document does not appear to be a valid question paper. Please upload a proper MSBTE question paper.",
         "reason": "Explain why it's not valid"
       }
    
    3. If VALID question paper, analyze and provide:
       - Extract ALL questions from the paper
       - Identify important topics and concepts
       - Mark questions by difficulty (Easy/Medium/Hard)
       - Identify repeated question patterns
       - Predict high-probability questions for upcoming exams
       - Weightage analysis (High/Medium/Low importance)
    
    Provide detailed analysis in this JSON format:
    {
      "isValid": true,
      "subject": "subject name",
      "totalQuestions": number,
      "totalMarks": number,
      "questions": [
        {
          "questionNumber": "Q1",
          "questionText": "full question text",
          "marks": number,
          "topic": "topic name",
          "difficulty": "Easy/Medium/Hard",
          "importance": "High/Medium/Low",
          "isRepeated": boolean,
          "repeatCount": number,
          "examProbability": "percentage",
          "relatedConcepts": ["concept1", "concept2"]
        }
      ],
      "topicAnalysis": {
        "topicName": {
          "questionCount": number,
          "totalMarks": number,
          "importance": "High/Medium/Low",
          "focusAreas": ["area1", "area2"]
        }
      },
      "importantQuestions": [
        "List of question numbers that are highly important"
      ],
      "repeatedPatterns": [
        {
          "pattern": "description of repeated pattern",
          "questions": ["Q1", "Q3"],
          "frequency": "how often this appears"
        }
      ],
      "examPredictions": {
        "highProbabilityQuestions": ["Q1", "Q5"],
        "mustStudyTopics": ["topic1", "topic2"],
        "expectedQuestionTypes": ["MCQ", "Short Answer"],
        "preparationAdvice": "specific advice"
      },
      "summary": {
        "keyInsights": "overall analysis",
        "studyRecommendations": "how to prepare",
        "timeAllocation": "how to divide study time"
      }
    }`;
    
    return await analyzeText(prompt, paperText);
};

// Generate study recommendations
const generateStudyRecommendations = async (paperAnalysis, userHistory) => {
    const prompt = `Based on the analyzed question paper and user's study history, 
    generate personalized study recommendations focusing on:
    
    1. Priority topics to cover
    2. Estimated study time for each topic
    3. Practice question suggestions
    4. Weak areas to focus on
    5. Revision strategy
    
    Provide recommendations in a structured format.`;
    
    return await analyzeText(prompt, JSON.stringify({ paperAnalysis, userHistory }));
};

// Analyze multiple papers to find repeated questions and patterns
const analyzeMultiplePapers = async (papersData) => {
    const prompt = `You are analyzing multiple MSBTE question papers from different years to identify:
    
    1. REPEATED QUESTIONS: Questions that appear in multiple papers (exact or similar)
    2. IMPORTANT PATTERNS: Common topics and question types across years
    3. TREND ANALYSIS: Which topics are appearing more frequently over time
    4. EXAM PREDICTIONS: Based on patterns, predict likely questions for next exam
    
    Analyze the following papers and provide comprehensive insights in JSON format:
    {
      "repeatedQuestions": [
        {
          "questionText": "the repeated question",
          "appearedIn": ["year1", "year2"],
          "frequency": number,
          "importance": "High/Medium/Low",
          "variations": ["variation 1", "variation 2"],
          "examProbability": "percentage"
        }
      ],
      "trendingTopics": [
        {
          "topic": "topic name",
          "appearanceCount": number,
          "trend": "Increasing/Stable/Decreasing",
          "marksDistribution": "average marks",
          "mustStudy": boolean
        }
      ],
      "predictions": {
        "nextExamQuestions": ["predicted question 1", "predicted question 2"],
        "highPriorityTopics": ["topic1", "topic2"],
        "expectedDifficulty": "Easy/Medium/Hard",
        "preparationStrategy": "detailed strategy"
      },
      "statistics": {
        "totalPapersAnalyzed": number,
        "totalQuestionsAnalyzed": number,
        "repeatedQuestionsCount": number,
        "uniqueTopicsCount": number
      }
    }`;
    
    return await analyzeText(prompt, JSON.stringify(papersData));
};

// Answer questions about analyzed papers
const answerQuestion = async (question, context) => {
    const prompt = `You are an MSBTE exam preparation assistant. 
    Answer the following question based on the provided context from analyzed question papers.
    
    Question: ${question}
    
    Provide a clear, helpful answer focusing on exam preparation and important topics.`;
    
    return await analyzeText(prompt, context);
};

module.exports = {
    getGeminiModel,
    getGeminiVisionModel,
    analyzeText,
    analyzeQuestionPaper,
    analyzeMultiplePapers,
    generateStudyRecommendations,
    answerQuestion
};
