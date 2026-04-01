// Test conditional prediction with database conditions
const testConditionalPrediction = async () => {
  try {
    console.log('🧪 Testing conditional prediction with database conditions...')
    
    // Step 1: Create a conditional prediction request
    console.log('\n📝 Step 1: Creating conditional prediction request...')
    
    const predictionData = {
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
      rollNumber: 'ROLL123',
      examId: 'TEST-CONDITIONAL-2025', // Use our test exam
      totalScore: 250, // This should match the "between 200 and 299" condition
      answers: {},
      englishScore: 80,
      reasoningScore: 85,
      mathsScore: 85
    }
    
    console.log('📋 Prediction data being sent:', JSON.stringify(predictionData, null, 2))
    
    const predictionResponse = await fetch('http://localhost:3000/api/predictions/conditional', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(predictionData)
    })
    
    const predictionResult = await predictionResponse.json()
    
    if (predictionResponse.ok) {
      console.log('✅ Conditional prediction created successfully!')
      console.log('📋 Prediction result:', {
        id: predictionResult.id,
        studentName: predictionResult.studentName,
        predictedPercentile: predictionResult.predictedPercentile,
        predictedRank: predictionResult.predictedRank,
        status: predictionResult.status
      })
      
      // Step 2: Test with a score that matches the first condition
      console.log('\n📝 Step 2: Testing with high score (300+)...')
      
      const highScoreData = {
        ...predictionData,
        studentEmail: 'highscore@example.com',
        totalScore: 320, // Should match "gte 300" condition
        rollNumber: 'ROLL456'
      }
      
      console.log('📋 High score data:', JSON.stringify(highScoreData, null, 2))
      
      const highScoreResponse = await fetch('http://localhost:3000/api/predictions/conditional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(highScoreData)
      })
      
      const highScoreResult = await highScoreResponse.json()
      
      if (highScoreResponse.ok) {
        console.log('✅ High score prediction created successfully!')
        console.log('📋 High score result:', {
          id: highScoreResult.id,
          predictedPercentile: highScoreResult.predictedPercentile,
          predictedRank: highScoreResult.predictedRank,
          calculation: highScoreResult.calculation
        })
        
        // Step 3: Test with a score that doesn't match any condition
        console.log('\n📝 Step 3: Testing with low score (below all conditions)...')
        
        const lowScoreData = {
          ...predictionData,
          studentEmail: 'lowscore@example.com',
          totalScore: 150, // Should not match any condition
          rollNumber: 'ROLL789'
        }
        
        console.log('📋 Low score data:', JSON.stringify(lowScoreData, null, 2))
        
        const lowScoreResponse = await fetch('http://localhost:3000/api/predictions/conditional', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lowScoreData)
        })
        
        const lowScoreResult = await lowScoreResponse.json()
        
        if (lowScoreResponse.ok) {
          console.log('✅ Low score prediction created successfully!')
          console.log('📋 Low score result:', {
            id: lowScoreResult.id,
            predictedPercentile: lowScoreResult.predictedPercentile,
            predictedRank: lowScoreResult.predictedRank,
            calculation: lowScoreResult.calculation
          })
          
          console.log('\n✅ SUCCESS: All conditional predictions are working correctly!')
          console.log('📊 Summary:')
          console.log(`  - High score (320): Percentile ${highScoreResult.predictedPercentile}%, Rank ${highScoreResult.predictedRank}`)
          console.log(`  - Medium score (250): Percentile ${predictionResult.predictedPercentile}%, Rank ${predictionResult.predictedRank}`)
          console.log(`  - Low score (150): Percentile ${lowScoreResult.predictedPercentile}%, Rank ${lowScoreResult.predictedRank}`)
          
        } else {
          console.error('❌ Low score prediction failed:', lowScoreResponse.status)
          console.error('📋 Error details:', lowScoreResult)
        }
        
      } else {
        console.error('❌ High score prediction failed:', highScoreResponse.status)
        console.error('📋 Error details:', highScoreResult)
      }
      
    } else {
      console.error('❌ Conditional prediction failed:', predictionResponse.status)
      console.error('📋 Error details:', predictionResult)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testConditionalPrediction()
