const { Client } = require('pg');

async function checkTemplateAssignments() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });
  
  try {
    await client.connect();
    console.log('🔍 Checking template assignment tables...');
    
    // Check all tables that might contain template assignments
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%template%' OR table_name LIKE '%assignment%')
      ORDER BY table_name
    `);
    
    console.log('\n📊 Template/Assignment related tables:');
    if (tables.rows.length === 0) {
      console.log('❌ No template assignment tables found');
    } else {
      tables.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Check specifically for institution_template
    try {
      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'institution_template' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 institution_template table columns:');
      result.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type}`);
      });
      
      // Check data count
      const count = await client.query(`
        SELECT COUNT(*) as count FROM "institution_template"
      `);
      console.log(`📊 Records in institution_template: ${count.rows[0].count}`);
      
    } catch (error) {
      console.log('❌ institution_template table does not exist or is not accessible');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTemplateAssignments();
