// Test the prediction calculation directly
const { predictRank, calculateScore } = require('./utils/rankPrediction.ts');

// Mock data for testing
const mockFormData = {
  email: 'test@example.com',
  fullName: 'Test Student',
  phone: '1234567890',
  hallTicket: 'TEST123',
  city: 'Test City',
  expectedScore: 'yes',
  expectedScoreValue: '150',
  provideSectionData: 'yes'
};

const mockSubjectData = [
  { name: 'Physics', attempted: '20', correct: '15' },
  { name: 'Chemistry', attempted: '20', correct: '12' },
  { name: 'Mathematics', attempted: '20', correct: '18' }
];

const mockConfig = {
  name: 'JEE MAIN Test',
  subjects: [
    { name: 'Physics', totalQuestions: 20, positiveMarks: 4, negativeMarks: 1 },
    { name: 'Chemistry', totalQuestions: 20, positiveMarks: 4, negativeMarks: 1 },
    { name: 'Mathematics', totalQuestions: 20, positiveMarks: 4, negativeMarks: 1 }
  ],
  requireHallTicket: true,
  askExpectedScore: true,
  collectCity: true
};

console.log('🧪 Testing Prediction Calculation...');

// Test score calculation
const totalScore = calculateScore(mockSubjectData, mockConfig.subjects);
console.log('📊 Calculated Total Score:', totalScore);

// Test prediction
const maxScore = mockConfig.subjects.reduce((sum, subject) => sum + (subject.totalQuestions * subject.positiveMarks), 0);
console.log('📊 Max Possible Score:', maxScore);

try {
  const prediction = predictRank(
    'jee-main',
    totalScore,
    maxScore,
    mockFormData,
    mockSubjectData,
    mockConfig
  );
  
  console.log('✅ Prediction Result:');
  console.log('  - Total Score:', prediction.totalScore);
  console.log('  - Percentage:', prediction.percentage);
  console.log('  - Predicted Percentile:', prediction.percentile.predictedPercentile);
  console.log('  - Predicted Rank:', prediction.rankRange.predictedRank);
  console.log('  - Min Rank:', prediction.rankRange.minRank);
  console.log('  - Max Rank:', prediction.rankRange.maxRank);
  console.log('  - Total Candidates:', prediction.totalCandidates);
  console.log('  - Calculation Method:', prediction.calculationMethod);
  
  // Check for issues
  if (prediction.percentile.predictedPercentile === 0) {
    console.error('❌ ISSUE: Predicted percentile is 0!');
  }
  if (prediction.rankRange.predictedRank === 0) {
    console.error('❌ ISSUE: Predicted rank is 0!');
  }
  
} catch (error) {
  console.error('❌ Prediction calculation failed:', error);
}
