// Test the fixed delete functionality
const http = require('http');

function testDeleteAPI(templateId) {
  console.log(`🗑️ Testing delete API for template ID: ${templateId}`);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/templates?id=${templateId}`,
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
        
        if (res.statusCode === 200 && jsonData.success) {
          console.log('✅ Template deleted successfully!');
          console.log(`📋 Message: ${jsonData.message}`);
          console.log(`📋 Deleted Template: ${jsonData.deletedTemplate.name} (${jsonData.deletedTemplate.examCode})`);
        } else {
          console.log('❌ Delete failed:');
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
    console.log('❌ API Request failed:', error.message);
  });

  req.end();
}

// First, let's get a list of templates to find one we can delete
console.log('🔍 Getting list of templates to test delete...');

const listOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/templates',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const listReq = http.request(listOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const templates = JSON.parse(data);
      
      if (templates.length > 0) {
        // Find a test template (like the one we created earlier)
        const testTemplate = templates.find(t => t.examCode === 'TEST-2026') || templates[0];
        console.log(`📋 Found template to delete: ${testTemplate.name} (${testTemplate.id})`);
        
        // Test the delete
        testDeleteAPI(testTemplate.id);
      } else {
        console.log('❌ No templates found to test delete');
      }
      
    } catch (parseError) {
      console.log('❌ Failed to parse templates list:', parseError.message);
    }
  });
});

listReq.on('error', (error) => {
  console.log('❌ Failed to get templates list:', error.message);
});

listReq.end();
