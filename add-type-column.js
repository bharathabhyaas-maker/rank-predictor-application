const { Client } = require('pg');

async function addTypeColumn() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Adding type column to templates table...');
    
    // Add the type column
    await client.query('ALTER TABLE templates ADD COLUMN type TEXT DEFAULT \'ai\';');
    console.log('✅ Added type column to templates table');
    
    // Update existing templates to have the correct type
    await client.query('UPDATE templates SET type = \'ai\' WHERE type IS NULL;');
    console.log('✅ Updated existing templates with default type');
    
    // Update the specific conditional template we created
    await client.query('UPDATE templates SET type = \'conditional\' WHERE examCode = \'TEST-COND-2026\';');
    console.log('✅ Updated TEST-COND-2026 template to conditional type');
    
    // Verify the column was added
    const result = await client.query(
      'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'templates\' ORDER BY ordinal_position'
    );
    
    console.log('Updated templates table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
    
    // Check the conditional template
    const templateResult = await client.query('SELECT name, examCode, type FROM templates WHERE examCode = \'TEST-COND-2026\'');
    if (templateResult.rows.length > 0) {
      console.log(`✅ Conditional template: ${templateResult.rows[0].name} - type: ${templateResult.rows[0].type}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

addTypeColumn();
