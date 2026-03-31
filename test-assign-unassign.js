// Test complete assign/unassign functionality
const testAssignUnassign = async () => {
  try {
    console.log('🧪 Testing assign/unassign functionality...')
    
    const institutionId = 'cmmu45bd200007klhs7q4n8jd' // Anwar Institute
    const templateId = 'cmmu4rd0h0000gclh0gs70wx6' // CLAT 2025
    
    console.log('\n📋 Using test data:')
    console.log('  Institution ID:', institutionId)
    console.log('  Template ID:', templateId)
    
    // Step 1: Test Assignment
    console.log('\n🔗 Step 1: Testing assignment...')
    const assignResponse = await fetch('http://localhost:3000/api/institution-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        institutionId: institutionId,
        templateId: templateId
      })
    })
    
    const assignResult = await assignResponse.json()
    
    if (assignResponse.ok) {
      console.log('✅ Assignment successful!')
      console.log('📋 Assignment result:', assignResult)
    } else {
      console.error('❌ Assignment failed:', assignResponse.status)
      console.error('📋 Error details:', assignResult)
    }
    
    // Step 2: Verify Assignment
    console.log('\n🔍 Step 2: Verifying assignment...')
    const verifyResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${institutionId}`)
    
    if (verifyResponse.ok) {
      const assignments = await verifyResponse.json()
      const newAssignment = assignments.find(a => a.templateId === templateId)
      
      if (newAssignment) {
        console.log('✅ Assignment verified in list!')
        console.log('📋 Assignment status:', newAssignment.assignedAt ? 'Assigned' : 'Not assigned')
      } else {
        console.log('❌ Assignment not found in list!')
      }
    } else {
      console.error('❌ Failed to verify assignment')
    }
    
    // Step 3: Test Unassignment
    console.log('\n🗑️ Step 3: Testing unassignment...')
    const unassignResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${institutionId}&templateId=${templateId}`, {
      method: 'DELETE'
    })
    
    const unassignResult = await unassignResponse.json()
    
    if (unassignResponse.ok) {
      console.log('✅ Unassignment successful!')
      console.log('📋 Unassignment result:', unassignResult)
    } else {
      console.error('❌ Unassignment failed:', unassignResponse.status)
      console.error('📋 Error details:', unassignResult)
    }
    
    // Step 4: Final Verification
    console.log('\n🔍 Step 4: Final verification...')
    const finalResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${institutionId}`)
    
    if (finalResponse.ok) {
      const finalAssignments = await finalResponse.json()
      const removedAssignment = finalAssignments.find(a => a.templateId === templateId)
      
      if (removedAssignment) {
        console.log('❌ ERROR: Assignment still exists after unassignment!')
      } else {
        console.log('✅ SUCCESS: Assignment properly removed!')
        console.log(`📊 Final assignment count: ${finalAssignments.length}`)
      }
    } else {
      console.error('❌ Failed final verification')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the complete test
testAssignUnassign()
