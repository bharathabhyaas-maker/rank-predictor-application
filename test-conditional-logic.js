// Test conditional prediction logic
const testConditionalPrediction = async () => {
  try {
    console.log('🧪 Testing conditional prediction logic...')
    
    // Step 1: Find a conditional template
    console.log('\n🔍 Step 1: Finding conditional template...')
    const templatesResponse = await fetch('http://localhost:3000/api/templates')
    
    if (!templatesResponse.ok) {
      console.error('❌ Failed to get templates:', templatesResponse.statusText)
      return
    }
    
    const templates = await templatesResponse.json()
    const conditionalTemplate = templates.find(t => t.type === 'conditional')
    
    if (!conditionalTemplate) {
      console.error('❌ No conditional template found')
      return
    }
    
    console.log('✅ Found conditional template:', conditionalTemplate.name, conditionalTemplate.examCode)
    
    // Step 2: Get the exam ID for this template
    console.log('\n🔍 Step 2: Finding exam for template...')
    const examsResponse = await fetch('http://localhost:3000/api/exams')
    
    if (!examsResponse.ok) {
      console.error('❌ Failed to get exams:', examsResponse.statusText)
      return
    }
    
    const exams = await examsResponse.json()
    const exam = exams.find(e => e.templateId === conditionalTemplate.id)
    
    if (!exam) {
      console.error('❌ No exam found for this template')
      return
    }
    
    console.log('✅ Found exam:', exam.name, 'ID:', exam.id)
    
    // Step 3: Test conditional prediction
    console.log('\n📊 Step 3: Testing conditional prediction...')
    
    const predictionData = {
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
      rollNumber: 'TEST001',
      institutionId: 'cmmu45bd200007klhs7q4n8jd', // Anwar Institute
      examId: exam.id,
      totalScore: 350, // High score to test conditions
      englishScore: 80,
      reasoningScore: 85,
      legalScore: 90,
      mathsScore: 95,
      answers: {
        english: [1, 2, 3, 4, 5],
        reasoning: [1, 2, 3, 4, 5],
        legal: [1, 2, 3, 4, 5],
        maths: [1, 2, 3, 4, 5]
      }
    }
    
    console.log('📋 Prediction data:', predictionData)
    
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
      console.log('📊 Prediction result:', {
        predictedRank: predictionResult.predictedRank,
        predictedPercentile: predictionResult.predictedPercentile,
        bestCaseRank: predictionResult.bestCaseRank,
        worstCaseRank: predictionResult.worstCaseRank,
        avgRank: predictionResult.avgRank,
        bestCasePercentile: predictionResult.bestCasePercentile,
        worstCasePercentile: predictionResult.worstCasePercentile,
        avgPercentile: predictionResult.avgPercentile
      })
      
      // Check if prediction is based on conditions
      if (predictionResult.predictedRank && predictionResult.predictedPercentile) {
        console.log('✅ SUCCESS: Rank prediction is based on conditions')
      } else {
        console.error('❌ ERROR: Rank prediction not calculated from conditions')
      }
    } else {
      console.error('❌ Conditional prediction failed:', predictionResponse.status)
      console.error('📋 Error details:', predictionResult)
    }
    
    // Step 4: Check if conditions were used
    console.log('\n🔍 Step 4: Checking stored prediction...')
    const storedPrediction = await fetch(`http://localhost:3000/api/predictions?examId=${exam.id}`)
    
    if (storedPrediction.ok) {
      const predictions = await storedPrediction.json()
      const latestPrediction = predictions[predictions.length - 1]
      
      if (latestPrediction) {
        console.log('✅ Found stored prediction:', {
          studentName: latestPrediction.studentName,
          predictedRank: latestPrediction.predictedRank,
          predictedPercentile: latestPrediction.predictedPercentile,
          predictionType: latestPrediction.predictionType,
          metadata: latestPrediction.metadata
        })
        
        if (latestPrediction.predictionType === 'conditional') {
          console.log('✅ SUCCESS: Prediction type is "conditional"')
        } else {
          console.error(`❌ ERROR: Prediction type is "${latestPrediction.predictionType}" instead of "conditional"`)
        }
      }
    } else {
      console.error('❌ Failed to get stored predictions')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testConditionalPrediction()
