// Test complete prediction flow
const testCompleteFlow = async () => {
  try {
    console.log('🧪 Testing complete prediction flow...')
    
    // Step 1: Test predict page loads
    console.log('\n1. Testing predict page load:')
    const predictResponse = await fetch('http://localhost:3001/predict/jee-main-2026')
    console.log('Status:', predictResponse.status)
    if (predictResponse.ok) {
      console.log('✅ Predict page loads successfully')
    } else {
      console.log('❌ Predict page failed:', await predictResponse.text())
      return
    }
    
    // Step 2: Test AI prediction creation (simulating form submission)
    console.log('\n2. Testing AI prediction creation:')
    const aiResponse = await fetch('http://localhost:3001/api/predictions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        rollNumber: 'JE2026001',
        examId: 'JEE-MAIN-2026',
        templateId: 'cmn31qgkz000520lhg5nemut5',
        totalScore: 180,
        aiSource: 'internet',
        answers: {
          'Physics': { attempted: '20', correct: '15' },
          'Chemistry': { attempted: '20', correct: '12' },
          'Mathematics': { attempted: '20', correct: '18' }
        }
      })
    })
    console.log('AI Prediction Status:', aiResponse.status)
    if (aiResponse.ok) {
      const aiData = await aiResponse.json()
      console.log('✅ AI prediction created:', aiData.prediction.id)
      console.log('📊 Predicted Percentile:', aiData.prediction.predictedPercentile)
      console.log('🎯 Predicted Rank:', aiData.prediction.predictedRank)
    } else {
      console.log('❌ AI prediction failed:', await aiResponse.text())
      return
    }
    
    // Step 3: Test results page (simulate sessionStorage data)
    console.log('\n3. Testing results page:')
    const resultsResponse = await fetch('http://localhost:3001/results/jee-main-2026')
    console.log('Results Status:', resultsResponse.status)
    if (resultsResponse.ok) {
      console.log('✅ Results page loads successfully')
      const text = await resultsResponse.text()
      console.log('Page contains results:', text.includes('prediction') || text.includes('percentile') ? 'Yes' : 'No')
    } else {
      console.log('❌ Results page failed:', await resultsResponse.text())
    }
    
    // Step 4: Test predictions retrieval API
    console.log('\n4. Testing predictions retrieval:')
    const predictionsResponse = await fetch('http://localhost:3001/api/predictions?examId=JEE-MAIN-2026')
    console.log('Predictions API Status:', predictionsResponse.status)
    if (predictionsResponse.ok) {
      const predictions = await predictionsResponse.json()
      console.log('✅ Predictions retrieved:', predictions.length)
      if (predictions.length > 0) {
        console.log('Latest prediction:', {
          id: predictions[0].id,
          studentName: predictions[0].studentName,
          predictedPercentile: predictions[0].predictedPercentile,
          predictedRank: predictions[0].predictedRank
        })
      }
    } else {
      console.log('❌ Predictions API failed:', await predictionsResponse.text())
    }
    
    console.log('\n🎉 Complete flow test finished!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCompleteFlow()
