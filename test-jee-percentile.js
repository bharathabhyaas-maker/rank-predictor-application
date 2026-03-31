// Test the new JEE percentile calculation
const { predictRankFromTemplate } = require('./utils/rankPrediction');

// Test data for JEE Mains 298/300
const testData = {
  examId: 'JEE-MAIN-2026',
  score: 298,
  maxScore: 300,
  formData: {
    email: 'test@example.com',
    fullName: 'Test User',
    phone: '',
    hallTicket: '',
    city: '',
    expectedScore: 'no'
  },
  subjectData: [],
  config: {
    name: 'JEE MAIN 2026',
    subjects: []
  },
  templateConfig: {
    name: 'JEE MAIN 2026',
    type: 'ai',
    examCode: 'JEE-MAIN-2026',
    placeholders: {
      candidateCount: '1200000'
    }
  }
};

try {
  const result = predictRankFromTemplate(
    testData.examId,
    testData.score,
    testData.maxScore,
    testData.formData,
    testData.subjectData,
    testData.config,
    testData.templateConfig
  );
  
  console.log('🎯 JEE Percentile Test Results:');
  console.log('📊 Score:', result.totalScore);
  console.log('📊 Percentage:', result.percentage.toFixed(1) + '%');
  console.log('📊 Predicted Percentile:', result.predictedPercentile.toFixed(1) + '%');
  console.log('📊 Calculation Method:', result.calculationMethod);
  console.log('📊 Predicted Rank:', result.rankRange.predictedRank.toLocaleString());
  console.log('📊 Rank Range:', `${result.rankRange.minRank.toLocaleString()} - ${result.rankRange.maxRank.toLocaleString()}`);
  
  // Check if it's reasonable
  if (result.predictedPercentile >= 99.0) {
    console.log('✅ GOOD: 298/300 should give 99+ percentile');
  } else {
    console.log('❌ ISSUE: 298/300 should give 99+ percentile, but got:', result.predictedPercentile.toFixed(1));
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}
