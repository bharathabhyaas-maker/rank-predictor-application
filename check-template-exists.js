// Check if template still exists
const checkTemplateExists = async () => {
  try {
    console.log('🔍 Checking if template exists...')
    const templateId = 'cmmu45bdm00017klheqsa9qjj'
    
    // Method 1: Check by ID
    console.log('\n📋 Method 1: Check by ID...')
    const idResponse = await fetch(`http://localhost:3000/api/templates?id=${templateId}`)
    console.log('📊 ID Response status:', idResponse.status)
    
    if (idResponse.ok) {
      const templates = await idResponse.json()
      const template = templates.find(t => t.id === templateId)
      if (template) {
        console.log('✅ Template found by ID:', template.name)
      } else {
        console.log('❌ Template not found in list')
      }
    } else {
      console.log('❌ Failed to get templates by ID')
    }
    
    // Method 2: Check all templates
    console.log('\n📋 Method 2: Check all templates...')
    const allResponse = await fetch('http://localhost:3000/api/templates')
    
    if (allResponse.ok) {
      const allTemplates = await allResponse.json()
      console.log(`📊 Total templates: ${allTemplates.length}`)
      
      const ourTemplate = allTemplates.find(t => t.id === templateId)
      if (ourTemplate) {
        console.log('✅ Template found in all templates:', ourTemplate.name)
        console.log('📊 Template status:', ourTemplate.status)
        console.log('📊 Assigned institutions:', ourTemplate.assignedTo?.length || 0)
      } else {
        console.log('❌ Template not found in all templates list')
        console.log('📊 Template may have been deleted during unassignment')
      }
      
      // Show similar templates
      const similarTemplates = allTemplates.filter(t => 
        t.name.toLowerCase().includes('jee advanced') || 
        t.examCode.toLowerCase().includes('jee')
      )
      
      if (similarTemplates.length > 0) {
        console.log('\n📋 Similar templates found:')
        similarTemplates.forEach((t, i) => {
          console.log(`  ${i + 1}. ${t.name} (${t.examCode}) - ID: ${t.id}`)
        })
      }
    } else {
      console.log('❌ Failed to get all templates')
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

// Run the check
checkTemplateExists()
