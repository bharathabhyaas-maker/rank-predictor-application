// Test to verify the cache clear and template fix is working
console.log('🧪 TESTING CACHE CLEAR & TEMPLATE FIX...');

const testData = {
  studentName: 'Cache Clear Test',
  studentEmail: 'cache@test.com',
  rollNumber: 'CACHE123',
  userId: 'cmn31nakk000320lhbp2rgtgz',
  institutionId: 'cmn31nak4000220lhq6wju9jw',
  examId: 'jee-main-2025',
  templateId: null, // This should work now with the fix
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

console.log('📋 Test Data:');
console.log('  - Template ID:', testData.templateId);
console.log('  - Expected: Should save without "Argument template is missing" error');

// Test the save API
fetch('http://localhost:3000/api/predictions/save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📋 Response Status:', response.status);
  
  if (response.ok) {
    return response.json();
  } else {
    return response.text().then(errorText => {
      console.log('❌ Error Response:', errorText);
      
      if (errorText.includes('Argument `template` is missing')) {
        console.error('❌ CACHE CLEAR FAILED: Still using old code');
      } else if (errorText.includes('success') || errorText.includes('created')) {
        console.log('✅ CACHE CLEAR SUCCESS: Fix is working!');
      } else {
        console.log('⚠️ Different error:', errorText);
      }
      
      return { success: false, error: errorText };
    });
  }
})
.then(result => {
  if (result && result.success) {
    console.log('🎉 SUCCESS! Template fix is working after cache clear!');
    console.log('✅ Prediction saved with ID:', result.prediction.id);
    console.log('✅ Template ID:', result.prediction.templateId || 'null (correct)');
    console.log('✅ User ID:', result.prediction.userId);
    console.log('✅ No template relation errors!');
  } else if (result.error) {
    console.error('❌ Test failed:', result.error);
  }
})
.catch(error => {
  console.error('❌ Network error:', error.message);
});

console.log('\n🎯 EXPECTED RESULT:');
console.log('✅ No "Argument template is missing" error');
console.log('✅ Prediction saves successfully');
console.log('✅ Template relation handled correctly');
console.log('');
console.log('💡 If this test passes, the cache clear worked and the fix is active!');
