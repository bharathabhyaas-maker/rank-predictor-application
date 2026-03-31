const { Client } = require('pg');

async function checkTemplatesSchema() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking templates table schema...');
    
    // Get column information
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'templates' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Templates table columns:');
    columns.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // Check if table exists and has data
    const tableCheck = await client.query(`
      SELECT COUNT(*) as count
      FROM templates
    `);
    
    console.log(`\n📊 Templates in database: ${tableCheck.rows[0].count}`);
    
    // If templates exist, show sample data
    if (parseInt(tableCheck.rows[0].count) > 0) {
      const sampleData = await client.query(`
        SELECT *
        FROM templates 
        LIMIT 2
      `);
      
      console.log('\n📋 Sample template data:');
      sampleData.rows.forEach((row, index) => {
        console.log(`Template ${index + 1}:`);
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

checkTemplatesSchema();
