// Test the percentile calculation logic directly
function testJEEPercentile(score, maxScore) {
  const percentage = (score / maxScore) * 100;
  let predictedPercentile;
  
  // JEE-specific percentile calculation
  if (percentage >= 99) {
    predictedPercentile = 99.8;
  } else if (percentage >= 98) {
    predictedPercentile = 99.5;
  } else if (percentage >= 95) {
    predictedPercentile = 99.0;
  } else if (percentage >= 90) {
    predictedPercentile = 97.5;
  } else if (percentage >= 85) {
    predictedPercentile = 95.0;
  } else if (percentage >= 80) {
    predictedPercentile = 92.0;
  } else if (percentage >= 75) {
    predictedPercentile = 88.0;
  } else if (percentage >= 70) {
    predictedPercentile = 83.0;
  } else {
    const zScore = (score - (maxScore * 0.5)) / (maxScore * 0.12);
    predictedPercentile = Math.min(99.9, Math.max(0.1, 50 + (zScore * 15)));
  }
  
  return {
    percentage: percentage,
    predictedPercentile: predictedPercentile
  };
}

// Test cases
const testCases = [
  { score: 298, maxScore: 300, expectedPercentile: 99.8, description: "Your case - 298/300 should be 99.8%" },
  { score: 280, maxScore: 300, expectedPercentile: 97.5, description: "High score - 280/300 should be 97.5%" },
  { score: 250, maxScore: 300, expectedPercentile: 92.0, description: "Good score - 250/300 should be 92.0%" },
  { score: 200, maxScore: 300, expectedPercentile: 70.8, description: "Average score - 200/300 should be 70.8%" },
  { score: 150, maxScore: 300, expectedPercentile: 50.0, description: "50% score - 150/300 should be 50.0%" }
];

console.log('🎯 Testing JEE Percentile Calculation:');
console.log('=====================================');

testCases.forEach((testCase, index) => {
  const result = testJEEPercentile(testCase.score, testCase.maxScore);
  console.log(`\nTest ${index + 1}: ${testCase.description}`);
  console.log(`Score: ${testCase.score}/${testCase.maxScore} (${result.percentage.toFixed(1)}%)`);
  console.log(`Predicted Percentile: ${result.predictedPercentile.toFixed(1)}%`);
  
  const expected = testCase.expectedPercentile;
  const actual = result.predictedPercentile;
  const isCorrect = Math.abs(actual - expected) < 0.1;
  
  console.log(`Expected: ${expected.toFixed(1)}%`);
  console.log(`Result: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
});

console.log('\n=====================================');
console.log('🎉 New JEE percentile calculation should give much more accurate results!');
