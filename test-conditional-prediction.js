// Test script for conditional prediction
const testConditionalPrediction = async () => {
  try {
    console.log('🧪 Testing conditional prediction...')
    
    // Test data
    const testData = {
      studentName: "Test Student",
      studentEmail: "test@example.com",
      rollNumber: "TEST123",
      institutionId: "default",
      examId: "clat-2025", // This should be an exam code
      answers: {},
      totalScore: 120,
      englishScore: 25,
      reasoningScore: 30,
      legalScore: 35,
      gkScore: 20,
      mathsScore: 10
    }
    
    console.log('📋 Sending test data:', testData)
    
    // Call the conditional API
    const response = await fetch('http://localhost:3000/api/predictions/conditional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Conditional prediction successful:', result)
    } else {
      const error = await response.text()
      console.error('❌ Conditional prediction failed:', error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testConditionalPrediction()
