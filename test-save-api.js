// Test the save API with sample data
const testSaveAPI = async () => {
  console.log('🧪 Testing Save API...');
  
  const testData = {
    studentName: 'Test Student',
    studentEmail: 'test@example.com',
    rollNumber: 'TEST123',
    institutionId: null,
    examId: 'jee-main-2025',
    templateId: null,
    totalScore: 180,
    predictedRank: 50000,
    predictedPercentile: 85.5,
    bestCaseRank: 40000,
    bestCasePercentile: 88.0,
    worstCaseRank: 60000,
    worstCasePercentile: 83.0,
    avgRank: 50000,
    avgPercentile: 85.5,
    answers: {
      physics: { attempted: 20, correct: 15 },
      chemistry: { attempted: 20, correct: 12 },
      mathematics: { attempted: 20, correct: 18 }
    },
    predictionType: 'ai',
    status: 'completed',
    metadata: {
      calculationMethod: 'AI Internet Analysis',
      predictionMethod: 'ai',
      maxPossibleScore: 300,
      percentage: 60.0,
      totalCandidates: 1200000
    }
  };

  try {
    console.log('📋 Sending test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/predictions/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📋 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Save API successful:');
      console.log('  - Prediction ID:', result.prediction.id);
      console.log('  - Student Name:', result.prediction.studentName);
      console.log('  - Predicted Rank:', result.prediction.predictedRank);
      console.log('  - Predicted Percentile:', result.prediction.predictedPercentile);
      console.log('  - Status:', result.prediction.status);
    } else {
      const error = await response.text();
      console.error('❌ Save API failed:', error);
      
      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(error);
        console.error('❌ Error details:', errorJson);
      } catch (parseError) {
        console.error('❌ Raw error:', error);
      }
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Test with invalid data to see validation
const testInvalidData = async () => {
  console.log('\n🧪 Testing with invalid data...');
  
  const invalidData = {
    // Missing required fields
    studentName: '',
    studentEmail: '',
    examId: '',
    predictedRank: 'not-a-number',
    predictedPercentile: null
  };

  try {
    const response = await fetch('http://localhost:3000/api/predictions/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    console.log('📋 Invalid data response status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.log('✅ Validation working correctly:', error);
    } else {
      console.log('❌ Validation should have failed but passed');
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run tests
testSaveAPI();
setTimeout(testInvalidData, 2000);
