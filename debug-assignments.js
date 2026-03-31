// Debug the assignments API response
const debugAssignments = async () => {
  try {
    console.log('🔍 Debugging assignments API...')
    
    const response = await fetch('http://localhost:3000/api/institution-templates?institutionId=cmmu45bd200007klhs7q4n8jd')
    
    if (!response.ok) {
      console.error('❌ Failed to get assignments:', response.statusText)
      return
    }
    
    const assignments = await response.json()
    console.log('📊 Raw API response:', JSON.stringify(assignments, null, 2))
    
    if (assignments.length > 0) {
      console.log('📋 First assignment details:')
      console.log(JSON.stringify(assignments[0], null, 2))
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

// Run the debug
debugAssignments()
