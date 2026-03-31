// Test creating a new conditional template
const http = require('http');

function testCreateNewConditional() {
  console.log('🔍 Testing new conditional template creation...');
  
  const testData = {
    name: 'New Conditional Template',
    examCode: 'NEW-COND-2026',
    type: 'conditional',
    description: 'New conditional template description',
    config: {
      examDate: '2026-03-20',
      conditions: [
        {
          parameter: 'score',
          operator: '>=',
          value: 200,
          bestCasePercentile: 95,
          worstCasePercentile: 85,
          bestCaseRank: 5000,
          worstCaseRank: 15000,
          avgRank: 10000,
          avgPercentile: 90
        }
      ]
    }
  };

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/exams',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(testData))
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
        
        if (res.statusCode === 201) {
          console.log('✅ New conditional template created successfully!');
          console.log(`📋 Template ID: ${jsonData.id}`);
          console.log(`📋 Template Name: ${jsonData.name}`);
          console.log(`📋 Template Type: ${jsonData.type}`);
          console.log(`📋 Template Exam Code: ${jsonData.examCode}`);
          
          // Now test what the templates API returns
          testTemplatesAPI(jsonData.examCode);
        } else {
          console.log('❌ Creation failed:');
          console.log(`Status: ${res.statusCode}`);
          console.log('Error:', jsonData.error || 'Unknown error');
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

  req.write(JSON.stringify(testData));
  req.end();
}

function testTemplatesAPI(examCode) {
  console.log(`\n🔍 Testing templates API for ${examCode}...`);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/templates?examCode=${examCode}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        
        if (res.statusCode === 200 && jsonData.length > 0) {
          const template = jsonData[0];
          console.log(`✅ Template found! Type: ${template.type}`);
          
          if (template.type === 'conditional') {
            console.log('🎉 SUCCESS: Conditional template type preserved end-to-end!');
          } else {
            console.log('❌ FAILED: Expected conditional, got:', template.type);
          }
        } else {
          console.log('❌ Template not found');
        }
      } catch (e) {
        console.log('❌ Parse error:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ API Request failed:', error.message);
  });

  req.end();
}

testCreateNewConditional();
