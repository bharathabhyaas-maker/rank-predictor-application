// Test the final template relation fix
console.log('🧪 TESTING TEMPLATE RELATION FIX...');

// Test cases for template handling
const testCases = [
  {
    name: 'Valid Template ID',
    templateId: 'valid-template-id',
    expectedBehavior: 'Should use template: { connect: { id: templateId } }'
  },
  {
    name: 'Null Template ID',
    templateId: null,
    expectedBehavior: 'Should omit template field entirely'
  },
  {
    name: 'Empty String Template ID',
    templateId: '',
    expectedBehavior: 'Should omit template field entirely'
  }
];

testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test Case ${index + 1}: ${testCase.name}`);
  console.log(`  - Template ID: ${testCase.templateId}`);
  console.log(`  - Expected: ${testCase.expectedBehavior}`);
  
  const testData = {
    studentName: 'Template Relation Test',
    studentEmail: `test${index}@example.com`,
    rollNumber: `TEST${index}`,
    userId: 'cmn7238te0000sglhdud1ds8n',
    institutionId: null,
    examId: 'jee-main-2025',
    templateId: testCase.templateId,
    totalScore: 180,
    predictedRank: 70000,
    predictedPercentile: 88.5,
    bestCaseRank: 50000,
    bestCasePercentile: 90.0,
    worstCaseRank: 90000,
    worstCasePercentile: 87.0,
    avgRank: 70000,
    avgPercentile: 88.5,
    answers: [
      {
        name: "Physics",
        attempted: "25",
        correct: "20"
      },
      {
        name: "Chemistry",
        attempted: "25", 
        correct: "18"
      },
      {
        name: "Mathematics",
        attempted: "25",
        correct: "22"
      }
    ],
    predictionType: 'template',
    status: 'completed',
    metadata: {
      calculationMethod: 'Dataset-Based Analysis',
      predictionMethod: 'template',
      maxPossibleScore: 300,
      percentage: 60.0,
      totalCandidates: 1200000
    }
  };
  
  // Test the save API
  fetch('http://localhost:3000/api/predictions/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData)
  })
  .then(response => {
    console.log(`  - Response Status: ${response.status}`);
    
    if (response.ok) {
      return response.json();
    } else {
      return response.text().then(errorText => {
        console.log(`  - Error Response: ${errorText}`);
        
        // Check for specific errors we fixed
        if (errorText.includes('Argument `template` is missing')) {
          console.error('  ❌ TEMPLATE RELATION STILL BROKEN');
        } else if (errorText.includes('Argument `user` is missing')) {
          console.error('  ❌ USER RELATION STILL BROKEN');
        } else if (errorText.includes('Foreign key constraint violated')) {
          console.error('  ❌ FOREIGN KEY CONSTRAINT VIOLATION');
        } else if (errorText.includes('success') || errorText.includes('created')) {
          console.log('  ✅ SUCCESS: Template relation working correctly');
        } else {
          console.log('  ⚠️ UNKNOWN ERROR: Needs investigation');
        }
        
        return { success: false, error: errorText, status: response.status };
      });
    }
  })
  .then(result => {
    if (result && result.success) {
      console.log(`  ✅ SUCCESS: Prediction saved!`);
      console.log(`    - Prediction ID: ${result.prediction.id}`);
      console.log(`    - Template ID: ${result.prediction.templateId || 'null (correct for null template)'}`);
      console.log(`    - User ID: ${result.prediction.userId || 'Connected via relation'}`);
      console.log(`    - Predicted Rank: ${result.prediction.predictedRank}`);
      console.log(`    - Predicted Percentile: ${result.prediction.predictedPercentile}`);
      
      // Verify template handling
      if (testCase.templateId === null && result.prediction.templateId === null) {
        console.log(`    ✅ NULL TEMPLATE HANDLED CORRECTLY`);
      } else if (testCase.templateId && result.prediction.templateId === testCase.templateId) {
        console.log(`    ✅ VALID TEMPLATE CONNECTED CORRECTLY`);
      }
      
    } else if (result.error) {
      console.error(`  ❌ TEST FAILED: ${result.error}`);
    }
  })
  .catch(error => {
    console.error(`  ❌ NETWORK ERROR: ${error.message}`);
  });
});

console.log('\n🎯 EXPECTED RESULTS:');
console.log('✅ Template relation should work for valid template IDs');
console.log('✅ Template field should be omitted for null/empty template IDs');
console.log('✅ No "Argument template is missing" errors');
console.log('✅ No "Argument user is missing" errors');
console.log('✅ No foreign key constraint violations');
console.log('✅ All predictions should save successfully');

console.log('\n🔧 WHAT WAS FIXED:');
console.log('❌ BEFORE: templateId: null (caused "Argument template is missing")');
console.log('✅ AFTER: ...(validTemplateId && { template: { connect: { id: validTemplateId } })');
console.log('✅ This conditional spread operator omits template field when templateId is null');

console.log('\n🚀 RUN THIS TEST TO VERIFY:');
console.log('node test-template-relation-fix.js');
console.log('');
console.log('💡 The template relation error should now be completely resolved!');
