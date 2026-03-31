const http = require('http');

function testVinayAuth() {
  const data = JSON.stringify({
    email: 'vinay@abhyaas.in',
    password: '0123456'
  });
  
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
        console.log('🔍 Vinay Authentication Test Result:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('\n✅ Authentication SUCCESSFUL!');
          console.log('Vinay can login with:');
          console.log('   Email: vinay@abhyaas.in');
          console.log('   Password: 0123456');
          console.log('   Role: ' + result.user.originalRole + ' → ' + result.user.mappedRole);
          console.log('\n📱 Try logging in at: http://localhost:3000/auth/student/login');
        } else {
          console.log('\n❌ Authentication FAILED: ' + result.error);
          
          if (result.error === 'Invalid password') {
            console.log('💡 The password might be different. Try checking what password was actually set.');
          }
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        console.log('Raw response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });
  
  req.write(data);
  req.end();
}

testVinayAuth();
