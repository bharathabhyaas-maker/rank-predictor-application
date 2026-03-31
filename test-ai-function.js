// Test to check AI prediction functionality
async function testAIPrediction() {
  try {
    console.log('🧪 Testing AI prediction functionality...\n');
    
    // Test 1: Check if Gemini API key is configured
    console.log('🔑 Checking environment variables:');
    console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
    
    // Test 2: Try AI prediction API call
    console.log('\n📋 Testing AI prediction API call...');
    const testResponse = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName: 'Test Student',
        studentEmail: 'test@example.com',
        rollNumber: 'TEST001',
        institutionId: 'cmmk5bcww0006lglhjpl3h3gv', // Anwar institution ID
        examId: 'JEE-MAIN-2027',
        templateId: 'JEE-MAIN-2027', // This might need to be actual template ID
        totalScore: 150,
        answers: {},
        aiSource: 'internet'
      })
    });
    
    console.log('📊 AI API Response Status:', testResponse.status);
    console.log('📊 AI API Response Headers:', Object.fromEntries(testResponse.headers.entries()));
    
    if (testResponse.ok) {
      const result = await testResponse.json();
      console.log('✅ AI API Response:', result);
    } else {
      const errorText = await testResponse.text();
      console.log('❌ AI API Error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAIPrediction();
