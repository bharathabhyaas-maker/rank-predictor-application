const { Client } = require('pg');
const fs = require('fs');

async function createMissingTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Creating missing tables...');
    
    // Read and execute SQL file
    const sql = fs.readFileSync('create-missing-tables.sql', 'utf8');
    
    // Execute SQL commands
    await client.query(sql);
    
    console.log('✅ Missing tables created successfully!');
    
    // Verify tables were created
    const result = await client.query(
      'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' ORDER BY table_name'
    );
    
    console.log('\n🔍 Updated tables in database:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
  } finally {
    await client.end();
  }
}

createMissingTables();
