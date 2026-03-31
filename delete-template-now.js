// Try deleting the template now that it's unassigned
const deleteTemplateNow = async () => {
  try {
    console.log('🗑️ Attempting to delete unassigned template...')
    const templateId = 'cmmu45bdm00017klheqsa9qjj'
    
    const deleteResponse = await fetch(`http://localhost:3000/api/templates?id=${templateId}`, {
      method: 'DELETE'
    })
    
    console.log('📊 Response status:', deleteResponse.status)
    console.log('📊 Response headers:', Object.fromEntries(deleteResponse.headers))
    
    const responseText = await deleteResponse.text()
    console.log('📊 Response text:', responseText)
    
    if (deleteResponse.ok) {
      console.log('✅ Template deleted successfully!')
      try {
        const result = JSON.parse(responseText)
        console.log('📋 Delete result:', result)
      } catch (e) {
        console.log('📋 Raw response:', responseText)
      }
    } else {
      console.error('❌ Template deletion failed:', deleteResponse.status)
      console.error('📋 Error response:', responseText)
    }
    
  } catch (error) {
    console.error('❌ Delete failed:', error)
  }
}

// Run the deletion
deleteTemplateNow()
