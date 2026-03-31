// Test to check template matching and prediction flow
async function testPredictionFlow() {
  try {
    console.log('🧪 Testing prediction flow...\n');
    
    // Test 1: Check JEE-MAIN-2027 (AI template)
    console.log('📋 Test 1: JEE-MAIN-2027 (AI Template)');
    const response1 = await fetch('http://localhost:3000/api/templates?examCode=JEE-MAIN-2027');
    const templates1 = await response1.json();
    const template1 = templates1.find(t => t.examCode.toLowerCase() === 'JEE-MAIN-2027'.toLowerCase());
    
    console.log('  Found template:', !!template1);
    if (template1) {
      console.log('  Name:', template1.name);
      console.log('  Type:', template1.type);
      console.log('  AI Source:', template1.placeholders?.aiSource || 'Not set');
    } else {
      console.log('  ❌ Template not found - will use fallback (dataset)');
    }
    
    // Test 2: Check JEE-main-2025 (conditional template)
    console.log('\n📋 Test 2: JEE-main-2025 (Conditional Template)');
    const response2 = await fetch('http://localhost:3000/api/templates?examCode=JEE-main-2025');
    const templates2 = await response2.json();
    const template2 = templates2.find(t => t.examCode.toLowerCase() === 'JEE-main-2025'.toLowerCase());
    
    console.log('  Found template:', !!template2);
    if (template2) {
      console.log('  Name:', template2.name);
      console.log('  Type:', template2.type);
      console.log('  Has conditions:', template2.conditions ? 'Yes' : 'No');
    } else {
      console.log('  ❌ Template not found - will use fallback (dataset)');
    }
    
    // Test 3: Check exact case matching
    console.log('\n📋 Test 3: Case Sensitivity Check');
    console.log('  Available exam codes:');
    templates1.forEach(t => {
      console.log(`    "${t.examCode}" (type: ${t.type})`);
    });
    
    console.log('\n🔍 Prediction Flow Analysis:');
    console.log('  If template not found → fallback config → dataset prediction');
    console.log('  If template found but type wrong → wrong prediction method');
    console.log('  Need exact exam code match for correct template');
    
  } catch (error) {
    console.error('❌ Error testing prediction flow:', error);
  }
}

testPredictionFlow();
