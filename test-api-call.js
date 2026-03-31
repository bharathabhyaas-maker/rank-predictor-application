// Simple API test
const testAPI = async () => {
  try {
    console.log('🧪 Testing AI Prediction API...');
    
    const testData = {
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
      rollNumber: 'TEST123',
      examId: 'jee-main',
      totalScore: 150,
      answers: {
        physics: { attempted: 20, correct: 15 },
        chemistry: { attempted: 20, correct: 12 },
        mathematics: { attempted: 20, correct: 18 }
      },
      aiSource: 'internet'
    };

    console.log('📋 Sending request:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📋 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ AI Prediction successful:', JSON.stringify(result, null, 2));
    } else {
      const error = await response.text();
      console.error('❌ AI Prediction failed:', error);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

testAPI();
