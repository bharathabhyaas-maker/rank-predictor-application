// Test the prediction flow
const testPredictionFlow = async () => {
  try {
    console.log('🧪 Testing prediction flow...')
    
    // Test 1: Check if predict page loads
    console.log('\n1. Testing predict page load:')
    const predictResponse = await fetch('http://localhost:3000/predict/jee-main-2026')
    console.log('Status:', predictResponse.status)
    if (predictResponse.ok) {
      console.log('✅ Predict page loads successfully')
    } else {
      console.log('❌ Predict page failed:', await predictResponse.text())
    }
    
    // Test 2: Check if templates API works
    console.log('\n2. Testing templates API:')
    const templateResponse = await fetch('http://localhost:3000/api/templates?examCode=jee-main-2026')
    console.log('Status:', templateResponse.status)
    if (templateResponse.ok) {
      const templates = await templateResponse.json()
      console.log('✅ Templates API works, found:', templates.length, 'templates')
    } else {
      console.log('❌ Templates API failed:', await templateResponse.text())
    }
    
    // Test 3: Check if AI prediction API works
    console.log('\n3. Testing AI prediction API (with mock data):')
    const aiResponse = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Test Student',
        studentEmail: 'test@example.com',
        examId: 'jee-main-2026',
        templateId: 'test-template',
        totalScore: 150,
        aiSource: 'internet'
      })
    })
    console.log('Status:', aiResponse.status)
    if (aiResponse.ok) {
      const result = await aiResponse.json()
      console.log('✅ AI prediction API works:', result.id || 'Success')
    } else {
      console.log('❌ AI prediction API failed:', await aiResponse.text())
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testPredictionFlow()
