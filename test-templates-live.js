// Test if the templates API endpoint works by making a direct HTTP request
const http = require('http');

function testTemplatesEndpoint() {
  console.log('🔍 Testing templates API endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/templates',
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
        console.log('📄 Raw response:', data);
        const jsonData = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ API Response received successfully!');
          console.log(`📋 Templates returned: ${jsonData.length}`);
          
          if (jsonData.length > 0) {
            console.log('\n📋 First template:');
            console.log(`   Name: ${jsonData[0].name}`);
            console.log(`   Exam Code: ${jsonData[0].examCode}`);
            console.log(`   Type: ${jsonData[0].type}`);
            console.log(`   Status: ${jsonData[0].status}`);
          }
          
          console.log('\n🎉 Templates API is working!');
          console.log('💡 The dashboard should now load templates successfully');
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
    console.log('💡 Or the API might have internal errors');
  });

  req.on('timeout', () => {
    console.log('❌ Request timeout');
    req.destroy();
  });

  req.setTimeout(5000); // 5 second timeout

  req.end();
}

testTemplatesEndpoint();
