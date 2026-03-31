// Debug script to check sessionStorage and prediction flow
// Run this in browser console after making a prediction

function debugPrediction() {
  console.log('🔍 Debugging Prediction Data...');
  
  // Check sessionStorage
  const storedData = sessionStorage.getItem('rankPrediction');
  console.log('📋 SessionStorage Data:', storedData);
  
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      console.log('✅ Parsed Prediction Data:', parsed);
      
      // Check key values
      console.log('📊 Key Values:');
      console.log('  - Total Score:', parsed.totalScore);
      console.log('  - Max Score:', parsed.maxPossibleScore);
      console.log('  - Percentage:', parsed.percentage);
      console.log('  - Predicted Percentile:', parsed.percentile?.predictedPercentile);
      console.log('  - Predicted Rank:', parsed.rankRange?.predictedRank);
      console.log('  - Total Candidates:', parsed.totalCandidates);
      console.log('  - Calculation Method:', parsed.calculationMethod);
      
      // Check if values are zero
      const isZeroPercentile = parsed.percentile?.predictedPercentile === 0;
      const isZeroRank = parsed.rankRange?.predictedRank === 0;
      
      console.log('⚠️ Issues Found:');
      if (isZeroPercentile) console.log('  - Predicted percentile is 0');
      if (isZeroRank) console.log('  - Predicted rank is 0');
      if (!parsed.totalScore) console.log('  - Total score is missing');
      if (!parsed.maxPossibleScore) console.log('  - Max possible score is missing');
      
    } catch (e) {
      console.error('❌ Error parsing stored data:', e);
    }
  } else {
    console.log('❌ No prediction data found in sessionStorage');
  }
  
  // Check current URL
  console.log('🌐 Current URL:', window.location.href);
  
  // Check if we're on results page
  if (window.location.pathname.includes('/results/')) {
    console.log('✅ On results page');
    
    // Try to get the examId from URL
    const pathParts = window.location.pathname.split('/');
    const examId = pathParts[pathParts.length - 1];
    console.log('📋 Exam ID from URL:', examId);
  }
}

// Auto-run debug
debugPrediction();

// Also make it available globally
window.debugPrediction = debugPrediction;
