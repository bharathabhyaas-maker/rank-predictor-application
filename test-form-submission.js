// Test the exact form submission you're doing
const testFormSubmission = async () => {
  console.log('🧪 TESTING YOUR EXACT FORM SUBMISSION')
  console.log('=====================================')
  
  try {
    // Test with your exact data
    const formData = {
      fullName: 'Bharath Abhyaas',
      email: 'bharathabhyaas@gmail.com',
      phone: '9848547895',
      hallTicketNumber: '26541235678',
      city: 'hyderabad',
      expectedScore: '224',
      expectedScoreValue: '224'
    }
    
    const subjectData = [
      { name: 'Physics', attempted: '', correct: '' },
      { name: 'Chemistry', attempted: '', correct: '' },
      { name: 'Mathematics', attempted: '', correct: '' }
    ]
    
    console.log('\n📋 Form Data:')
    console.log('   Name:', formData.fullName)
    console.log('   Email:', formData.email)
    console.log('   Expected Score:', formData.expectedScore)
    console.log('   Subjects:', subjectData.map(s => s.name).join(', '))
    
    // Test the AI prediction API directly
    console.log('\n🤖 Testing AI prediction API...')
    const aiResponse = await fetch('http://localhost:3000/api/predictions/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentName: formData.fullName,
        studentEmail: formData.email,
        rollNumber: formData.hallTicketNumber,
        examId: 'JEE-MAIN-2026',
        templateId: 'cmn31qgkz000520lhg5nemut5',
        totalScore: parseInt(formData.expectedScore),
        aiSource: 'internet',
        answers: subjectData.reduce((acc, subject) => {
          acc[subject.name] = {
            attempted: subject.attempted || '0',
            correct: subject.correct || '0'
          }
          return acc
        }, {})
      })
    })
    
    console.log('AI API Status:', aiResponse.status)
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json()
      console.log('✅ AI Prediction successful!')
      console.log('   Prediction ID:', aiData.prediction.id)
      console.log('   Predicted Percentile:', aiData.prediction.predictedPercentile + '%')
      console.log('   Predicted Rank:', aiData.prediction.predictedRank.toLocaleString())
      
      // Now test if results page can find this prediction
      console.log('\n📊 Testing results page...')
      const resultsResponse = await fetch('http://localhost:3000/results/jee-main-2026')
      console.log('Results Status:', resultsResponse.status)
      
      if (resultsResponse.ok) {
        const resultsText = await resultsResponse.text()
        console.log('✅ Results page loads')
        console.log('   Contains prediction data:', resultsText.includes('percentile') || resultsText.includes('rank') ? 'Yes' : 'No')
        console.log('   Shows "No Prediction Yet":', resultsText.includes('No Prediction Yet') ? 'Yes' : 'No')
      }
      
    } else {
      console.log('❌ AI Prediction failed:', await aiResponse.text())
    }
    
    console.log('\n🎯 FORM SUBMISSION TEST COMPLETE')
    console.log('If you\'re still not seeing results, the issue might be:')
    console.log('1. Browser sessionStorage not being set properly')
    console.log('2. Results page not finding the prediction in database')
    console.log('3. JavaScript error in browser during form submission')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testFormSubmission()
