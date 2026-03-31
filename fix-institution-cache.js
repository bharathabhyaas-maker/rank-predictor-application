// Fix institution cache issue by checking current institutions
const fixInstitutionCache = async () => {
  try {
    console.log('🔧 Fixing institution cache issue...')
    
    // Get all current institutions from database
    const institutionsResponse = await fetch('http://localhost:3000/api/institutions')
    
    if (!institutionsResponse.ok) {
      console.error('❌ Failed to get institutions')
      return
    }
    
    const institutions = await institutionsResponse.json()
    console.log(`✅ Found ${institutions.length} current institutions:`)
    
    institutions.forEach((institution, index) => {
      console.log(`  ${index + 1}. ${institution.name} (${institution.id})`)
    })
    
    // Check which old institution IDs are causing issues
    const oldInstitutionIds = [
      'cmmk5bcww0006lglhjpl3h3gv', // This one doesn't exist
      'cmmu45bd200007klhs7q4n8jd', // Check if this exists
      'cmmj8yayt0000lglh8lvjfg7a', // Check if this exists
      'cmmj4w3y30000e8lhfe3figk1'  // Check if this exists
    ]
    
    console.log('\n🔍 Checking old institution IDs:')
    oldInstitutionIds.forEach((oldId, index) => {
      const exists = institutions.some(inst => inst.id === oldId)
      console.log(`  ${index + 1}. ${oldId} - ${exists ? '✅ EXISTS' : '❌ NOT FOUND'}`)
    })
    
    // Find valid institution IDs
    const validInstitutionIds = institutions.map(inst => inst.id)
    console.log('\n✅ Valid institution IDs:', validInstitutionIds)
    
    // Show what frontend should use
    console.log('\n💡 SOLUTION:')
    console.log('1. Frontend should use these valid institution IDs')
    console.log('2. Clear browser cache and refresh institution templates page')
    console.log('3. Select institutions using the valid IDs')
    console.log('4. Then try unassigning templates again')
    
  } catch (error) {
    console.error('❌ Fix failed:', error)
  }
}

// Run the fix
fixInstitutionCache()
