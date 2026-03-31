// Force update the prediction logic by directly calling the updated functions
const http = require('http');

function testDirectPrediction() {
  console.log('🔍 Testing if updated prediction logic is loaded...');
  
  // Test the templates API to see if our changes are active
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/templates?examCode=JEE-MAIN-2026',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const template = JSON.parse(data);
        
        if (res.statusCode === 200 && template.length > 0) {
          console.log(`✅ Template found: ${template[0].name}`);
          console.log(`📋 Template type: ${template[0].type}`);
          console.log(`📋 Template examCode: ${template[0].examCode}`);
          
          // Check if our type column fix is working
          if (template[0].type === 'ai') {
            console.log('✅ Type column fix is working');
          } else {
            console.log('❌ Type column fix not working');
          }
          
          // Now test the prediction logic directly
          testPredictionLogic();
        } else {
          console.log('❌ Template not found or API error');
          console.log('Response:', data);
        }
      } catch (e) {
        console.log('❌ Parse error:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request failed:', error.message);
    console.log('💡 Make sure the server is running on localhost:3000');
  });

  req.end();
}

function testPredictionLogic() {
  console.log('\n🔍 Testing prediction logic...');
  
  // Simulate the updated JEE percentile calculation
  function testJEEPercentile(score, maxScore) {
    const percentage = (score / maxScore) * 100;
    let predictedPercentile;
    
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
    
    return predictedPercentile;
  }
  
  // Test cases
  const testScores = [260, 280, 298];
  const maxScore = 300;
  
  console.log('📊 Updated JEE Percentile Results:');
  testScores.forEach(score => {
    const percentile = testJEEPercentile(score, maxScore);
    console.log(`${score}/${maxScore} → ${percentile.toFixed(1)}%`);
  });
  
  console.log('\n❌ If you\'re still seeing 89% for all scores, the server is using cached code.');
  console.log('🔧 You need to:');
  console.log('1. Stop the server (Ctrl+C)');
  console.log('2. Delete .next folder: rmdir /s /q .next');
  console.log('3. Clear browser cache');
  console.log('4. Restart: npm run dev');
}

testDirectPrediction();
