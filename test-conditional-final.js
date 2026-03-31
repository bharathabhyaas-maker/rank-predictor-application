// Final test script to verify conditional API works

const testConditionalAPI = async () => {
  console.log('🧪 Testing Conditional API...')
  
  try {
    const response = await fetch('http://localhost:3000/api/predictions/conditional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName: 'Test Student',
        studentEmail: 'test@example.com',
        institutionId: 'cmmu45bd200007klhs7q4n8jd',
        examId: 'jee-main-2025',
        totalScore: 180,
        mathsScore: 60,
        physicsScore: 60,
        chemistryScore: 60
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ SUCCESS: Conditional API working!')
      console.log('📊 Prediction:', result.prediction)
      console.log('🎯 Rank:', result.prediction.predictedRank)
      console.log('📈 Percentile:', result.prediction.predictedPercentile)
      console.log('🎉 TEST PASSED: Your conditional prediction API is working!')
    } else {
      console.log('❌ FAILED: Conditional API error:', result.error)
      console.log('🚨 TEST FAILED: API needs more fixes')
    }
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error)
  }
}

testConditionalAPI()
