const http = require('http');

function createVinayAccount() {
  const data = JSON.stringify({
    email: 'vinay@abhyaas.in',
    name: 'Vinay',
    password: '0123456'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/debug/fix-vinay',
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
        console.log('✅ Vinay Account Creation Result:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('\n🎉 SUCCESS! Vinay can now login with:');
          console.log('   Email: vinay@abhyaas.in');
          console.log('   Password: 0123456');
          console.log('   Role: ' + result.user.role);
          console.log('\n📱 Login URL: http://localhost:3000/auth/student/login');
        } else {
          console.log('\n❌ FAILED: ' + result.error);
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

createVinayAccount();
