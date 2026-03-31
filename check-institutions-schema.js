const { Client } = require('pg');

async function checkInstitutionsSchema() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking institutions table schema...');
    
    // Get column information
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'institutions' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Institutions table columns:');
    columns.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // Check if table exists and has data
    const tableCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM institutions
    `);
    
    console.log(`\n📊 Institutions in database: ${tableCheck.rows[0].count}`);
    
    // If institutions exist, show sample data
    if (parseInt(tableCheck.rows[0].count) > 0) {
      const sampleData = await client.query(`
        SELECT *
        FROM institutions 
        LIMIT 2
      `);
      
      console.log('\n📋 Sample institution data:');
      sampleData.rows.forEach((row, index) => {
        console.log(`Institution ${index + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkInstitutionsSchema();
