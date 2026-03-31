// Recreate the missing institutions
const recreateInstitutions = async () => {
  try {
    console.log('🔧 Recreating missing institutions...')
    
    const institutions = [
      {
        institutionId: 'cmmu45bd200007klhs7q4n8jd',
        name: 'Anwar Institute',
        email: 'anwar@institute.com',
        location: 'Hyderabad',
        plan: 'STANDARD'
      },
      {
        institutionId: 'cmmk5bcww0006lglhjpl3h3gv',
        name: 'Anwar Instituiton',
        email: 'anwar2@institute.com',
        location: 'Hyderabad',
        plan: 'STANDARD'
      },
      {
        institutionId: 'cmmj8yayt0000lglh8lvjfg7a',
        name: 'Gyanville Academy',
        email: 'gyanville@academy.com',
        location: 'Hyderabad',
        plan: 'STANDARD'
      },
      {
        institutionId: 'cmmj4w3y30000e8lhfe3figk1',
        name: 'Test Institution API',
        email: 'test@api.com',
        location: 'Test Location',
        plan: 'STANDARD'
      }
    ]
    
    console.log(`📝 Creating ${institutions.length} institutions...`)
    
    for (const institution of institutions) {
      console.log(`\n🏫 Creating: ${institution.name}`)
      
      const response = await fetch('http://localhost:3000/api/institutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institution)
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Created: ${institution.name} (${result.id})`)
      } else {
        const error = await response.text()
        console.error(`❌ Failed to create ${institution.name}:`, error)
      }
    }
    
    console.log('\n✅ Institution recreation completed!')
    console.log('💡 Now you can:')
    console.log('  1. Go to /institution/templates')
    console.log('  2. Select institutions')
    console.log('  3. Assign/unassign templates')
    
  } catch (error) {
    console.error('❌ Recreation failed:', error)
  }
}

// Run recreation
recreateInstitutions()
