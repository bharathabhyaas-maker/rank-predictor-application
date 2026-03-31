// Test the score calculation functions
console.log('🧪 Testing Score Calculation Functions...');

// Test data for different exam types
const testCases = [
  {
    name: 'JEE Main - Section Data',
    examType: 'jee-main-2025',
    provideSectionData: 'yes',
    expectedScoreValue: '',
    subjectData: [
      { name: 'Physics', attempted: '25', correct: '20' },
      { name: 'Chemistry', attempted: '25', correct: '18' },
      { name: 'Mathematics', attempted: '25', correct: '22' }
    ],
    subjects: [
      { name: 'Physics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 },
      { name: 'Chemistry', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 },
      { name: 'Mathematics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 }
    ],
    expectedScore: 240 // (20*4) + (18*4) + (22*4) = 80 + 72 + 88 = 240
  },
  {
    name: 'JEE Main - Expected Score Only',
    examType: 'jee-main-2025',
    provideSectionData: 'no',
    expectedScoreValue: '180',
    subjectData: [],
    subjects: [
      { name: 'Physics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 },
      { name: 'Chemistry', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 },
      { name: 'Mathematics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 }
    ],
    expectedScore: 180
  },
  {
    name: 'CLAT - Section Data',
    examType: 'clat-2025',
    provideSectionData: 'yes',
    expectedScoreValue: '',
    subjectData: [
      { name: 'English Language', attempted: '20', correct: '18' },
      { name: 'Current Affair Including GK', attempted: '25', correct: '20' },
      { name: 'Legal Reasoning', attempted: '30', correct: '25' },
      { name: 'Logical Reasoning', attempted: '20', correct: '16' },
      { name: 'Quantitative', attempted: '10', correct: '8' }
    ],
    subjects: [
      { name: 'English Language', totalQuestions: 24, positiveMarks: 1, negativeMarks: 0.25 },
      { name: 'Current Affair Including GK', totalQuestions: 28, positiveMarks: 1, negativeMarks: 0.25 },
      { name: 'Legal Reasoning', totalQuestions: 32, positiveMarks: 1, negativeMarks: 0.25 },
      { name: 'Logical Reasoning', totalQuestions: 24, positiveMarks: 1, negativeMarks: 0.25 },
      { name: 'Quantitative', totalQuestions: 12, positiveMarks: 1, negativeMarks: 0.25 }
    ],
    expectedScore: 87 // 18 + 20 + 25 + 16 + 8 = 87
  },
  {
    name: 'Empty Data - Should be 0',
    examType: 'jee-main-2025',
    provideSectionData: 'yes',
    expectedScoreValue: '',
    subjectData: [
      { name: 'Physics', attempted: '0', correct: '0' },
      { name: 'Chemistry', attempted: '0', correct: '0' },
      { name: 'Mathematics', attempted: '0', correct: '0' }
    ],
    subjects: [
      { name: 'Physics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 },
      { name: 'Chemistry', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 },
      { name: 'Mathematics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 }
    ],
    expectedScore: 0
  }
];

// Mock the calculateScore function (simplified version for testing)
function calculateScore(subjectData, subjects) {
  let totalScore = 0;
  
  subjectData.forEach((subject, index) => {
    const subjectConfig = subjects[index];
    if (!subjectConfig) return;
    
    const attempted = parseInt(subject.attempted) || 0;
    const correct = parseInt(subject.correct) || 0;
    const validAttempted = Math.min(attempted, subjectConfig.totalQuestions);
    const validCorrect = Math.min(correct, validAttempted);
    const incorrect = validAttempted - validCorrect;
    
    const subjectScore = Math.max(0, 
      (validCorrect * subjectConfig.positiveMarks) - (incorrect * subjectConfig.negativeMarks)
    );
    
    totalScore += subjectScore;
  });
  
  return totalScore;
}

// Mock calculateMaxPossibleScore function
function calculateMaxPossibleScore(subjects) {
  return subjects.reduce((total, subject) => {
    return total + (subject.totalQuestions * subject.positiveMarks);
  }, 0);
}

// Run tests
testCases.forEach((testCase, index) => {
  console.log(`\n📋 Test Case ${index + 1}: ${testCase.name}`);
  console.log(`  - provideSectionData: ${testCase.provideSectionData}`);
  console.log(`  - expectedScoreValue: "${testCase.expectedScoreValue}"`);
  
  let calculatedScore;
  if (testCase.provideSectionData === 'yes') {
    calculatedScore = calculateScore(testCase.subjectData, testCase.subjects);
    console.log(`  - Using calculateScore() function`);
  } else {
    calculatedScore = parseInt(testCase.expectedScoreValue) || 0;
    console.log(`  - Using parseInt(expectedScoreValue)`);
  }
  
  const maxPossibleScore = calculateMaxPossibleScore(testCase.subjects);
  const percentage = maxPossibleScore > 0 ? (calculatedScore / maxPossibleScore) * 100 : 0;
  
  console.log(`  - Calculated Score: ${calculatedScore}`);
  console.log(`  - Expected Score: ${testCase.expectedScore}`);
  console.log(`  - Max Possible Score: ${maxPossibleScore}`);
  console.log(`  - Percentage: ${percentage.toFixed(1)}%`);
  
  if (calculatedScore === testCase.expectedScore) {
    console.log(`  ✅ PASS: Score calculation correct`);
  } else {
    console.log(`  ❌ FAIL: Expected ${testCase.expectedScore}, got ${calculatedScore}`);
  }
  
  if (calculatedScore === 0 && testCase.expectedScore > 0) {
    console.log(`  ⚠️  WARNING: Score is 0 when it shouldn't be!`);
  }
});

// Test edge cases
console.log('\n🔍 Testing Edge Cases...');

// Test with missing values
const edgeCase1 = {
  name: 'Missing Values',
  provideSectionData: 'yes',
  expectedScoreValue: '',
  subjectData: [
    { name: 'Physics', attempted: '', correct: '20' },  // missing attempted
    { name: 'Chemistry', attempted: '25', correct: '' }, // missing correct
    { name: 'Mathematics', attempted: 'abc', correct: '22' } // invalid attempted
  ],
  subjects: [
    { name: 'Physics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 },
    { name: 'Chemistry', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 },
    { name: 'Mathematics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 }
  ]
};

const edgeCaseScore = calculateScore(edgeCase1.subjectData, edgeCase1.subjects);
console.log(`  - Edge case score: ${edgeCaseScore}`);
console.log(`  - Should handle missing/invalid values gracefully`);

// Test with negative marking
const negativeMarkingCase = {
  name: 'Negative Marking Test',
  provideSectionData: 'yes',
  expectedScoreValue: '',
  subjectData: [
    { name: 'Physics', attempted: '25', correct: '15' } // 10 wrong answers
  ],
  subjects: [
    { name: 'Physics', totalQuestions: 30, positiveMarks: 4, negativeMarks: 1 }
  ]
};

const negativeScore = calculateScore(negativeMarkingCase.subjectData, negativeMarkingCase.subjects);
const expectedNegativeScore = (15 * 4) - (10 * 1); // 60 - 10 = 50
console.log(`  - Negative marking score: ${negativeScore}`);
console.log(`  - Expected: ${expectedNegativeScore}`);
console.log(`  - Negative marking working: ${negativeScore === expectedNegativeScore ? '✅' : '❌'}`);

console.log('\n🎯 Score Calculation Testing Complete!');
console.log('💡 If scores are 0, check:');
console.log('   1. Form data (provideSectionData, expectedScoreValue)');
console.log('   2. Subject data (attempted, correct values)');
console.log('   3. calculateScore function logic');
console.log('   4. parseInt() results for expected scores');
