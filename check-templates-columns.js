const { Client } = require('pg');

async function checkTemplatesColumns() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking templates table columns...');
    
    const result = await client.query(
      'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'templates\' ORDER BY ordinal_position'
    );
    
    console.log('Templates table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTemplatesColumns();
