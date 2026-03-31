// Test multi-institution unassign functionality
const testMultiUnassign = async () => {
  try {
    console.log('🧪 Testing multi-institution unassign...')
    
    // Template to test (use one that exists)
    const templateId = 'cmmu4rd0h0000gclh0gs70wx6' // CLAT 2025
    const templateName = 'CLAT 2025'
    
    // Institutions to unassign from
    const institutionIds = [
      'cmmu45bd200007klhs7q4n8jd', // Anwar Institute
      'cmmk5bcww0006lglhjpl3h3gv', // Anwar Instituiton
      'cmmj8yayt0000lglh8lvjfg7a', // Gyanville Academy
      'cmmj4w3y30000e8lhfe3figk1'  // Test Institution API
    ]
    
    console.log(`🔍 Testing unassign of ${templateName} from ${institutionIds.length} institutions`)
    
    let successCount = 0
    let failCount = 0
    
    for (const institutionId of institutionIds) {
      console.log(`\n🗑️ Unassigning from institution: ${institutionId}`)
      
      const response = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${institutionId}&templateId=${templateId}`, {
        method: 'DELETE'
      })
      
      const responseText = await response.text()
      console.log(`📊 Response status: ${response.status}`)
      console.log(`📊 Response: ${responseText}`)
      
      if (response.ok) {
        try {
          const result = JSON.parse(responseText)
          console.log(`✅ Success: ${result.message}`)
          successCount++
        } catch (e) {
          console.log(`✅ Success (parsing failed): ${responseText}`)
          successCount++
        }
      } else {
        console.error(`❌ Failed: ${responseText}`)
        failCount++
      }
    }
    
    console.log(`\n📊 Results:`)
    console.log(`✅ Successful unassignments: ${successCount}`)
    console.log(`❌ Failed unassignments: ${failCount}`)
    
    if (successCount > 0) {
      console.log(`\n🎯 Unassign successful! Template should now be removed from ${successCount} institution(s)`)
    } else {
      console.log(`\n⚠️ All unassignments failed. Check server logs for details.`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testMultiUnassign()
