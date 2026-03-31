// Debug template lookup issue
async function debugTemplateLookup() {
  try {
    console.log('🧪 Debugging template lookup issue...\n');
    
    // Test 1: Check available templates
    console.log('📋 Testing /api/templates endpoint...');
    const templatesResponse = await fetch('http://localhost:3000/api/templates');
    console.log('📊 Templates API Status:', templatesResponse.status);
    
    if (templatesResponse.ok) {
      const templates = await templatesResponse.json();
      console.log('📊 Available templates:', templates.length);
      console.log('📊 Templates list:');
      templates.forEach((t, i) => {
        console.log(`  ${i + 1}. ID: ${t.id}`);
        console.log(`     Name: ${t.name}`);
        console.log(`     ExamCode: ${t.examCode}`);
        console.log(`     Type: ${t.type}`);
        console.log('');
      });
      
      // Test 2: Check specific exam codes
      const testExamCodes = ['JEE-MAIN-2027', 'JEE-main-2025', 'jee-main-2027'];
      
      for (const examCode of testExamCodes) {
        console.log(`🔍 Testing examCode: ${examCode}`);
        const searchResponse = await fetch(`http://localhost:3000/api/templates?examCode=${examCode}`);
        console.log(`📊 Search status for ${examCode}:`, searchResponse.status);
        
        if (searchResponse.ok) {
          const searchTemplates = await searchResponse.json();
          const found = searchTemplates.find(t => t.examCode.toLowerCase() === examCode.toLowerCase());
          console.log(`📊 Found template:`, found ? { id: found.id, name: found.name, examCode: found.examCode } : 'Not found');
        } else {
          console.log(`❌ Search failed for ${examCode}:`, await searchResponse.text());
        }
        console.log('');
      }
      
    } else {
      console.log('❌ Failed to fetch templates:', await templatesResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugTemplateLookup();
