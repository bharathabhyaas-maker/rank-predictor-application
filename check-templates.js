const { Client } = require('pg');

async function checkTemplates() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking templates table...');

    const result = await client.query(`
      SELECT id, name, "examCode", type, status
      FROM templates 
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    console.log('📊 Found templates:', result.rows.length);
    
    result.rows.forEach((template, index) => {
      console.log(`  ${index + 1}. ID: ${template.id}`);
      console.log(`     Name: ${template.name}`);
      console.log(`     Code: ${template.examCode}`);
      console.log(`     Type: ${template.type}`);
      console.log(`     Status: ${template.status}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTemplates();
