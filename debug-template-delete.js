// Debug template deletion to see the exact error
const debugTemplateDelete = async () => {
  try {
    console.log('🔍 Debugging template deletion...')
    
    // Get all templates first
    console.log('\n📋 Getting all templates...')
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
    
    // Try to delete the first template
    const templateToDelete = templates[0]
    console.log(`\n🗑️ Attempting to delete: ${templateToDelete.name} (${templateToDelete.id})`)
    console.log('📊 Template details:', {
      id: templateToDelete.id,
      name: templateToDelete.name,
      examCode: templateToDelete.examCode,
      type: templateToDelete.type,
      assignedInstitutions: templateToDelete.assignedInstitutions,
      predictions: templateToDelete.predictions
    })
    
    const deleteResponse = await fetch(`http://localhost:3000/api/templates?id=${templateToDelete.id}`, {
      method: 'DELETE'
    })
    
    console.log('📊 Delete response status:', deleteResponse.status)
    console.log('📊 Delete response headers:', Object.fromEntries(deleteResponse.headers))
    
    const responseText = await deleteResponse.text()
    console.log('📊 Delete response body:', responseText)
    
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
      } catch (e) {
        console.error('📋 Raw error:', responseText)
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run the debug
debugTemplateDelete()
