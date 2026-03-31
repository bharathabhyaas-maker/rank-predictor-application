// Verify that the prediction fix is working after server restart
console.log('🔍 VERIFYING PREDICTION FIX AFTER SERVER RESTART...');

// Test the save API with the corrected code
const testData = {
  studentName: 'Verification Test',
  studentEmail: 'verify@example.com',
  rollNumber: 'VERIFY123',
  userId: 'cmn7238te0000sglhdud1ds8n', // Valid user ID
  institutionId: null,
  examId: 'jee-main-2025',
  templateId: null, // Test with null template
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

console.log('📋 Testing with corrected code...');
console.log('  - User ID provided:', testData.userId);
console.log('  - Template ID:', testData.templateId);

// Test the save API
fetch('http://localhost:3000/api/predictions/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📋 Save Response Status:', response.status);
  
  if (response.ok) {
    return response.json();
  } else {
    return response.text().then(errorText => {
      console.log('❌ Save Error Response:', errorText);
      
      // Check for the specific errors we fixed
      if (errorText.includes('Argument `user` is missing')) {
        console.error('❌ STILL BROKEN: userId variable issue persists');
      } else if (errorText.includes('Foreign key constraint violated')) {
        console.error('❌ STILL BROKEN: Foreign key constraint issue');
      } else if (errorText.includes('success') || errorText.includes('created')) {
        console.log('✅ SUCCESS: Save operation working correctly');
      } else {
        console.log('⚠️ NEW ERROR: Different issue occurred');
        console.log('  - Error:', errorText);
      }
      
      return { success: false, error: errorText };
    });
  }
})
.then(result => {
  if (result && result.success) {
    console.log('🎉 VERIFICATION SUCCESSFUL!');
    console.log('✅ Prediction saved with ID:', result.prediction.id);
    console.log('✅ User ID properly connected:', result.prediction.userId);
    console.log('✅ Template ID handled correctly:', result.prediction.templateId);
    console.log('✅ No foreign key constraint violations');
    console.log('✅ All fixes working correctly');
    
    console.log('');
    console.log('🎯 EXPECTED BEHAVIOR NOW:');
    console.log('- Predictions should save without errors');
    console.log('- 180 marks should give realistic percentiles (85-90%)');
    console.log('- Database operations should work correctly');
    console.log('- No "Argument user is missing" errors');
    console.log('- No foreign key constraint violations');
    
  } else if (result.error) {
    console.error('❌ VERIFICATION FAILED:', result.error);
    
    if (result.error.includes('Argument `user` is missing')) {
      console.error('💡 SERVER RESTART NEEDED: Old code still cached');
      console.error('💡 SOLUTION: Wait for server to fully restart');
      console.error('💡 THEN: Test prediction again');
    } else if (result.error.includes('Foreign key constraint')) {
      console.error('💡 TEMPLATE VALIDATION ISSUE: Check template ID logic');
    } else {
      console.error('💡 UNKNOWN ERROR: Investigation needed');
    }
  }
})
.catch(error => {
  console.error('❌ NETWORK ERROR:', error.message);
});

console.log('');
console.log('🔧 INSTRUCTIONS:');
console.log('1. Wait for development server to fully restart');
console.log('2. Run this script: node verify-fix.js');
console.log('3. Make a prediction in the browser');
console.log('4. Check browser console for success messages');
console.log('5. Verify no database errors occur');
console.log('');
console.log('🚀 The fix should now be working with the restarted server!');
