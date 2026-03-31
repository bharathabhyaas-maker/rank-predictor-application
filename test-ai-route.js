// Test AI prediction specifically
console.log('🧪 TESTING AI PREDICTION ROUTE...');

const testData = {
  studentName: 'AI Prediction Test',
  studentEmail: 'ai@test.com',
  rollNumber: 'AI123',
  institutionId: null,
  examId: 'jee-main-2025',
  templateId: null, // This should trigger AI prediction
  totalScore: 180, // Realistic score
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
  aiSource: 'internet' // Force AI to use internet
};

console.log('📋 AI Test Data:');
console.log('  - Score:', testData.totalScore);
console.log('  - AI Source:', testData.aiSource);
console.log('  - Template ID:', testData.templateId);

// Test the AI prediction route specifically
fetch('http://localhost:3000/api/predictions/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📋 AI Route Response Status:', response.status);
  
  if (response.ok) {
    return response.json();
  } else {
    return response.text().then(errorText => {
      console.log('❌ AI Route Error Response:', errorText);
      
      if (errorText.includes('percentile: 88.5')) {
        console.log('✅ SUCCESS: Enhanced AI prediction working!');
        console.log('✅ Realistic percentile for 180 marks');
      } else if (errorText.includes('percentile: 50')) {
        console.log('❌ FAILED: Still using generic fallback');
      } else {
        console.log('⚠️ Different error:', errorText);
      }
      
      return { success: false, error: errorText };
    });
  })
.catch(error => {
  console.error('❌ Network error:', error.message);
});

console.log('\n🎯 EXPECTED RESULT:');
console.log('✅ 180 marks should give ~88-90% percentile');
console.log('✅ Should use real-time internet data');
console.log('✅ Should not use generic 50% percentile');
console.log('');
console.log('💡 This test specifically calls the AI route, not the template route');
