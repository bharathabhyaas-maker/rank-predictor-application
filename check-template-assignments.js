// Check template assignments and help with deletion
const checkTemplateAssignments = async (templateId) => {
  try {
    console.log('🔍 Checking template assignments...')
    console.log(`📋 Template ID: ${templateId}`)
    
    // Step 1: Get template details
    console.log('\n📋 Step 1: Getting template details...')
    const templateResponse = await fetch(`http://localhost:3000/api/templates?id=${templateId}`)
    
    if (!templateResponse.ok) {
      console.error('❌ Failed to get template:', templateResponse.statusText)
      return
    }
    
    const templates = await templateResponse.json()
    const template = templates.find(t => t.id === templateId)
    
    if (!template) {
      console.error('❌ Template not found')
      return
    }
    
    console.log('✅ Template found:', template.name, template.examCode)
    console.log('📊 Template type:', template.type)
    console.log('📊 Assigned institutions:', template.assignedTo?.length || 0)
    
    // Step 2: Check specific institution assignments
    if (template.assignedTo && template.assignedTo.length > 0) {
      console.log('\n🔗 Step 2: Template is assigned to these institutions:')
      
      template.assignedTo.forEach((assignment, index) => {
        console.log(`  ${index + 1}. ${assignment.institutionName} (ID: ${assignment.institutionId})`)
      })
      
      // Step 3: Offer to unassign
      console.log('\n🗑️ Step 3: Unassigning template from institutions...')
      
      for (const assignment of template.assignedTo) {
        console.log(`\n🗑️ Unassigning from: ${assignment.institutionName}`)
        
        const unassignResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${assignment.institutionId}&templateId=${templateId}`, {
          method: 'DELETE'
        })
        
        const unassignResult = await unassignResponse.json()
        
        if (unassignResponse.ok) {
          console.log(`✅ Successfully unassigned from ${assignment.institutionName}`)
        } else {
          console.error(`❌ Failed to unassign from ${assignment.institutionName}:`, unassignResult)
        }
      }
      
      // Step 4: Try deletion again
      console.log('\n🗑️ Step 4: Attempting template deletion again...')
      
      const deleteResponse = await fetch(`http://localhost:3000/api/templates?id=${templateId}`, {
        method: 'DELETE'
      })
      
      const deleteResult = await deleteResponse.json()
      
      if (deleteResponse.ok) {
        console.log('✅ Template deleted successfully!')
        console.log('📋 Delete result:', deleteResult)
      } else {
        console.error('❌ Template deletion still failed:', deleteResponse.status)
        console.error('📋 Error details:', deleteResult)
      }
      
    } else {
      console.log('\n✅ Template is not assigned to any institutions')
      
      // Try deletion directly
      console.log('\n🗑️ Attempting template deletion...')
      
      const deleteResponse = await fetch(`http://localhost:3000/api/templates?id=${templateId}`, {
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
    }
    
  } catch (error) {
    console.error('❌ Process failed:', error)
  }
}

// Run with the template ID from your error
checkTemplateAssignments('cmmu45bdm00017klheqsa9qjj')
