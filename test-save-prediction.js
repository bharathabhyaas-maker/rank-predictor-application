// Test the save prediction API directly
const testSavePrediction = async () => {
  try {
    console.log('🧪 Testing Save Prediction API...');
    
    const testData = {
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
      rollNumber: 'TEST123',
      examId: 'test-exam',
      templateId: null, // Test without template
      totalScore: 150,
      predictedRank: 5000,
      predictedPercentile: 85,
      bestCaseRank: 4000,
      bestCasePercentile: 90,
      worstCaseRank: 6000,
      worstCasePercentile: 80,
      avgRank: 5000,
      avgPercentile: 85,
      answers: {
        physics: { attempted: 20, correct: 15 },
        chemistry: { attempted: 20, correct: 12 },
        mathematics: { attempted: 20, correct: 18 }
      },
      predictionType: 'default',
      status: 'completed',
      metadata: {
        calculationMethod: 'Default Client-Side Prediction',
        predictionMethod: 'default',
        maxPossibleScore: 300,
        percentage: 50,
        totalCandidates: 1000000
      }
    };

    console.log('📋 Sending save request:', JSON.stringify(testData, null, 2));
    
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
      console.log('✅ Save prediction successful:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.error('❌ Save prediction failed:', error);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

testSavePrediction();
