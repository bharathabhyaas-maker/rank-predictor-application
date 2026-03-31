// Test Conditional Prediction System
// This demonstrates how your conditional prediction works with conditions from exam creation

const testConditionalPrediction = async () => {
  console.log('🧪 Testing Conditional Prediction System...\n');

  // Example: Conditions set in exam creation page for JEE exam
  console.log('📋 Example Conditions Set in Exam Creation:');
  console.log('==========================================');
  
  const exampleConditions = [
    {
      parameter: "Total Score",
      operator: "gte",
      value: "150",
      bestCasePercentile: "85",
      worstCasePercentile: "75", 
      bestCaseRank: "15000",
      worstCaseRank: "25000",
      avgRank: "20000",
      avgPercentile: "80"
    },
    {
      parameter: "Total Score",
      operator: "between",
      value: "100",
      operator2: "149",
      bestCasePercentile: "65",
      worstCasePercentile: "55",
      bestCaseRank: "35000", 
      worstCaseRank: "50000",
      avgRank: "42500",
      avgPercentile: "60"
    },
    {
      parameter: "Section Score - Maths",
      operator: "gte",
      value: "40",
      bestCasePercentile: "70",
      worstCasePercentile: "60",
      bestCaseRank: "30000",
      worstCaseRank: "45000", 
      avgRank: "37500",
      avgPercentile: "65"
    }
  ];

  console.log('Conditions:', JSON.stringify(exampleConditions, null, 2));
  console.log('');

  // Test 1: Student with high score matches first condition
  console.log('🎯 Test 1: High Score Student (180 marks)');
  console.log('===========================================');
  
  const highScoreStudent = {
    studentName: "Alice Johnson",
    studentEmail: "alice@example.com",
    institutionId: "inst-123",
    examId: "jee-main",
    totalScore: 180,
    englishScore: 45,
    reasoningScore: 50,
    legalScore: 0, // Not applicable for JEE
    gkScore: 0,    // Not applicable for JEE
    mathsScore: 85
  };

  console.log('Student Data:', JSON.stringify(highScoreStudent, null, 2));
  console.log('Expected: Matches "Total Score >= 150" condition');
  console.log('Predicted Rank: ~20,000 (80th percentile)');
  console.log('Prediction Range: 15,000 - 25,000\n');

  // Test 2: Student with medium score matches second condition
  console.log('🎯 Test 2: Medium Score Student (125 marks)');
  console.log('============================================');
  
  const mediumScoreStudent = {
    studentName: "Bob Smith",
    studentEmail: "bob@example.com", 
    institutionId: "inst-123",
    examId: "jee-main",
    totalScore: 125,
    englishScore: 35,
    reasoningScore: 40,
    legalScore: 0,
    gkScore: 0,
    mathsScore: 50
  };

  console.log('Student Data:', JSON.stringify(mediumScoreStudent, null, 2));
  console.log('Expected: Matches "Total Score between 100-149" condition');
  console.log('Predicted Rank: ~42,500 (60th percentile)');
  console.log('Prediction Range: 35,000 - 50,000\n');

  // Test 3: Student with low score (no conditions match)
  console.log('🎯 Test 3: Low Score Student (80 marks)');
  console.log('=======================================');
  
  const lowScoreStudent = {
    studentName: "Charlie Brown",
    studentEmail: "charlie@example.com",
    institutionId: "inst-123", 
    examId: "jee-main",
    totalScore: 80,
    englishScore: 25,
    reasoningScore: 30,
    legalScore: 0,
    gkScore: 0,
    mathsScore: 25
  };

  console.log('Student Data:', JSON.stringify(lowScoreStudent, null, 2));
  console.log('Expected: No conditions match - uses fallback calculation');
  console.log('Predicted Rank: Based on score/500 * 100 calculation');
  console.log('Fallback: (80/500) * 100 = 16th percentile, ~84,000 rank\n');

  // Test 4: Student with high maths score
  console.log('🎯 Test 4: High Maths Score Student');
  console.log('=================================');
  
  const highMathsStudent = {
    studentName: "Diana Prince",
    studentEmail: "diana@example.com",
    institutionId: "inst-123",
    examId: "jee-main", 
    totalScore: 110,
    englishScore: 30,
    reasoningScore: 35,
    legalScore: 0,
    gkScore: 0,
    mathsScore: 45
  };

  console.log('Student Data:', JSON.stringify(highMathsStudent, null, 2));
  console.log('Expected: Matches "Section Score - Maths >= 40" condition');
  console.log('Predicted Rank: ~37,500 (65th percentile)');
  console.log('Prediction Range: 30,000 - 45,000\n');

  console.log('🔄 How Conditional Prediction Works:');
  console.log('=====================================');
  console.log('1. User creates exam with conditions in exam creation page');
  console.log('2. Conditions are stored in template.placeholders');
  console.log('3. Student takes exam and submits scores');
  console.log('4. Conditional prediction API evaluates student against conditions');
  console.log('5. First matching condition determines prediction');
  console.log('6. If no conditions match, fallback calculation is used');
  console.log('7. Prediction is saved to database with condition metadata\n');

  console.log('📊 API Request Example:');
  console.log('=======================');
  console.log('POST /api/predictions/conditional');
  console.log('Body:', JSON.stringify({
    studentName: "Alice Johnson",
    studentEmail: "alice@example.com",
    institutionId: "inst-123",
    examId: "jee-main",
    totalScore: 180,
    englishScore: 45,
    reasoningScore: 50,
    mathsScore: 85
  }, null, 2));
  console.log('');

  console.log('🎯 Expected Response:');
  console.log('=====================');
  console.log(JSON.stringify({
    success: true,
    prediction: {
      id: "pred-123",
      studentName: "Alice Johnson",
      predictedRank: 20000,
      predictedPercentile: 80,
      bestCaseRank: 15000,
      worstCaseRank: 25000,
      avgRank: 20000,
      bestCasePercentile: 85,
      worstCasePercentile: 75,
      avgPercentile: 80,
      examName: "JEE Main",
      examCode: "JEE-MAIN",
      status: "completed",
      predictionType: "conditional",
      createdAt: "2026-03-18T16:30:00.000Z"
    }
  }, null, 2));
  console.log('');

  console.log('✅ Benefits of Conditional Prediction:');
  console.log('======================================');
  console.log('• Rule-based predictions based on your expertise');
  console.log('• Consistent results for similar score ranges');
  console.log('• No dependency on historical data or AI');
  console.log('• Full control over prediction logic');
  console.log('• Perfect for new exams without datasets');
  console.log('• Transparent and explainable predictions');
};

// Run the test
testConditionalPrediction();
