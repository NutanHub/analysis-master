const { parsePaper } = require('./paperParser');

const sample = `22518
 [1 of 2] P.T.O.
24225
3 Hours / 70 Marks Seat No.

Instructions : (1) All Questions are compulsory.
(2) Illustrate your answers with neat sketches wherever necessary.
(3) Figures to the right indicate full marks.
(4) Assume suitable data, if necessary.
(5) Use of Non-programmable Electronic Pocket Calculator is permissible.
Marks
1. Attempt any FIVE of the following : 10
(a) Define following terms :
Failure, Error Bug and Defect.
(b) List types of Integration testing. (Any two)
(c) Enlist any two advantages of Test Plan.
(d) List types of defects. (Any two)
(e) List the different techniques to detect defects. (Any two)
(f) State any two benefits of Automation testing.
(g) Enlist any two features for selecting static test tools.
2. Attempt any THREE of the following : 12
(a) Differentiate between verification and validation.
(b) Explain alpha testing. Write any two advantages of it.
(c) State the contents of ‘Test Summary Report’ used in test reporting.
(d) Explain defect management process.
22518 [2 of 2]

3. Attempt any THREE of the following : 12
(a) Explain equivalence partitioning with suitable example.
(b) Describe following testing : (i) Load testing (ii) Stress testing.
(c) Describe the factors considered to decide test strategy or test approach.
(d) State any four limitations of Manual Testing.
4. Attempt any THREE of the following : 12
(a) Describe inspection under static white box testing.
(b) Explain GUI testing with suitable example.
(c) Explain test deliverables in detail.
(d) Describe defect life cycle with neat diagram.
(e) Differentiate between static and dynamic testing tool.
5. Attempt any TWO of the following : 12
(a) Distinguish between white box testing and black box testing.
(b) Describe following testing : (i) Performance testing (ii) Security testing.
(c) Design test cases for railway reservation system.
6. Attempt any TWO of the following : 12
(a) Describe use of load testing and stress testing to test online result display
facility of MSBTE website.
(b) Explain defect report template with its attribute.
(c) Elaborate the concept of Software Metrics. Describe Product Metrics in detail.
_______________`;

const result = parsePaper(sample);
console.log('Total Questions:', result.totalQuestions);
console.log('Important Questions:', result.importantQuestions);
console.log('Exam Predictions:', result.examPredictions);
console.log('First 5 questions with marks:', result.questions.slice(0,5).map(q => ({ num: q.questionNumber, marks: q.marks, text: q.questionText })));
