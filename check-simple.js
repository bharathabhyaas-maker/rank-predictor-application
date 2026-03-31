// Simple check for template types and conditions
// Run this with: node check-simple.js

console.log('🔍 Checking template configuration...\n');

// Check what's in the templates API
fetch('http://localhost:3000/api/templates')
  .then(response => response.json())
  .then(templates => {
    console.log(`Found ${templates.length} templates:\n`);
    
    templates.forEach(template => {
      console.log(`📋 ${template.name} (${template.examCode})`);
      console.log(`   Type: "${template.type}"`);
      console.log(`   Has Conditions: ${template.hasConditions || 'Unknown'}`);
      console.log('');
    });
    
    // Check specific exam codes
    const targetExams = ['CLAT-2025', 'JEE-MAIN-2025', 'NEET-2025'];
    console.log('🎯 Target Exam Analysis:\n');
    
    targetExams.forEach(examCode => {
      const template = templates.find(t => t.examCode === examCode);
      if (template) {
        console.log(`${examCode}:`);
        console.log(`  ✅ Template exists`);
        console.log(`  📝 Type: "${template.type}"`);
        console.log(`  📋 Has Conditions: ${template.hasConditions}`);
        console.log(`  🎯 Should use: ${template.type === 'conditional' || template.hasConditions ? 'CONDITIONAL' : 'FALLBACK'}`);
      } else {
        console.log(`${examCode}: ❌ Template not found`);
      }
      console.log('');
    });
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
