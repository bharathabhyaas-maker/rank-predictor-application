const { Client } = require('pg');

async function testTemplatesDirectly() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Testing templates data directly from database...');
    
    // Check if templates exist
    const templates = await client.query(`
      SELECT id, name, examCode, type, status, accuracy, "createdAt"
      FROM templates 
      ORDER BY "createdAt" DESC
      LIMIT 5
    `);
    
    console.log('\n📋 Templates found:');
    if (templates.rows.length === 0) {
      console.log('❌ No templates found in database');
    } else {
      templates.rows.forEach((template, index) => {
        console.log(`${index + 1}. ${template.name} (${template.examCode})`);
        console.log(`   Type: ${template.type}`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Created: ${template.createdAt}`);
        console.log('');
      });
    }

    // Check template assignments
    const assignments = await client.query(`
      SELECT COUNT(*) as count
      FROM "institution_template"
    `);
    
    console.log(`📊 Template assignments: ${assignments.rows[0].count}`);
    
    // Check predictions
    const predictions = await client.query(`
      SELECT COUNT(*) as count
      FROM predictions
    `);
    
    console.log(`📊 Total predictions: ${predictions.rows[0].count}`);
    
    console.log('\n✅ Database connection working - templates endpoint should work');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('💡 This might be why the templates API is failing');
  } finally {
    await client.end();
  }
}

testTemplatesDirectly();
