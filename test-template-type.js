// Test template type storage and retrieval
const testTemplateType = async () => {
  try {
    console.log('🧪 Testing template type storage and retrieval...')
    
    // Step 1: Create a conditional template
    console.log('\n📝 Step 1: Creating conditional template...')
    const createResponse = await fetch('http://localhost:3000/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'JEE Main 2021 Test',
        examCode: 'JEE-MAIN-2021-TEST',
        description: 'Test conditional template',
        type: 'conditional',
        status: 'active'
      })
    })
    
    const createResult = await createResponse.json()
    
    if (createResponse.ok) {
      console.log('✅ Template created successfully!')
      console.log('📋 Created template:', {
        id: createResult.id,
        name: createResult.name,
        examCode: createResult.examCode,
        type: createResult.type,
        status: createResult.status
      })
    } else {
      console.error('❌ Template creation failed:', createResponse.status)
      console.error('📋 Error details:', createResult)
      return
    }
    
    // Step 2: Retrieve all templates to check the type
    console.log('\n🔍 Step 2: Retrieving templates...')
    const getResponse = await fetch('http://localhost:3000/api/templates')
    
    if (getResponse.ok) {
      const templates = await getResponse.json()
      console.log(`✅ Found ${templates.length} templates`)
      
      // Find our created template
      const ourTemplate = templates.find(t => t.examCode === 'JEE-MAIN-2021-TEST')
      
      if (ourTemplate) {
        console.log('✅ Found our template in the list!')
        console.log('📋 Retrieved template:', {
          id: ourTemplate.id,
          name: ourTemplate.name,
          examCode: ourTemplate.examCode,
          type: ourTemplate.type,
          status: ourTemplate.status
        })
        
        // Check if type is correct
        if (ourTemplate.type === 'conditional') {
          console.log('✅ SUCCESS: Template type is correctly stored as "conditional"')
        } else {
          console.error(`❌ ERROR: Template type is "${ourTemplate.type}" instead of "conditional"`)
        }
      } else {
        console.error('❌ Template not found in the list!')
      }
    } else {
      console.error('❌ Failed to retrieve templates:', getResponse.status)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testTemplateType()
