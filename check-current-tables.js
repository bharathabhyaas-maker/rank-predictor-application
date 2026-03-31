const { Client } = require('pg');

async function checkCurrentTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking current tables in database...');
    
    const result = await client.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name'
    );
    
    console.log('Current tables in database:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check for missing tables from schema
    const expectedTables = [
      'users', 'institutions', 'templates', 'exams', 'predictions',
      'institution_templates', 'notifications', 'institution_onboarding'
    ];
    
    const missingTables = expectedTables.filter(table => 
      !result.rows.some(row => row.table_name === table)
    );
    
    if (missingTables.length > 0) {
      console.log('\n❌ Missing tables:');
      missingTables.forEach(table => {
        console.log(`- ${table}`);
      });
    } else {
      console.log('\n✅ All expected tables exist!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCurrentTables();
