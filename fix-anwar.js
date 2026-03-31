// Script to fix Anwar's email mismatch
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/debug/fix-anwar',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('Response:', result);
    } catch (error) {
      console.error('Error:', error);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
