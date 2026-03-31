// Test the exams API endpoint by making a direct HTTP request
const http = require('http');

function testExamsAPI() {
  console.log('🔍 Testing exams API endpoint...');
  
  const testData = {
    name: 'Test Exam',
    examCode: 'TEST-2026',
    type: 'ai',
    description: 'Test exam description',
    config: {
      examDate: '2026-03-20'
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
        console.log('📄 Raw response:', data);
        const jsonData = JSON.parse(data);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Exam template created successfully!');
          console.log(`📋 Template ID: ${jsonData.id}`);
          console.log(`📋 Template Name: ${jsonData.name}`);
        } else {
          console.log('❌ API returned error:');
          console.log(`Status: ${res.statusCode}`);
          console.log('Error:', jsonData.error || 'Unknown error');
          console.log('Details:', jsonData.details || 'No details');
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response:');
        console.log('Parse Error:', parseError.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ API Request failed:');
    console.log('Error:', error.message);
    console.log('💡 Make sure the Next.js server is running on localhost:3000');
  });

  req.write(JSON.stringify(testData));
  req.end();
}

testExamsAPI();
