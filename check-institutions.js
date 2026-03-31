// Check what institutions exist
const checkInstitutions = async () => {
  try {
    console.log('🔍 Checking available institutions...')
    
    const response = await fetch('http://localhost:3000/api/institutions')
    
    if (!response.ok) {
      console.error('❌ Failed to get institutions:', response.statusText)
      return
    }
    
    const institutions = await response.json()
    console.log(`Found ${institutions.length} institutions:`)
    
    institutions.forEach((inst, index) => {
      console.log(`  ${index + 1}. ${inst.name} (ID: ${inst.id})`)
    })
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

// Run the check
checkInstitutions()
