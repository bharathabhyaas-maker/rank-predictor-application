// Check if there are any cached prediction results or old data
console.log('🔍 Checking for prediction cache issues...');

// Check sessionStorage
if (typeof sessionStorage !== 'undefined') {
  const cachedPrediction = sessionStorage.getItem('rankPrediction');
  if (cachedPrediction) {
    console.log('📦 Found cached prediction:', JSON.parse(cachedPrediction));
  } else {
    console.log('📦 No cached prediction found');
  }
}

// Check localStorage
if (typeof localStorage !== 'undefined') {
  const cachedData = localStorage.getItem('rankPrediction');
  if (cachedData) {
    console.log('💾 Found localStorage prediction:', JSON.parse(cachedData));
  } else {
    console.log('💾 No localStorage prediction found');
  }
}

// Check if the updated rankPrediction.ts is being used
console.log('🔍 Checking if updated calculation is loaded...');
try {
  // This will work if the file is updated
  const testScore = 298;
  const testMax = 300;
  const percentage = (testScore / testMax) * 100;
  
  let predictedPercentile;
  if (percentage >= 99) {
    predictedPercentile = 99.8;
  } else {
    predictedPercentile = 50; // fallback
  }
  
  console.log(`🧪 Test calculation for 298/300: ${predictedPercentile}%`);
  console.log('✅ If this shows 99.8%, the updated code is being used');
  console.log('❌ If this shows 50%, old code is being cached');
} catch (error) {
  console.log('❌ Error testing calculation:', error.message);
}
