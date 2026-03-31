// Test student links page functionality
const testStudentLinks = async () => {
  try {
    console.log('🧪 Testing student links page...')
    
    // First, let's check if we have any institutions
    const institutionsResponse = await fetch('http://localhost:3000/api/institutions')
    
    if (!institutionsResponse.ok) {
      console.error('❌ Failed to get institutions')
      return
    }
    
    const institutions = await institutionsResponse.json()
    console.log(`✅ Found ${institutions.length} institutions`)
    
    if (institutions.length === 0) {
      console.log('⚠️ No institutions found - need to create institutions first')
      console.log('💡 Run: node recreate-institutions.js')
      return
    }
    
    // Test with first institution
    const testInstitution = institutions[0]
    console.log(`\n🔍 Testing with institution: ${testInstitution.name} (${testInstitution.id})`)
    
    // Test student links API call
    const templatesResponse = await fetch(`http://localhost:3000/api/institution-templates?institutionId=${testInstitution.id}`)
    
    console.log('📊 Templates response status:', templatesResponse.status)
    
    if (templatesResponse.ok) {
      const templates = await templatesResponse.json()
      console.log(`✅ Successfully fetched ${templates.length} templates`)
      
      if (templates.length > 0) {
        console.log('📋 Available templates:')
        templates.forEach((template, index) => {
          console.log(`  ${index + 1}. ${template.name} (${template.type})`)
        })
      } else {
        console.log('ℹ️ No templates assigned to this institution')
      }
      
      console.log('\n✅ Student links page should work correctly now!')
      console.log('💡 Go to /institution/links to test in browser')
      
    } else {
      const errorText = await templatesResponse.text()
      console.error('❌ Failed to fetch templates:', errorText)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Run the test
testStudentLinks()
