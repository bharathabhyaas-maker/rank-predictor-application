// Test creating a conditional template to see what type is preserved
const http = require('http');

function testCreateConditionalTemplate() {
  console.log('🔍 Testing conditional template creation...');
  
  const testData = {
    name: 'Test Conditional Template',
    examCode: 'TEST-COND-2026',
    type: 'conditional', // This should be preserved
    description: 'Test conditional template description',
    config: {
      examDate: '2026-03-20',
      conditions: [
        {
          parameter: 'score',
          operator: '>=',
          value: 200,
          bestCasePercentile: 95,
          worstCasePercentile: 85,
          bestCaseRank: 5000,
          worstCaseRank: 15000,
          avgRank: 10000,
          avgPercentile: 90
        }
      ]
    }
  };

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/exams',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(testData))
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        if (res.statusCode === 201) {
          console.log('✅ Conditional template created successfully!');
          console.log(`📋 Template ID: ${jsonData.id}`);
          console.log(`📋 Template Name: ${jsonData.name}`);
          console.log(`📋 Template Type: ${jsonData.type}`);
          console.log(`📋 Template Exam Code: ${jsonData.examCode}`);
          console.log(`📋 Full response:`, JSON.stringify(jsonData, null, 2));
        } else {
          console.log('❌ Creation failed:');
          console.log(`Status: ${res.statusCode}`);
          console.log('Error:', jsonData.error || 'Unknown error');
          console.log('Details:', jsonData.details || 'No details');
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response:', parseError.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ API Request failed:', error.message);
  });

  req.write(JSON.stringify(testData));
  req.end();
}

testCreateConditionalTemplate();
