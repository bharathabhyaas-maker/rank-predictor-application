// Test to check template types and debug prediction issues

async function checkTemplates() {
  try {
    console.log('🔍 Checking template configurations...\n');
    
    // Get all templates
    const response = await fetch('http://localhost:3000/api/templates');
    const templates = await response.json();
    
    console.log(`📋 Found ${templates.length} templates:\n`);
    
    templates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name}`);
      console.log(`   Type: ${template.type}`);
      console.log(`   Exam Code: ${template.examCode}`);
      console.log(`   AI Source: ${template.placeholders?.aiSource || 'Not set'}`);
      console.log(`   Dataset ID: ${template.placeholders?.datasetId || 'Not set'}`);
      console.log(`   Has Conditions: ${template.conditions ? 'Yes' : 'No'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error checking templates:', error);
  }
}

checkTemplates();
