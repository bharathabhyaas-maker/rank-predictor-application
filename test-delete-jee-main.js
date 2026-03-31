// Test deleting the specific JEE MAIN 2021 template
const testDeleteJeeMain = async () => {
  try {
    console.log('🧪 Testing JEE MAIN 2021 template deletion...')
    
    // Find the JEE MAIN 2021 template
    console.log('\n📋 Finding JEE MAIN 2021 template...')
    const templatesResponse = await fetch('http://localhost:3000/api/templates')
    
    if (!templatesResponse.ok) {
      console.error('❌ Failed to get templates:', templatesResponse.statusText)
      return
    }
    
    const templates = await templatesResponse.json()
    const jeeMainTemplate = templates.find(t => t.name === 'JEE MAIN 2021')
    
    if (!jeeMainTemplate) {
      console.error('❌ JEE MAIN 2021 template not found')
      console.log('📋 Available templates:')
      templates.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.name} (${t.examCode}) - ID: ${t.id}`)
      })
      return
    }
    
    console.log('✅ Found JEE MAIN 2021 template:')
    console.log('📋 Template details:', {
      id: jeeMainTemplate.id,
      name: jeeMainTemplate.name,
      examCode: jeeMainTemplate.examCode,
      type: jeeMainTemplate.type,
      assignedInstitutions: jeeMainTemplate.assignedInstitutions,
      predictions: jeeMainTemplate.predictions
    })
    
    // Attempt deletion
    console.log('\n🗑️ Attempting to delete JEE MAIN 2021...')
    
    const deleteResponse = await fetch(`http://localhost:3000/api/templates?id=${jeeMainTemplate.id}`, {
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
        
        // Provide specific solutions based on error type
        if (error.details?.includes('assigned to')) {
          console.log('\n💡 SOLUTION: Template is assigned to institutions')
          console.log('   1. Go to /institution/templates')
          console.log('   2. Find "JEE MAIN 2021"')
          console.log('   3. Click the trash icon to unassign')
          console.log('   4. Then try deletion again')
        } else if (error.details?.includes('foreign key')) {
          console.log('\n💡 SOLUTION: Database constraint issue')
          console.log('   1. Check server logs for detailed error')
          console.log('   2. May need to delete related exam first')
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
testDeleteJeeMain()
