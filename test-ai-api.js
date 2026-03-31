// Test AI prediction via API endpoint
require('dotenv').config({ path: '.env' });

async function testAIAPI() {
  try {
    console.log('🤖 Testing Gemini AI Prediction API...');
    
    // Test the pure AI prediction endpoint
    const testData = {
      studentName: "Test Student",
      studentEmail: "test@example.com",
      institutionId: "cmmuinlib0000gglh9xuggx2k", // Abhyaas Academy
      examId: "test-exam-001", // Real exam ID
      templateId: "cmmucgx500000n8lhgk1k9", // JEE MAIN 2021 template
      totalScore: 350,
      answers: {}
    };

    console.log('📋 Sending test data:', testData);

    const response = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ AI Prediction Result:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error testing AI API:', error.message);
    console.log('💡 Make sure your dev server is running on http://localhost:3000');
  }
}

// Run the test
testAIAPI();
