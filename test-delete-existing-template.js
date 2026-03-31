// Test deleting an existing template to see if the delete functionality works
const testDeleteExistingTemplate = async () => {
  try {
    console.log('🧪 Testing deletion of existing template...')
    
    // Get JEE MAIN 2022 template
    const templateId = 'cmmt7vs9w00056clhj3stmiq2' // JEE MAIN 2022
    
    console.log('\n📋 Testing with JEE MAIN 2022 template...')
    console.log('📋 Template ID:', templateId)
    
    // Get template details first
    const templatesResponse = await fetch('http://localhost:3000/api/templates')
    
    if (!templatesResponse.ok) {
      console.error('❌ Failed to get templates:', templatesResponse.statusText)
      return
    }
    
    const templates = await templatesResponse.json()
    const testTemplate = templates.find(t => t.id === templateId)
    
    if (!testTemplate) {
      console.error('❌ Template not found')
      return
    }
    
    console.log('✅ Found template:', testTemplate.name)
    console.log('📊 Template details:', {
      id: testTemplate.id,
      name: testTemplate.name,
      examCode: testTemplate.examCode,
      type: testTemplate.type,
      assignedInstitutions: testTemplate.assignedInstitutions,
      predictions: testTemplate.predictions
    })
    
    // Attempt deletion
    console.log('\n🗑️ Attempting deletion...')
    
    const deleteResponse = await fetch(`http://localhost:3000/api/templates?id=${templateId}`, {
      method: 'DELETE'
    })
    
    console.log('📊 Response status:', deleteResponse.status)
    
    const responseText = await deleteResponse.text()
    console.log('📊 Response body:', responseText)
    
    if (deleteResponse.ok) {
      console.log('✅ Delete successful!')
      try {
        const result = JSON.parse(responseText)
        console.log('📋 Delete result:', result)
      } catch (e) {
        console.log('📋 Raw response:', responseText)
      }
    } else {
      console.error('❌ Delete failed!')
      try {
        const error = JSON.parse(responseText)
        console.error('📋 Error details:', error)
        
        // Analyze the specific error
        if (error.details?.includes('assigned to')) {
          console.log('\n🔍 ISSUE: Template is assigned to institutions')
          console.log('💡 SOLUTION: Unassign first, then delete')
        } else if (error.details?.includes('foreign key')) {
          console.log('\n🔍 ISSUE: Database foreign key constraint')
          console.log('💡 SOLUTION: Delete related exam first')
        } else {
          console.log('\n🔍 ISSUE: Unknown error')
          console.log('💡 SOLUTION: Check server logs')
        }
      } catch (e) {
        console.error('📋 Raw error:', responseText)
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testDeleteExistingTemplate()
