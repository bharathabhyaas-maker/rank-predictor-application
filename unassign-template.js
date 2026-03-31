// Unassign template from all institutions
const unassignTemplate = async (templateId, templateName) => {
  try {
    console.log(`🔗 Unassigning template: ${templateName} (${templateId})`)
    
    // Get all institutions
    const institutionsResponse = await fetch('http://localhost:3000/api/institutions')
    
    if (!institutionsResponse.ok) {
      console.error('❌ Failed to get institutions')
      return
    }
    
    const institutions = await institutionsResponse.json()
    console.log(`Found ${institutions.length} institutions`)
    
    // Check each institution for this template
    for (const institution of institutions) {
      console.log(`\n🔍 Checking ${institution.name}...`)
      
      const assignmentsResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${institution.id}`)
      
      if (assignmentsResponse.ok) {
        const assignments = await assignmentsResponse.json()
        const hasTemplate = assignments.some(a => a.id === templateId)
        
        if (hasTemplate) {
          console.log(`  ✅ Found assignment - unassigning...`)
          
          const unassignResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${institution.id}&templateId=${templateId}`, {
            method: 'DELETE'
          })
          
          if (unassignResponse.ok) {
            console.log(`  ✅ Successfully unassigned from ${institution.name}`)
          } else {
            const error = await unassignResponse.json()
            console.error(`  ❌ Failed to unassign from ${institution.name}:`, error)
          }
        } else {
          console.log(`  ℹ️ No assignment found`)
        }
      } else {
        console.error(`  ❌ Failed to check assignments for ${institution.name}`)
      }
    }
    
    console.log('\n✅ Unassignment process completed!')
    console.log('💡 Now you can delete the template from the admin interface')
    
  } catch (error) {
    console.error('❌ Unassign failed:', error)
  }
}

// Unassign JEE MAIN 2021 (replace with actual template ID)
unassignTemplate('cmmu81mqc0005gclhnjpugqgb', 'JEE MAIN 2021')
