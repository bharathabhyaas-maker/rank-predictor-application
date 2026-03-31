// Test template delete functionality
const testTemplateDelete = async () => {
  try {
    console.log('🧪 Testing template delete API...')
    
    // First, get all templates to find one to delete
    console.log('\n📋 Getting all templates...')
    const templatesResponse = await fetch('http://localhost:3000/api/templates')
    
    if (!templatesResponse.ok) {
      console.error('❌ Failed to get templates:', templatesResponse.statusText)
      return
    }
    
    const templates = await templatesResponse.json()
    console.log(`Found ${templates.length} templates`)
    
    if (templates.length === 0) {
      console.log('📭 No templates to delete')
      return
    }
    
    // Find a template to delete (preferably one without assignments)
    const templateToDelete = templates.find(t => t.assignedInstitutions === 0) || templates[0]
    
    console.log(`\n🎯 Attempting to delete template: ${templateToDelete.name} (${templateToDelete.examCode})`)
    console.log(`📊 Template details:`, {
      id: templateToDelete.id,
      name: templateToDelete.name,
      examCode: templateToDelete.examCode,
      assignedInstitutions: templateToDelete.assignedInstitutions,
      predictions: templateToDelete.predictions
    })
    
    // Test DELETE request
    const deleteResponse = await fetch(`http://localhost:3000/api/templates?id=${templateToDelete.id}`, {
      method: 'DELETE'
    })
    
    const deleteResult = await deleteResponse.json()
    
    if (deleteResponse.ok) {
      console.log('✅ Template deleted successfully!')
      console.log('📋 Delete result:', deleteResult)
    } else {
      console.error('❌ Template deletion failed:', deleteResponse.status)
      console.error('📋 Error details:', deleteResult)
    }
    
    // Verify deletion by listing templates again
    console.log('\n🔍 Verifying deletion...')
    const verifyResponse = await fetch('http://localhost:3000/api/templates')
    const remainingTemplates = await verifyResponse.json()
    
    const deletedTemplate = remainingTemplates.find(t => t.id === templateToDelete.id)
    
    if (deletedTemplate) {
      console.log('❌ Template still exists after deletion!')
    } else {
      console.log('✅ Template successfully removed from list')
      console.log(`📊 Template count: ${templates.length} → ${remainingTemplates.length}`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testTemplateDelete()
