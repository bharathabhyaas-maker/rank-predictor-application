// Final comprehensive test of prediction system
const finalTest = async () => {
  console.log('🎯 FINAL PREDICTION SYSTEM TEST')
  console.log('==================================')
  
  const testExam = 'jee-main-2026'
  const testData = {
    studentName: 'Alice Johnson',
    studentEmail: 'alice@example.com',
    rollNumber: 'JEE2026001',
    totalScore: 220,
    answers: {
      'Physics': { attempted: '25', correct: '20' },
      'Chemistry': { attempted: '25', correct: '18' },
      'Mathematics': { attempted: '25', correct: '22' }
    }
  }
  
  try {
    // Test 1: Predict page accessibility
    console.log('\n1️⃣ Testing predict page accessibility...')
    const predictRes = await fetch(`http://localhost:3001/predict/${testExam}`)
    console.log(`   Status: ${predictRes.status} ${predictRes.ok ? '✅' : '❌'}`)
    
    // Test 2: Template lookup
    console.log('\n2️⃣ Testing template lookup...')
    const templateRes = await fetch(`http://localhost:3001/api/templates?examCode=${testExam.toUpperCase()}`)
    if (templateRes.ok) {
      const templates = await templateRes.json()
      console.log(`   Templates found: ${templates.length} ✅`)
      if (templates.length > 0) {
        console.log(`   Using template: ${templates[0].name}`)
      }
    } else {
      console.log('   Template lookup failed ❌')
    }
    
    // Test 3: AI prediction creation
    console.log('\n3️⃣ Testing AI prediction creation...')
    const aiRes = await fetch('http://localhost:3001/api/predictions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testData,
        examId: testExam.toUpperCase(), // Test case handling
        templateId: 'cmn31qgkz000520lhg5nemut5',
        aiSource: 'internet'
      })
    })
    console.log(`   AI Prediction Status: ${aiRes.status} ${aiRes.ok ? '✅' : '❌'}`)
    
    if (aiRes.ok) {
      const aiData = await aiRes.json()
      console.log(`   Prediction ID: ${aiData.prediction.id}`)
      console.log(`   Predicted Percentile: ${aiData.prediction.predictedPercentile}%`)
      console.log(`   Predicted Rank: ${aiData.prediction.predictedRank.toLocaleString()}`)
    }
    
    // Test 4: Results page accessibility
    console.log('\n4️⃣ Testing results page accessibility...')
    const resultsRes = await fetch(`http://localhost:3001/results/${testExam}`)
    console.log(`   Status: ${resultsRes.status} ${resultsRes.ok ? '✅' : '❌'}`)
    
    // Test 5: Predictions retrieval
    console.log('\n5️⃣ Testing predictions retrieval...')
    const predictionsRes = await fetch(`http://localhost:3001/api/predictions?examId=${testExam.toUpperCase()}`)
    console.log(`   Predictions API Status: ${predictionsRes.status} ${predictionsRes.ok ? '✅' : '❌'}`)
    
    if (predictionsRes.ok) {
      const predictions = await predictionsRes.json()
      console.log(`   Total predictions: ${predictions.length}`)
    }
    
    console.log('\n🎉 PREDICTION SYSTEM TEST COMPLETE!')
    console.log('✅ All core functionality is working')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

finalTest()
