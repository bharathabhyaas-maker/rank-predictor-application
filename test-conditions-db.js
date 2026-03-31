// Test if conditions are properly stored in database
const testConditionsInDatabase = async () => {
  try {
    console.log('🧪 Testing conditions in database...')
    
    // Step 1: Get all exams
    console.log('\n📋 Step 1: Getting all exams...')
    const examsResponse = await fetch('http://localhost:3000/api/exams')
    
    if (!examsResponse.ok) {
      console.error('❌ Failed to get exams:', examsResponse.statusText)
      return
    }
    
    const exams = await examsResponse.json()
    console.log(`Found ${exams.length} exams`)
    
    // Step 2: Find exams with conditions
    console.log('\n🔍 Step 2: Finding exams with conditions...')
    
    for (const exam of exams) {
      console.log(`\n📋 Checking exam: ${exam.name} (${exam.examCode})`)
      
      // Check if this exam has conditions by looking at the exam-conditions table
      try {
        const conditionsResponse = await fetch(`http://localhost:3000/api/debug/exam-conditions?examId=${exam.id}`)
        
        if (conditionsResponse.ok) {
          const conditions = await conditionsResponse.json()
          console.log(`  📊 Conditions found: ${conditions.length}`)
          
          if (conditions.length > 0) {
            console.log('  📋 Sample condition:', conditions[0])
            console.log('  ✅ This exam has conditions stored in database')
          }
        } else {
          console.log('  ❌ Failed to get conditions for this exam')
        }
      } catch (error) {
        console.log('  ❌ Error checking conditions:', error.message)
      }
    }
    
    // Step 3: Test conditional prediction on an exam with conditions
    console.log('\n📊 Step 3: Testing conditional prediction...')
    
    // Find the first exam that might have conditions
    const testExam = exams[0]
    if (testExam) {
      console.log(`📋 Testing with exam: ${testExam.name}`)
      
      const predictionData = {
        studentName: 'Test Student',
        studentEmail: 'test@example.com',
        rollNumber: 'TEST001',
        institutionId: 'cmmu45bd200007klhs7q4n8jd',
        examId: testExam.id,
        totalScore: 350,
        englishScore: 80,
        reasoningScore: 85,
        legalScore: 90,
        mathsScore: 95,
        answers: {}
      }
      
      const predictionResponse = await fetch('http://localhost:3000/api/predictions/conditional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionData)
      })
      
      const predictionResult = await predictionResponse.json()
      
      if (predictionResponse.ok) {
        console.log('✅ Conditional prediction successful!')
        console.log('📊 Result:', {
          predictedRank: predictionResult.predictedRank,
          predictedPercentile: predictionResult.predictedPercentile,
          predictionType: predictionResult.predictionType
        })
      } else {
        console.error('❌ Conditional prediction failed:', predictionResponse.status)
        console.error('📋 Error:', predictionResult)
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testConditionsInDatabase()
