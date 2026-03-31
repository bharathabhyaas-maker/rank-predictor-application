const { Client } = require('pg');

async function updateConditionalTemplate() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Updating conditional template type...');
    
    // Update the specific conditional template we created (using correct case)
    await client.query('UPDATE templates SET type = \'conditional\' WHERE "examCode" = \'TEST-COND-2026\';');
    console.log('✅ Updated TEST-COND-2026 template to conditional type');
    
    // Check the conditional template
    const templateResult = await client.query('SELECT name, "examCode", type FROM templates WHERE "examCode" = \'TEST-COND-2026\'');
    if (templateResult.rows.length > 0) {
      console.log(`✅ Conditional template: ${templateResult.rows[0].name} - type: ${templateResult.rows[0].type}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

updateConditionalTemplate();
