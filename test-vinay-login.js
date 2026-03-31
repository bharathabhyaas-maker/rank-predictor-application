const http = require('http');

function testVinayLogin() {
  const data = JSON.stringify({
    email: 'vinay@abhyaas.in',
    password: '0123456',
    role: 'student'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/callback/credentials',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'next-auth.csrf-token=debug; next-auth.callback-url=http://localhost:3000/auth/student/login'
    }
  };

  const req = http.request(options, (res) => {
    console.log('🔍 Response Status:', res.statusCode);
    console.log('🔍 Response Headers:', res.headers);
    
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('🔍 Response Body:', responseData);
    });
  });

  req.on('error', (error) => {
    console.error('Request error:', error);
  });
  
  req.write(data);
  req.end();
}

console.log('🧪 Testing Vinay login with NextAuth endpoint...');
testVinayLogin();
