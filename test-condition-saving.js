// Test condition saving during exam creation
const testConditionSaving = async () => {
  try {
    console.log('🧪 Testing condition saving during exam creation...')
    
    // Step 1: Create a conditional exam with conditions
    console.log('\n📝 Step 1: Creating conditional exam with conditions...')
    
    const examData = {
      name: 'Test Conditional Exam',
      examCode: 'TEST-CONDITIONAL-2024',
      type: 'conditional',
      description: 'Test exam with conditions',
      config: {
        duration: 120,
        examDate: '2024-06-15',
        conditions: [
          {
            id: 1,
            parameter: 'Total Score',
            operator: 'gte',
            value: '300',
            operator2: '',
            value2: '',
            bestCasePercentile: '95.5',
            worstCasePercentile: '85.0',
            bestCaseRank: '500',
            worstCaseRank: '1500',
            avgRank: '1000',
            avgPercentile: '90.0'
          },
          {
            id: 2,
            parameter: 'Total Score',
            operator: 'between',
            value: '200',
            operator2: 'lte',
            value2: '299',
            bestCasePercentile: '84.9',
            worstCasePercentile: '75.0',
            bestCaseRank: '1600',
            worstCaseRank: '2500',
            avgRank: '2000',
            avgPercentile: '80.0'
          }
        ]
      }
    }
    
    console.log('📋 Exam data being sent:', JSON.stringify(examData, null, 2))
    
    const createResponse = await fetch('http://localhost:3000/api/exams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(examData)
    })
    
    const createResult = await createResponse.json()
    
    if (createResponse.ok) {
      console.log('✅ Exam created successfully!')
      console.log('📋 Created exam:', {
        id: createResult.id,
        name: createResult.name,
        examCode: createResult.examCode,
        type: createResult.type
      })
      
      // Step 2: Check if conditions were saved
      console.log('\n🔍 Step 2: Checking if conditions were saved...')
      
      // Get all exams to find our created exam
      const examsResponse = await fetch('http://localhost:3000/api/exams')
      
      if (examsResponse.ok) {
        const exams = await examsResponse.json()
        const ourExam = exams.find(e => e.examCode === 'TEST-CONDITIONAL-2024')
        
        if (ourExam) {
          console.log('✅ Found our exam:', ourExam.name, 'ID:', ourExam.id)
          
          // Check conditions in the database
          try {
            const conditionsResponse = await fetch(`http://localhost:3000/api/debug/exam-conditions?examId=${ourExam.id}`)
            
            if (conditionsResponse.ok) {
              const conditions = await conditionsResponse.json()
              console.log(`✅ Found ${conditions.length} conditions in database`)
              
              if (conditions.length > 0) {
                console.log('📋 Sample condition from database:')
                console.log(JSON.stringify(conditions[0], null, 2))
                console.log('✅ SUCCESS: Conditions are properly saved in database!')
              } else {
                console.error('❌ ERROR: No conditions found in database')
              }
            } else {
              console.error('❌ Failed to get conditions:', conditionsResponse.statusText)
            }
          } catch (error) {
            console.error('❌ Error checking conditions:', error)
          }
        } else {
          console.error('❌ Could not find our created exam')
        }
      } else {
        console.error('❌ Failed to get exams list')
      }
      
    } else {
      console.error('❌ Exam creation failed:', createResponse.status)
      console.error('📋 Error details:', createResult)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testConditionSaving()
