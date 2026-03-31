const { Client } = require('pg');

async function checkInstitutionTemplatesSchema() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });
  
  try {
    await client.connect();
    console.log('🔍 Checking institution_templates table schema...');
    
    // Get column information
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'institution_templates' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 institution_templates table columns:');
    columns.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // Check data count
    const count = await client.query(`
      SELECT COUNT(*) as count FROM institution_templates
    `);
    console.log(`📊 Records in institution_templates: ${count.rows[0].count}`);
    
    // Show sample data
    if (parseInt(count.rows[0].count) > 0) {
      const sampleData = await client.query(`
        SELECT * FROM institution_templates LIMIT 2
      `);
      
      console.log('\n📋 Sample institution_templates data:');
      sampleData.rows.forEach((row, index) => {
        console.log(`Assignment ${index + 1}:`);
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

checkInstitutionTemplatesSchema();
