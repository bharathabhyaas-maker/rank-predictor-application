// Test what the templates API returns for the conditional template
const http = require('http');

function testConditionalTemplateAPI() {
  console.log('🔍 Testing templates API for conditional template...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/templates?examCode=TEST-COND-2026',
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
          console.log('✅ Template found!');
          const template = jsonData[0];
          console.log(`📋 Template Name: ${template.name}`);
          console.log(`📋 Template Type: ${template.type}`);
          console.log(`📋 Template Exam Code: ${template.examCode}`);
          console.log(`📋 Has Conditions: ${template.hasConditions}`);
          console.log(`📋 Full template:`, JSON.stringify(template, null, 2));
          
          if (template.type === 'conditional') {
            console.log('✅ Template type preserved correctly!');
          } else {
            console.log('❌ Template type not preserved - got:', template.type);
          }
        } else {
          console.log('❌ Template not found or API error');
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

testConditionalTemplateAPI();
