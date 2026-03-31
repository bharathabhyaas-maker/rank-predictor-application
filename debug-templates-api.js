const { Client } = require('pg');

async function debugTemplatesAPI() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Debugging templates API step by step...');
    
    // Step 1: Check if templates table exists
    console.log('\n📋 Step 1: Checking templates table...');
    try {
      const templatesCheck = await client.query(`
        SELECT COUNT(*) as count FROM templates
      `);
      console.log(`✅ Templates table exists with ${templatesCheck.rows[0].count} records`);
    } catch (error) {
      console.log('❌ Templates table error:', error.message);
      return;
    }
    
    // Step 2: Check if institution_templates table exists
    console.log('\n📋 Step 2: Checking institution_templates table...');
    try {
      const assignmentsCheck = await client.query(`
        SELECT COUNT(*) as count FROM "institution_templates"
      `);
      console.log(`✅ Institution_templates table exists with ${assignmentsCheck.rows[0].count} records`);
    } catch (error) {
      console.log('❌ Institution_templates table error:', error.message);
      return;
    }
    
    // Step 3: Check if predictions table exists
    console.log('\n📋 Step 3: Checking predictions table...');
    try {
      const predictionsCheck = await client.query(`
        SELECT COUNT(*) as count FROM predictions
      `);
      console.log(`✅ Predictions table exists with ${predictionsCheck.rows[0].count} records`);
    } catch (error) {
      console.log('❌ Predictions table error:', error.message);
      return;
    }
    
    // Step 4: Test the exact query the templates API would use
    console.log('\n📋 Step 4: Testing templates API query...');
    try {
      const templates = await client.query(`
        SELECT id, name, "examCode", description, accuracy, "createdAt", "updatedAt"
        FROM templates 
        ORDER BY "createdAt" DESC
      `);
      
      console.log(`✅ Templates query successful: ${templates.rows.length} templates`);
      
      // Step 5: Test template assignments query
      const templateIds = templates.rows.map(t => t.id);
      if (templateIds.length > 0) {
        const assignments = await client.query(`
          SELECT "templateId", "institutionId", status, "assignedAt"
          FROM "institution_templates"
          WHERE "templateId" = ANY($1)
        `, [templateIds]);
        
        console.log(`✅ Assignments query successful: ${assignments.rows.length} assignments`);
        
        // Step 6: Test predictions query
        const predictions = await client.query(`
          SELECT "templateId", "institutionId", "studentEmail"
          FROM predictions
          WHERE "templateId" = ANY($1)
        `, [templateIds]);
        
        console.log(`✅ Predictions query successful: ${predictions.rows.length} predictions`);
      }
      
      console.log('\n🎉 All API queries should work!');
      console.log('💡 If still failing, the issue might be in the Node.js API code itself');
      
    } catch (error) {
      console.log('❌ API query error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  } finally {
    await client.end();
  }
}

debugTemplatesAPI();
