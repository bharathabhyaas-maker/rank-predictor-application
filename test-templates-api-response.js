// Test what the templates API actually returns
const http = require('http');

function testTemplatesAPIResponse() {
  console.log('🔍 Testing templates API response...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/templates?examCode=JEE-MAIN-2026',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
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
        
        if (res.statusCode === 200 && jsonData.length > 0) {
          console.log('✅ Template response:');
          console.log('📋 Template Name:', jsonData[0].name);
          console.log('📋 Template Type:', jsonData[0].type);
          console.log('📋 Template Exam Code:', jsonData[0].examCode);
          console.log('📋 Full template object:', JSON.stringify(jsonData[0], null, 2));
        } else {
          console.log('❌ API returned error or no templates');
          console.log('Response:', data);
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

  req.end();
}

testTemplatesAPIResponse();
