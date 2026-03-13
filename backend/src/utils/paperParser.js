function normalizeWhitespace(text) {
  return text.replace(/\r/g, '').replace(/\t/g, ' ').replace(/[ ]{2,}/g, ' ').trim();
}

function splitIntoQuestions(text) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const questions = [];
  let current = null;

  const isStart = (line) => /^(Q\s*\d+|Q\.?\d+|Q\s*\.\s*\d+|Question\s*\d+|\d+\.|\(\d+\))\s*/i.test(line);

  lines.forEach(line => {
    if (isStart(line)) {
      if (current) questions.push(current);
      const numMatch = line.match(/(Q\s*\d+|Q\.?\d+|Question\s*\d+|\d+\.)/i);
      current = { number: (numMatch ? numMatch[0].replace(/[^\d]/g, '') : ''), text: line, marks: null };
    } else if (current) {
      current.text += ' ' + line;
    }
  });
  if (current) questions.push(current);
  return questions.map(q => ({
    questionNumber: q.number ? `Q${q.number}` : 'Q',
    questionText: normalizeWhitespace(q.text || ''),
    marks: null
  }));
}

// Parse groups like "1. Attempt any FIVE of the following : 10" and subparts (a), (b)...
function parseGroupsAndSubparts(text) {
  const wordMap = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
  const lines = text.split(/\n+/).map(l => l.trim());
  const results = [];
  let group = null;

  const groupHeaderRe = /^(\d+)\.[^\n]*?(?:Attempt\s+any\s+)(one|two|three|four|five|six|seven|eight|nine|ten|\d+)[^\n]*?:\s*(\d+)\b/i;
  const subpartRe = /^\(?([a-z])\)\s*(.+)$/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const gh = line.match(groupHeaderRe);
    if (gh) {
      const qNum = gh[1];
      const countWordOrNum = gh[2].toLowerCase();
      const totalMarks = parseInt(gh[3], 10);
      const requiredCount = wordMap[countWordOrNum] || parseInt(countWordOrNum, 10) || 0;
      const perMarks = requiredCount > 0 ? Math.floor(totalMarks / requiredCount) : null;
      group = { qNum, requiredCount, totalMarks, perMarks };
      continue;
    }

    const sp = line.match(subpartRe);
    if (sp && group) {
      const letter = sp[1].toLowerCase();
      const textOnly = sp[2];
      results.push({
        questionNumber: `Q${group.qNum}(${letter})`,
        questionText: normalizeWhitespace(textOnly),
        marks: group.perMarks
      });
      continue;
    }

    // Reset group when we hit a new main question without subpart marker
    if (/^\d+\./.test(line)) {
      group = null;
    }
  }

  return results;
}

function extractMarks(questionText) {
  // Direct patterns: (10 marks), [6 marks], 10 marks, 10M
  const directPatterns = [
    /\((\d+)\s*marks?\)/i,
    /\[(\d+)\s*marks?\]/i,
    /(\d+)\s*marks?/i,
    /(\d+)\s*m\b/i
  ];
  for (const p of directPatterns) {
    const m = questionText.match(p);
    if (m) return parseInt(m[1], 10);
  }

  // Expressions: 2 x 5 = 10
  const expr = questionText.match(/(\d+)\s*x\s*(\d+)\s*=\s*(\d+)/i);
  if (expr) {
    return parseInt(expr[3], 10);
  }

  // "marks each" with count: Attempt any five; 2 marks each => 10
  const each = questionText.match(/(\d+)\s*marks?\s*each/i);
  if (each) {
    const eachMarks = parseInt(each[1], 10);
    const countNum = questionText.match(/(?:any|choose|select)\s*(\d+)/i);
    if (countNum) {
      const n = parseInt(countNum[1], 10);
      return eachMarks * n;
    }
    const countWord = questionText.match(/(?:any|choose|select)\s*(one|two|three|four|five|six|seven|eight|nine|ten)/i);
    const wordMap = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
    if (countWord) {
      const n = wordMap[countWord[1].toLowerCase()] || 0;
      if (n > 0) return eachMarks * n;
    }
  }

  // Trailing colon with total marks (e.g., ": 12")
  const trailing = questionText.match(/:\s*(\d+)\b/);
  if (trailing) {
    return parseInt(trailing[1], 10);
  }

  return null;
}

function estimateDifficulty(text) {
  const hard = /(prove|derive|design|analyze|implement|optimize|compare)/i.test(text);
  const easy = /(define|list|state|write|mention|name)/i.test(text);
  if (hard) return 'Hard';
  if (easy) return 'Easy';
  return 'Medium';
}

function importanceFromMarks(marks) {
  if (marks == null) return 'Medium';
  if (marks >= 10) return 'High';
  if (marks >= 6) return 'High';
  if (marks >= 4) return 'Medium';
  return 'Low';
}

function inferTopic(text) {
  const m = text.match(/(?:on|about|regarding)\s+([A-Za-z][A-Za-z0-9\s\-]+)/i);
  return m ? m[1].trim() : null;
}

function parsePaper(text) {
  // Try group/subpart parsing first
  let qs = parseGroupsAndSubparts(text);
  if (!qs || qs.length === 0) {
    qs = splitIntoQuestions(text);
  }

  console.log(`🔍 Parser found ${qs.length} raw questions`);
  if (qs.length > 0) {
    console.log(`📝 Sample question text: "${qs[0].questionText.substring(0, 150)}..."`);
  }

  const detailedQs = qs.map(q => {
    const marks = q.marks || extractMarks(q.questionText);
    const topic = inferTopic(q.questionText);
    const difficulty = estimateDifficulty(q.questionText);
    const importance = importanceFromMarks(marks);
    
    if (marks) {
      console.log(`✓ Q${q.questionNumber}: ${marks} marks → ${importance} importance`);
    }
    
    return {
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      marks,
      topic: topic || 'General',
      difficulty,
      importance,
      isRepeated: false,
      repeatCount: 1,
      examProbability: importance === 'High' ? 'High' : (importance === 'Medium' ? 'Medium' : 'Low'),
      relatedConcepts: []
    };
  });

  const importantQuestions = detailedQs.filter(q => q.importance === 'High').map(q => q.questionNumber);
  const topicAnalysis = {};
  detailedQs.forEach(q => {
    if (!topicAnalysis[q.topic]) {
      topicAnalysis[q.topic] = { questionCount: 0, totalMarks: 0, importance: 'Medium', focusAreas: [] };
    }
    topicAnalysis[q.topic].questionCount += 1;
    topicAnalysis[q.topic].totalMarks += (q.marks || 0);
  });

  return {
    totalQuestions: detailedQs.length,
    questions: detailedQs,
    importantQuestions,
    topicAnalysis,
    repeatedPatterns: [],
    examPredictions: {
      highProbabilityQuestions: importantQuestions.slice(0, 5),
      mustStudyTopics: Object.keys(topicAnalysis).slice(0, 5),
      expectedQuestionTypes: ['Short Answer', 'Long Answer'],
      preparationAdvice: 'Prioritize high-mark questions and core topics from the syllabus.'
    },
    summary: {
      keyInsights: 'Local analysis generated without AI.',
      studyRecommendations: 'Use this as a baseline; re-run with AI for deeper insights.',
      timeAllocation: 'Allocate time per topic proportional to marks weight.'
    }
  };
}

module.exports = { parsePaper };
