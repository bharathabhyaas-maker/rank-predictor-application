// Test Gemini AI integration
const testGeminiAI = async () => {
  console.log('🤖 Testing Gemini AI Integration...');
  
  try {
    // Test the AI prediction API
    const testData = {
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
      examId: 'jee-main',
      totalScore: 180,
      aiSource: 'internet'
    };

    console.log('📋 Sending AI prediction request:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📋 AI Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ AI Prediction successful:');
      console.log('  - Predicted Percentile:', result.predictedPercentile);
      console.log('  - Predicted Rank:', result.rank);
      console.log('  - Best Case Percentile:', result.bestCasePercentile);
      console.log('  - Worst Case Percentile:', result.worstCasePercentile);
      console.log('  - Data Source:', result.dataSource);
      console.log('  - Confidence:', result.confidence);
      
      // Check if we got realistic values
      if (result.predictedPercentile > 0 && result.rank > 0) {
        console.log('✅ AI is working correctly with real-time data!');
      } else {
        console.log('⚠️ AI returned zero values - might be using fallback');
      }
    } else {
      const error = await response.text();
      console.error('❌ AI Prediction failed:', error);
      
      if (error.includes('GEMINI_API_KEY')) {
        console.log('💡 Solution: Add GEMINI_API_KEY to your environment variables');
      }
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Test different scores
const testScores = [50, 100, 150, 200, 250];

const runTests = async () => {
  for (const score of testScores) {
    console.log(`\n🧪 Testing with score: ${score}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/predictions/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: 'Test Student',
          studentEmail: 'test@example.com',
          examId: 'jee-main',
          totalScore: score,
          aiSource: 'internet'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`  Score ${score}: ${result.predictedPercentile}%ile (Rank ${result.rank})`);
      }
    } catch (error) {
      console.error(`  Error with score ${score}:`, error.message);
    }
  }
};

// Run the tests
testGeminiAI();
setTimeout(runTests, 2000);
