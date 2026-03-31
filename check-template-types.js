const { Client } = require('pg');

async function checkTemplateTypes() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking recent templates...');
    
    const result = await client.query('SELECT * FROM templates ORDER BY "createdAt" DESC LIMIT 5');
    
    console.log('Recent templates:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.name} (${row.examCode}) - Type: NOT IN DB`);
    });
    
    // Check what the templates API returns for these templates
    console.log('\n🔍 Checking what templates API returns...');
    
    const http = require('http');
    
    const testTemplate = (template) => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: `/api/templates?examCode=${template.examCode}`,
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
                resolve(jsonData[0]);
              } else {
                resolve(null);
              }
            } catch (e) {
              resolve(null);
            }
          });
        });

        req.on('error', reject);
        req.end();
      });
    };
    
    for (const template of result.rows) {
      const apiTemplate = await testTemplate(template);
      if (apiTemplate) {
        console.log(`API Response - ${apiTemplate.name}: type="${apiTemplate.type}", hasConditions=${apiTemplate.hasConditions}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTemplateTypes();
