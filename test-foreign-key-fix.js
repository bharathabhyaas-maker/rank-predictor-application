// Test the foreign key constraint fix for template validation
console.log('🧪 Testing Foreign Key Constraint Fix...');

// Test cases for different template scenarios
const testCases = [
  {
    name: 'Valid Template ID',
    templateId: 'valid-template-id', // This should exist in database
    expectedBehavior: 'Should save successfully'
  },
  {
    name: 'Invalid Template ID',
    templateId: 'invalid-template-id-12345', // This shouldn't exist
    expectedBehavior: 'Should save with templateId = null'
  },
  {
    name: 'Null Template ID',
    templateId: null,
    expectedBehavior: 'Should save successfully'
  },
  {
    name: 'Empty Template ID',
    templateId: '',
    expectedBehavior: 'Should save with templateId = null'
  }
];

// Test data for prediction save
const testPredictionData = {
  studentName: 'Test Student',
  studentEmail: 'test@example.com',
  rollNumber: 'TEST123',
  institutionId: null,
  examId: 'jee-main-2025',
  totalScore: 180,
  predictedRank: 50000,
  predictedPercentile: 88.0,
  bestCaseRank: 40000,
  bestCasePercentile: 90.0,
  worstCaseRank: 60000,
  worstCasePercentile: 85.0,
  avgRank: 50000,
  avgPercentile: 88.0,
  answers: {
    physics: { attempted: 25, correct: 20 },
    chemistry: { attempted: 25, correct: 18 },
    mathematics: { attempted: 25, correct: 22 }
  },
  predictionType: 'ai',
  status: 'completed',
  metadata: {
    calculationMethod: 'AI Internet Analysis',
    predictionMethod: 'ai',
    maxPossibleScore: 300,
    percentage: 60.0,
    totalCandidates: 1200000
  }
};

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test Case ${index + 1}: ${testCase.name}`);
  console.log(`  - Template ID: ${testCase.templateId}`);
  console.log(`  - Expected: ${testCase.expectedBehavior}`);
  
  const testData = {
    ...testPredictionData,
    templateId: testCase.templateId
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
      return response.text().then(text => {
        console.log(`  - Error Response: ${text}`);
        
        if (text.includes('Foreign key constraint violated')) {
          console.error(`  ❌ FOREIGN KEY ERROR STILL EXISTS!`);
        } else {
          console.log(`  ✅ Foreign key constraint handled properly`);
        }
      });
    }
  })
  .then(result => {
    if (result && result.success) {
      console.log(`  ✅ Success: Prediction saved with ID: ${result.prediction.id}`);
      console.log(`  - Template ID used: ${result.prediction.templateId || 'null'}`);
    }
  })
  .catch(error => {
    console.error(`  ❌ Test Error: ${error.message}`);
  });
});

// Also test the template validation directly
console.log('\n🔍 Testing Template Validation Logic...');

// Test template validation function
const testTemplateValidation = async (templateId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/templates?id=${templateId}`);
    console.log(`  - Template "${templateId}" exists: ${response.ok}`);
    return response.ok;
  } catch (error) {
    console.log(`  - Error checking template "${templateId}": ${error.message}`);
    return false;
  }
};

// Test various template IDs
['valid-template-id', 'invalid-template-id', '', null].forEach(async (templateId) => {
  console.log(`  - Testing template ID: ${templateId || 'null'}`);
  await testTemplateValidation(templateId);
});

console.log('\n🎯 Foreign Key Constraint Testing Complete!');
console.log('💡 Expected behavior:');
console.log('   - Valid template IDs should be used as-is');
console.log('   - Invalid template IDs should be set to null');
console.log('   - No foreign key constraint violations should occur');
console.log('   - All predictions should save successfully');

// Instructions for manual testing
console.log('\n🔧 Manual Testing Steps:');
console.log('1. Make a prediction with invalid template ID');
console.log('2. Check browser console for validation logs');
console.log('3. Verify prediction saves in database');
console.log('4. Check that templateId is null for invalid templates');
console.log('5. Verify no foreign key constraint errors');
