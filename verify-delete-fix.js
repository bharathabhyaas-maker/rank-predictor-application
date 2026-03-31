// Test if the updated delete API is being loaded
const http = require('http');

function verifyDeleteFix() {
  console.log('🔍 Verifying if updated delete API is loaded...');
  
  // Test with a non-existent template to trigger the error handling
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/templates?id=non-existent-template-id',
    method: 'DELETE',
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
        
        if (res.statusCode === 400 && jsonData.error === 'Template not found') {
          console.log('✅ Updated delete API is loaded! (Proper error handling working)');
          console.log('📋 Error message:', jsonData.error);
        } else if (res.statusCode === 500 && jsonData.error === 'Failed to delete template') {
          console.log('❌ Old delete API is still cached');
          console.log('📋 Error details:', jsonData.details);
        } else {
          console.log('📋 Unexpected response:', jsonData);
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response:', parseError.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ API Request failed:', error.message);
    console.log('💡 Make sure the Next.js server is running on localhost:3000');
  });

  req.end();
}

verifyDeleteFix();
