// Test template unassign functionality
const testUnassignTemplate = async () => {
  try {
    console.log('🧪 Testing template unassign API...')
    
    // First, get all institution-template assignments
    console.log('\n📋 Getting current assignments...')
    const assignmentsResponse = await fetch('http://localhost:3000/api/institution-templates?institutionId=cmmu45bd200007klhs7q4n8jd')
    
    if (!assignmentsResponse.ok) {
      console.error('❌ Failed to get assignments:', assignmentsResponse.statusText)
      return
    }
    
    const assignments = await assignmentsResponse.json()
    console.log(`Found ${assignments.length} assignments`)
    
    if (assignments.length === 0) {
      console.log('📭 No assignments to test with')
      return
    }
    
    // Find an assignment to remove
    const assignmentToRemove = assignments[0]
    
    console.log(`\n🎯 Attempting to remove assignment: ${assignmentToRemove.name} from institution`)
    console.log('📊 Assignment details:', {
      institutionId: 'cmmu45bd200007klhs7q4n8jd',
      templateId: assignmentToRemove.id,
      templateName: assignmentToRemove.name,
      status: assignmentToRemove.status
    })
    
    // Test DELETE request with URL parameters
    const deleteResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=cmmu45bd200007klhs7q4n8jd&templateId=${assignmentToRemove.id}`, {
      method: 'DELETE'
    })
    
    const deleteResult = await deleteResponse.json()
    
    if (deleteResponse.ok) {
      console.log('✅ Template unassigned successfully!')
      console.log('📋 Delete result:', deleteResult)
    } else {
      console.error('❌ Template unassignment failed:', deleteResponse.status)
      console.error('📋 Error details:', deleteResult)
    }
    
    // Verify unassignment by listing assignments again
    console.log('\n🔍 Verifying unassignment...')
    const verifyResponse = await fetch('http://localhost:3000/api/institution-templates?institutionId=default')
    const remainingAssignments = await verifyResponse.json()
    
    const removedAssignment = remainingAssignments.find(a => a.id === assignmentToRemove.id)
    
    if (removedAssignment) {
      console.log('❌ Assignment still exists after unassignment!')
    } else {
      console.log('✅ Assignment successfully removed from list')
      console.log(`📊 Assignment count: ${assignments.length} → ${remainingAssignments.length}`)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testUnassignTemplate()
