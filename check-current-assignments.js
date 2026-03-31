// Check current template assignments in database
const checkCurrentAssignments = async () => {
  try {
    console.log('🔍 Checking current template assignments...')
    
    // Get all institutions
    const institutionsResponse = await fetch('http://localhost:3000/api/institutions')
    
    if (!institutionsResponse.ok) {
      console.error('❌ Failed to get institutions')
      return
    }
    
    const institutions = await institutionsResponse.json()
    console.log(`Found ${institutions.length} institutions`)
    
    // Check each institution for CLAT 2025 template
    const templateId = 'cmmu4rd0h0000gclh0gs70wx6' // CLAT 2025
    const templateName = 'CLAT 2025'
    
    console.log(`\n📋 Checking assignments for: ${templateName} (${templateId})`)
    
    let totalAssignments = 0
    
    for (const institution of institutions) {
      console.log(`\n🔍 Checking ${institution.name}...`)
      
      const assignmentsResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${institution.id}`)
      
      if (assignmentsResponse.ok) {
        const assignments = await assignmentsResponse.json()
        const hasTemplate = assignments.some(a => a.id === templateId)
        
        if (hasTemplate) {
          console.log(`  ✅ ASSIGNED - Institution has this template`)
          totalAssignments++
        } else {
          console.log(`  ❌ NOT ASSIGNED - Institution does not have this template`)
        }
      } else {
        console.log(`  ❌ ERROR - Failed to check assignments for ${institution.name}`)
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`  - Template: ${templateName}`)
    console.log(`  - Total assignments: ${totalAssignments}`)
    console.log(`  - Should show: "${totalAssignments} institutions will get access to this template"`)
    
    if (totalAssignments > 0) {
      console.log(`\n💡 If frontend still shows different number, it's a caching issue.`)
      console.log(`  - Try refreshing the browser page (F5)`)
      console.log(`  - Or use the Refresh Page button`)
    } else {
      console.log(`\n✅ Template is unassigned from all institutions!`)
      console.log(`  - Should show: "No institutions will get access to this template"`)
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

// Run the check
checkCurrentAssignments()
