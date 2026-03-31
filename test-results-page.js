// Test script to check the results page
const testResultsPage = async () => {
  try {
    console.log('Testing /results/jee-main-2026 page...')
    
    const response = await fetch('http://localhost:3000/results/jee-main-2026')
    console.log('Status:', response.status)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const error = await response.text()
      console.log('Error response:', error)
    } else {
      console.log('Page loaded successfully')
      const html = await response.text()
      console.log('Page length:', html.length)
    }
    
  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

// Run the test
testResultsPage()
