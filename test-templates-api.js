// Test the templates API to see if types are showing correctly
const testTemplatesAPI = async () => {
  try {
    console.log('🧪 Testing templates API...')
    
    const response = await fetch('http://localhost:3000/api/templates')
    
    if (response.ok) {
      const templates = await response.json()
      console.log('✅ Templates API response:')
      
      templates.forEach(template => {
        console.log(`\n📋 ${template.name}`)
        console.log(`   Exam Code: ${template.examCode}`)
        console.log(`   Type: ${template.type}`)
        console.log(`   Status: ${template.status}`)
        console.log(`   Predictions: ${template.predictions}`)
        console.log(`   Has Conditions: ${template.hasConditions}`)
      })
      
      // Check specifically for CLAT-2025
      const clatTemplate = templates.find(t => t.examCode === 'CLAT-2025')
      if (clatTemplate) {
        console.log(`\n🎯 CLAT-2025 Template Details:`)
        console.log(`   Type: ${clatTemplate.type} (should be 'conditional')`)
        console.log(`   Has Conditions: ${clatTemplate.hasConditions}`)
      }
      
    } else {
      console.error('❌ Templates API failed:', response.status, response.statusText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testTemplatesAPI()
