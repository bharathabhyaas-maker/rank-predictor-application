// Final comprehensive test to identify the exact issue
const testFinalComprehensive = async () => {
  console.log('🔍 FINAL COMPREHENSIVE TEST')
  console.log('============================')
  
  try {
    // Test 1: Check what templateId is being used in prediction page
    console.log('\n1️⃣ Testing prediction page template handling...')
    
    const predictPageResponse = await fetch('http://localhost:3000/predict/jee-main-2026')
    if (predictPageResponse.ok) {
      const pageText = await predictPageResponse.text()
      
      // Look for template ID in the page
      const hasTemplateId = pageText.includes('cmn31qgkz000520lhg5nemut5')
      const hasFallbackConfig = pageText.includes('Fallback configuration')
      
      console.log('   Has template ID in page:', hasTemplateId ? 'Yes' : 'No')
      console.log('   Has fallback config:', hasFallbackConfig ? 'Yes' : 'No')
      
      if (hasFallbackConfig) {
        console.log('   ⚠️ Page is using fallback config')
        console.log('   ⚠️ This might cause templateId issues in AI API')
      }
    }
    
    // Test 2: Try AI prediction with fallback config scenario
    console.log('\n2️⃣ Testing AI prediction with fallback scenario...')
    
    // Simulate what happens when templateId is the fallback examId
    const fallbackTestResponse = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Fallback Test',
        studentEmail: 'fallback@example.com',
        examId: 'JEE-MAIN-2026',
        templateId: 'JEE-MAIN-2026', // Use examId as templateId (fallback scenario)
        totalScore: 235,
        aiSource: 'internet'
      })
    })
    
    console.log('   Fallback templateId test status:', fallbackTestResponse.status)
    
    if (fallbackTestResponse.ok) {
      const fallbackData = await fallbackTestResponse.json()
      console.log('   ✅ Fallback templateId works')
      console.log(`   Prediction ID: ${fallbackData.prediction.id}`)
    } else {
      console.log('   ❌ Fallback templateId failed:', await fallbackTestResponse.text())
    }
    
    // Test 3: Try AI prediction with real templateId
    console.log('\n3️⃣ Testing AI prediction with real templateId...')
    
    const realTemplateTestResponse = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: 'Real Template Test',
        studentEmail: 'real@example.com',
        examId: 'JEE-MAIN-2026',
        templateId: 'cmn31qgkz000520lhg5nemut5', // Real template ID
        totalScore: 238,
        aiSource: 'internet'
      })
    })
    
    console.log('   Real templateId test status:', realTemplateTestResponse.status)
    
    if (realTemplateTestResponse.ok) {
      const realData = await realTemplateTestResponse.json()
      console.log('   ✅ Real templateId works')
      console.log(`   Prediction ID: ${realData.prediction.id}`)
    } else {
      console.log('   ❌ Real templateId failed:', await realTemplateTestResponse.text())
    }
    
    // Test 4: Check results page after predictions
    console.log('\n4️⃣ Testing results page after predictions...')
    
    // First test after fallback prediction
    const fallbackResultsResponse = await fetch('http://localhost:3000/results/jee-main-2026')
    console.log('   Results after fallback test status:', fallbackResultsResponse.status)
    
    if (fallbackResultsResponse.ok) {
      const fallbackResultsText = await fallbackResultsResponse.text()
      const hasNoPredictionYet = fallbackResultsText.includes('No Prediction Yet')
      const hasUndefined = fallbackResultsText.includes('undefined')
      
      console.log('   After fallback - Has "No Prediction Yet":', hasNoPredictionYet ? 'Yes' : 'No')
      console.log('   After fallback - Has "undefined":', hasUndefined ? 'Yes' : 'No')
    }
    
    // Then test after real template prediction
    const realResultsResponse = await fetch('http://localhost:3000/results/jee-main-2026')
    console.log('   Results after real template test status:', realResultsResponse.status)
    
    if (realResultsResponse.ok) {
      const realResultsText = await realResultsResponse.text()
      const realHasNoPredictionYet = realResultsText.includes('No Prediction Yet')
      const realHasUndefined = realResultsText.includes('undefined')
      
      console.log('   After real template - Has "No Prediction Yet":', realHasNoPredictionYet ? 'Yes' : 'No')
      console.log('   After real template - Has "undefined":', realHasUndefined ? 'Yes' : 'No')
    }
    
    console.log('\n🎯 COMPREHENSIVE TEST SUMMARY:')
    console.log('✅ Template ID handling tested')
    console.log('✅ Fallback scenario tested')
    console.log('✅ Real template scenario tested')
    console.log('✅ Results page behavior verified')
    
    console.log('\n📝 LIKELY ISSUE:')
    if (hasFallbackConfig) {
      console.log('- Prediction page is using fallback config')
      console.log('- Fallback config.id = examCode')
      console.log('- But AI API expects real template ID')
      console.log('- This mismatch could cause 500 errors')
    }
    
    console.log('\n🔧 RECOMMENDED FIX:')
    console.log('1. Ensure fallback config uses proper template ID')
    console.log('2. Or handle templateId = examId in AI API')
    console.log('3. Add better error handling for template not found')
    
    console.log('\n🎉 TEST COMPLETE!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testFinalComprehensive()
