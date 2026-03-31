// Test with your exact form data to find the issue
const testExactFormData = async () => {
  console.log('🔍 TESTING EXACT FORM DATA SCENARIO')
  console.log('===================================')
  
  try {
    // Simulate the exact form data you provided
    const formData = {
      fullName: 'Bharath Abhyaas',
      email: 'bharathabhyaas@gmail.com',
      phone: '9848547895',
      hallTicketNumber: '26541235678',
      city: 'hyderabad',
      expectedScore: 'no',  // You said "No" to section-wise
      expectedScoreValue: '224',  // But you still entered a score
      provideSectionData: 'no'
    }
    
    console.log('📋 Your form data:')
    console.log('   provideSectionData:', formData.provideSectionData)
    console.log('   expectedScore:', formData.expectedScore)
    console.log('   expectedScoreValue:', formData.expectedScoreValue)
    
    // Test validation logic manually
    const config = { askExpectedScore: true }  // Template asks for expected score
    
    // This is the validation logic from the code
    const validationError = config?.askExpectedScore && formData.expectedScore === "yes" && !formData.expectedScoreValue
    
    console.log('\n🔍 Validation check:')
    console.log('   askExpectedScore:', config?.askExpectedScore)
    console.log('   expectedScore === "yes":', formData.expectedScore === "yes")
    console.log('   !expectedScoreValue:', !formData.expectedScoreValue)
    console.log('   Validation error should be:', validationError)
    console.log('   Form should be valid:', !validationError)
    
    if (validationError) {
      console.log('❌ PROBLEM FOUND: Validation incorrectly failing')
      console.log('   The issue is: expectedScore is "no" but validation expects "yes"')
      console.log('   Expected score field should be ignored when provideSectionData is "no"')
    } else {
      console.log('✅ Validation should pass')
    }
    
    // Test what the form should do
    console.log('\n📝 Expected behavior:')
    console.log('   1. Since provideSectionData is "no", form should use expectedScoreValue directly')
    console.log('   2. Since expectedScore is "no", validation should NOT require expectedScoreValue')
    console.log('   3. Total score calculation should use parseInt(expectedScoreValue)')
    
    // Test the actual API call with your data
    console.log('\n🤖 Testing actual AI prediction with your data...')
    const aiResponse = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: formData.fullName,
        studentEmail: formData.email,
        rollNumber: formData.hallTicketNumber,
        examId: 'JEE-MAIN-2026',
        templateId: 'cmn31qgkz000520lhg5nemut5',
        totalScore: parseInt(formData.expectedScoreValue) || 224,
        aiSource: 'internet',
        answers: {}  // No section-wise data
      })
    })
    
    console.log('AI API Status:', aiResponse.status)
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json()
      console.log('✅ AI Prediction successful!')
      console.log('   Prediction ID:', aiData.prediction.id)
      console.log('   Predicted Percentile:', aiData.prediction.predictedPercentile + '%')
      
      // Test results page
      console.log('\n📊 Testing results page...')
      const resultsResponse = await fetch('http://localhost:3000/results/jee-main-2026')
      console.log('Results Status:', resultsResponse.status)
      
      if (resultsResponse.ok) {
        const resultsText = await resultsResponse.text()
        console.log('   Contains prediction data:', resultsText.includes('percentile') || resultsText.includes('rank') ? 'Yes' : 'No')
        console.log('   Shows "No Prediction Yet":', resultsText.includes('No Prediction Yet') ? 'Yes' : 'No')
      }
      
    } else {
      console.log('❌ AI Prediction failed:', await aiResponse.text())
    }
    
    console.log('\n🎯 DIAGNOSIS:')
    if (aiResponse.ok && resultsResponse.ok) {
      console.log('✅ Everything works correctly')
      console.log('📝 If you are still not seeing results in browser:')
      console.log('   1. Check browser console for JavaScript errors')
      console.log('   2. Make sure form submission completes without errors')
      console.log('   3. Check if sessionStorage is being set correctly')
      console.log('   4. Try refreshing the results page after prediction')
    } else {
      console.log('❌ There is still a technical issue')
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testExactFormData()
