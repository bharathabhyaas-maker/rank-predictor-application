// Test the temporary conditional API
const testTempConditional = async () => {
  try {
    console.log('🧪 Testing temporary conditional API...')
    
    // Test CLAT-2025 with score 110
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
    
    console.log('📤 Testing CLAT-2025 with score 110...')
    
    const response = await fetch('http://localhost:3000/api/predictions/conditional-temp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Temporary conditional API successful!')
      console.log('📊 Result:', JSON.stringify(result, null, 2))
      
      console.log('\n🎯 Expected Results for Score 110:')
      console.log('   Method: Condition-Based Analysis ✅')
      console.log('   Best Case: 85th percentile (Rank ~11,250)')
      console.log('   Worst Case: 75th percentile (Rank ~18,750)')
      console.log('   Predicted: 80th percentile (Rank ~15,000)')
      
    } else {
      console.error('❌ Temporary conditional API failed:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('Error details:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testTempConditional()
