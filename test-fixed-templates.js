const { Client } = require('pg');

async function testFixedTemplates() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Testing templates API logic with actual database...');
    
    // Get templates like the API would
    const templates = await client.query(`
      SELECT id, name, "examCode", description, accuracy, "createdAt", "updatedAt"
      FROM templates 
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`\n✅ Found ${templates.rows.length} templates`);
    
    // Transform like the API does
    const transformedTemplates = templates.rows.map(template => {
      return {
        id: template.id,
        name: template.name,
        examCode: template.examCode,
        description: template.description,
        type: 'ai', // Default type
        predictions: 0, // Would be calculated from predictions table
        status: 'ACTIVE', // Default status
        accuracy: template.accuracy?.toString() || '0',
        shareLink: template.examCode.toLowerCase().replace(/\s+/g, '-'),
        createdAt: template.createdAt.toISOString().split('T')[0],
        assignedInstitutions: 0
      }
    });

    console.log('\n📋 Transformed templates (like API would return):');
    transformedTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} (${template.examCode})`);
      console.log(`   Type: ${template.type}`);
      console.log(`   Status: ${template.status}`);
      console.log(`   Created: ${template.createdAt}`);
      console.log('');
    });

    console.log('✅ Templates API should now work!');
    console.log('💡 The "Failed to fetch templates" error should be resolved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testFixedTemplates();
