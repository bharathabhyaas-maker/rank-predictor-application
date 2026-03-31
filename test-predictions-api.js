// Test script to check the predictions API
const testPredictionsAPI = async () => {
  try {
    console.log('Testing /api/predictions endpoint...')
    
    // Test without parameters
    console.log('\n1. Testing without parameters:')
    const response1 = await fetch('http://localhost:3000/api/predictions')
    console.log('Status:', response1.status)
    if (!response1.ok) {
      const error = await response1.text()
      console.log('Error:', error)
    } else {
      const data = await response1.json()
      console.log('Success, found', data.length, 'predictions')
    }
    
    // Test with examId parameter
    console.log('\n2. Testing with examId=jee-main-2026:')
    const response2 = await fetch('http://localhost:3000/api/predictions?examId=jee-main-2026')
    console.log('Status:', response2.status)
    if (!response2.ok) {
      const error = await response2.text()
      console.log('Error:', error)
    } else {
      const data = await response2.json()
      console.log('Success, found', data.length, 'predictions')
    }
    
  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

// Run the test
testPredictionsAPI()
