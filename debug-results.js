// Debug script to check sessionStorage and prediction data
console.log('🔍 Debugging Results Page Data Loading...');

// Check if we're on the results page
if (window.location.pathname.includes('/results/')) {
  console.log('✅ We are on the results page');
  
  // Check sessionStorage
  const storedData = sessionStorage.getItem('rankPrediction');
  console.log('📋 SessionStorage data:', storedData);
  
  if (storedData) {
    try {
      const data = JSON.parse(storedData);
      console.log('✅ Parsed prediction data:', data);
      
      // Check key values
      console.log('🔍 Key prediction values:');
      console.log('  - Total Score:', data.totalScore);
      console.log('  - Max Possible Score:', data.maxPossibleScore);
      console.log('  - Percentage:', data.percentage);
      console.log('  - Predicted Percentile:', data.percentile?.predictedPercentile);
      console.log('  - Predicted Rank:', data.rankRange?.predictedRank);
      console.log('  - Min Rank:', data.rankRange?.minRank);
      console.log('  - Max Rank:', data.rankRange?.maxRank);
      console.log('  - Total Candidates:', data.totalCandidates);
      console.log('  - Calculation Method:', data.calculationMethod);
      
      // Check if values are default/fallback
      if (data.totalScore === 0) {
        console.error('❌ ISSUE: Total Score is 0 - prediction data not properly calculated');
      }
      if (data.percentile?.predictedPercentile === 50.0) {
        console.error('❌ ISSUE: Predicted Percentile is 50.0% - likely default fallback value');
      }
      if (data.rankRange?.predictedRank === 50000) {
        console.error('❌ ISSUE: Predicted Rank is 50,000 - likely default fallback value');
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse sessionStorage data:', parseError);
    }
  } else {
    console.error('❌ No prediction data found in sessionStorage');
    console.log('📋 Available sessionStorage keys:', Object.keys(sessionStorage));
  }
  
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  console.log('📋 URL parameters:', Object.fromEntries(urlParams.entries()));
  
  // Check if we can fetch prediction data from API
  const examId = window.location.pathname.split('/').pop();
  console.log('📋 Exam ID from URL:', examId);
  
  fetch(`/api/predictions?examId=${examId}`)
    .then(response => {
      console.log('📋 Database API response status:', response.status);
      if (response.ok) {
        return response.json();
      } else {
        console.error('❌ Database API failed:', response.status);
        return null;
      }
    })
    .then(predictions => {
      if (predictions && predictions.length > 0) {
        console.log('✅ Found predictions in database:', predictions.length);
        const latest = predictions[0];
        console.log('📋 Latest prediction:', {
          id: latest.id,
          predictedRank: latest.predictedRank,
          predictedPercentile: latest.predictedPercentile,
          totalScore: latest.totalScore,
          examName: latest.examName
        });
      } else {
        console.log('⚠️ No predictions found in database');
      }
    })
    .catch(error => {
      console.error('❌ Error fetching from database:', error);
    });
    
} else {
  console.log('ℹ️ Not on results page, current page:', window.location.pathname);
}

// Function to manually check and fix prediction data
window.fixPredictionData = function() {
  console.log('🔧 Attempting to fix prediction data...');
  
  const storedData = sessionStorage.getItem('rankPrediction');
  if (storedData) {
    try {
      const data = JSON.parse(storedData);
      
      // If score is 0, try to calculate it from subject data
      if (data.totalScore === 0 && data.subjectData && data.subjectData.length > 0) {
        console.log('🔄 Calculating score from subject data...');
        
        let calculatedScore = 0;
        data.subjectData.forEach(subject => {
          const correct = parseInt(subject.correct) || 0;
          const attempted = parseInt(subject.attempted) || 0;
          
          // Simple calculation: 4 marks per correct answer (JEE-style)
          calculatedScore += correct * 4;
        });
        
        data.totalScore = calculatedScore;
        data.percentage = (calculatedScore / (data.maxPossibleScore || 300)) * 100;
        
        console.log('✅ Updated score:', {
          totalScore: data.totalScore,
          percentage: data.percentage
        });
        
        // Save back to sessionStorage
        sessionStorage.setItem('rankPrediction', JSON.stringify(data));
        console.log('✅ Updated sessionStorage with calculated score');
        
        // Reload page to see updated results
        console.log('🔄 Reloading page to show updated results...');
        window.location.reload();
      } else {
        console.log('ℹ️ Score is already calculated or no subject data available');
      }
    } catch (error) {
      console.error('❌ Error fixing prediction data:', error);
    }
  } else {
    console.error('❌ No prediction data to fix');
  }
};

console.log('💡 To manually fix prediction data, run: fixPredictionData()');
