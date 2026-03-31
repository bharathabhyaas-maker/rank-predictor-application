const http = require('http');

function testInstitutionLogin(institutionId, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ institutionId, password });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/institution/login',
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

async function runTests() {
  console.log('🧪 Testing Institution Login...\n');
  
  // Test with common institution IDs
  const institutionIdsToTest = [
    'INST001',
    'INST002', 
    'TEAM-MEMBERS',
    'INST001'
  ];
  
  for (const institutionId of institutionIdsToTest) {
    console.log(`\n--- Testing Institution ID: ${institutionId} ---`);
    try {
      const result = await testInstitutionLogin(institutionId, 'password123');
      console.log('Result:', result);
      
      if (result.success) {
        console.log('✅ SUCCESS! Institution can login with:');
        console.log('   Institution ID:', institutionId);
        console.log('   User Email:', result.user.email);
        console.log('   User Name:', result.user.name);
        console.log('   Institution:', result.user.institutionName);
        console.log('\n📱 Login URL: http://localhost:3000/auth/institution/login');
        break;
      } else {
        console.log('❌ Failed:', result.error);
      }
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
}

runTests().catch(console.error);
