const { Client } = require('pg');

async function checkTemplateType() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking template type for JEE-MAIN-2026...');
    
    const result = await client.query('SELECT * FROM templates WHERE "examCode" = $1', ['JEE-MAIN-2026']);
    
    if (result.rows.length > 0) {
      console.log('Template data:', JSON.stringify(result.rows[0], null, 2));
      console.log('Template type field:', result.rows[0].type || 'NOT SET');
    } else {
      console.log('❌ Template not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTemplateType();
