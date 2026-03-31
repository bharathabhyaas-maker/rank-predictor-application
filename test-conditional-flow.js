// Test conditional prediction flow
const testConditionalPrediction = async () => {
  try {
    console.log('🧪 Testing conditional prediction flow...')
    
    // Test data for CLAT-2025
    const testData = {
      studentName: "Test Student",
      studentEmail: "test@example.com",
      rollNumber: "TEST123",
      institutionId: "default",
      examId: "CLAT-2025",
      answers: {},
      totalScore: 110,
      englishScore: 25,
      reasoningScore: 28,
      legalScore: 32,
      gkScore: 25,
      mathsScore: 0
    }
    
    console.log('📤 Sending test data:', testData)
    
    const response = await fetch('http://localhost:3000/api/predictions/conditional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Conditional prediction successful!')
      console.log('📊 Result:', JSON.stringify(result, null, 2))
      
      // Check if it shows conditional-based prediction
      if (result.prediction && result.prediction.calculationMethod) {
        console.log(`🎯 Calculation Method: ${result.prediction.calculationMethod}`)
      }
      
      if (result.prediction && result.prediction.predictedRank) {
        console.log(`🏆 Predicted Rank: ${result.prediction.predictedRank}`)
      }
      
      if (result.prediction && result.prediction.predictedPercentile) {
        console.log(`📈 Predicted Percentile: ${result.prediction.predictedPercentile}`)
      }
      
    } else {
      console.error('❌ Conditional prediction failed:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testConditionalPrediction()
