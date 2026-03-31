// Test Prisma relation fix for user field
console.log('🧪 Testing Prisma Relation Fix...');

// Test prediction save with correct user relation syntax
const testPredictionData = {
  studentName: 'Test Student',
  studentEmail: 'test@example.com',
  rollNumber: 'TEST123',
  institutionId: null,
  examId: 'jee-main-2025',
  templateId: null, // Test with null templateId
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
    totalCandidates: 1200000,
    templateConfig: {
      id: 'jee-main-2025',
      name: 'JEE MAIN 2025',
      type: 'dataset',
      description: 'Fallback configuration',
      promptTemplate: '',
      placeholders: {},
      subjects: [
        { name: 'Physics', totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 },
        { name: 'Chemistry', totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 },
        { name: 'Mathematics', totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 }
      ],
      requireHallTicket: true,
      askExpectedScore: true,
      collectCity: true
    },
    examConditions: null
  }
};

console.log('📋 Test Data:');
console.log('  - Student Name:', testPredictionData.studentName);
console.log('  - Student Email:', testPredictionData.studentEmail);
console.log('  - Exam ID:', testPredictionData.examId);
console.log('  - Template ID:', testPredictionData.templateId);
console.log('  - Predicted Rank:', testPredictionData.predictedRank);
console.log('  - Predicted Percentile:', testPredictionData.predictedPercentile);

// Test the save API
fetch('http://localhost:3000/api/predictions/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPredictionData)
})
.then(response => {
  console.log('📋 Save API Response Status:', response.status);
  
  if (response.ok) {
    return response.json();
  } else {
    return response.text().then(text => {
      console.log('❌ Save API Error Response:', text);
      
      // Check for specific errors
      if (text.includes('Argument `user` is missing')) {
        console.error('❌ OLD ERROR: User relation still using userId field');
      } else if (text.includes('Foreign key constraint violated')) {
        console.error('❌ FOREIGN KEY ERROR: Template validation issue');
      } else if (text.includes('success') || text.includes('created')) {
        console.log('✅ SUCCESS: Prediction saved correctly');
      } else {
        console.log('⚠️ UNKNOWN ERROR: Need to investigate');
      }
      
      return { error: text, status: response.status };
    });
  }
})
.then(result => {
  if (result.success) {
    console.log('✅ PREDICTION SAVED SUCCESSFULLY!');
    console.log('  - Prediction ID:', result.prediction.id);
    console.log('  - Student Name:', result.prediction.studentName);
    console.log('  - Predicted Rank:', result.prediction.predictedRank);
    console.log('  - Predicted Percentile:', result.prediction.predictedPercentile);
    console.log('  - User ID:', result.prediction.userId || 'Connected via relation');
    console.log('  - Template ID:', result.prediction.templateId || 'null');
    console.log('  - Created At:', result.prediction.createdAt);
  } else if (result.error) {
    console.error('❌ SAVE FAILED:', result.error);
  }
})
.catch(error => {
  console.error('❌ NETWORK ERROR:', error.message);
});

// Test with invalid template ID to see validation
console.log('\n🔍 Testing Template Validation...');

const invalidTemplateTest = {
  ...testPredictionData,
  templateId: 'invalid-template-id-12345' // Should be set to null
};

setTimeout(() => {
  fetch('http://localhost:3000/api/predictions/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invalidTemplateTest)
  })
  .then(response => response.text())
  .then(text => {
    console.log('📋 Invalid Template Test Response:');
    if (text.includes('templateId: null')) {
      console.log('✅ TEMPLATE VALIDATION WORKING: Invalid template set to null');
    } else {
      console.log('❌ TEMPLATE VALIDATION ISSUE: Check validation logic');
    }
  });
}, 2000); // Wait 2 seconds before second test

console.log('\n🎯 Expected Results:');
console.log('1. First test should save successfully with user relation');
console.log('2. Second test should save with templateId = null');
console.log('3. No "Argument `user` is missing" errors');
console.log('4. No foreign key constraint violations');

console.log('\n💡 Manual Testing Checklist:');
console.log('✅ Check browser console for save API logs');
console.log('✅ Verify predictions appear in database');
console.log('✅ Test with various template IDs (valid, invalid, null)');
console.log('✅ Confirm user relation is working correctly');
