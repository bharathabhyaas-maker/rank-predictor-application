const http = require('http');

function testAuth(email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/debug/test-auth',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Test with different emails
async function runTests() {
  console.log('🧪 Testing Vinay Authentication...\n');
  
  // Test with common email patterns
  const emailsToTest = [
    'vinay@gmail.com',
    'vinay@test.com',
    'vinay.analyst@gmail.com'
  ];
  
  for (const email of emailsToTest) {
    console.log(`\n--- Testing: ${email} ---`);
    try {
      const result = await testAuth(email, 'password123');
      console.log('Result:', result);
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
}

runTests().catch(console.error);
