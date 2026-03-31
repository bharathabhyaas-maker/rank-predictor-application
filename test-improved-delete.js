// Test improved delete functionality
const testImprovedDelete = async () => {
  try {
    console.log('🧪 Testing improved template deletion...')
    
    // Get all templates
    const templatesResponse = await fetch('http://localhost:3000/api/templates')
    
    if (!templatesResponse.ok) {
      console.error('❌ Failed to get templates:', templatesResponse.statusText)
      return
    }
    
    const templates = await templatesResponse.json()
    console.log(`Found ${templates.length} templates`)
    
    if (templates.length === 0) {
      console.log('No templates to test with')
      return
    }
    
    // Test with the first template
    const testTemplate = templates[0]
    console.log(`\n🗑️ Testing with template: ${testTemplate.name}`)
    console.log('📋 Template details:', {
      id: testTemplate.id,
      name: testTemplate.name,
      examCode: testTemplate.examCode,
      assignedInstitutions: testTemplate.assignedInstitutions,
      predictions: testTemplate.predictions
    })
    
    console.log('\n🔍 Attempting deletion...')
    
    const deleteResponse = await fetch(`http://localhost:3000/api/templates?id=${testTemplate.id}`, {
      method: 'DELETE'
    })
    
    console.log('📊 Response status:', deleteResponse.status)
    console.log('📊 Response headers:', Object.fromEntries(deleteResponse.headers))
    
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
        
        // Show specific error handling
        if (error.details?.includes('assigned to')) {
          console.log('\n💡 SOLUTION: Template is assigned to institutions')
          console.log('   → Unassign from institutions first')
        } else if (error.details?.includes('related exam')) {
          console.log('\n💡 SOLUTION: Failed to delete related exam')
          console.log('   → Check server logs for details')
        } else {
          console.log('\n💡 SOLUTION: Unknown error occurred')
          console.log('   → Check server logs for more details')
        }
      } catch (e) {
        console.error('📋 Raw error:', responseText)
        console.log('\n💡 SOLUTION: Server returned non-JSON response')
        console.log('   → Check server logs for detailed error')
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testImprovedDelete()
