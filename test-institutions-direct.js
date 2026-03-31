const { Client } = require('pg');

async function testInstitutionsDirectly() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Testing institutions API logic directly...');
    
    // Test the same query as the API
    console.log('\n📋 Testing institutions query...');
    
    // First check if related tables exist
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'institution_template', 'predictions')
    `);
    
    console.log('📊 Related tables found:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Test basic institutions query
    const institutions = await client.query(`
      SELECT id, "institutionId", name, email, location, plan, status, "createdAt"
      FROM institutions 
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`\n✅ Found ${institutions.rows.length} institutions`);
    
    // Transform like the API does
    const transformedInstitutions = institutions.rows.map(inst => {
      return {
        id: inst.id,
        institutionId: inst.institutionId,
        name: inst.name,
        email: inst.email,
        location: inst.location,
        students: 0, // Would be calculated from predictions
        templatesAssigned: 0, // Would be calculated from assignments
        predictions: 0, // Would be calculated from predictions
        status: inst.status,
        joinedDate: inst.createdAt.toISOString().split('T')[0],
        plan: inst.plan,
        contactPerson: null,
        phone: null
      }
    });

    console.log('\n📋 Transformed institutions (like API would return):');
    transformedInstitutions.forEach((inst, index) => {
      console.log(`${index + 1}. ${inst.name} (${inst.institutionId})`);
      console.log(`   Email: ${inst.email}`);
      console.log(`   Location: ${inst.location}`);
      console.log(`   Plan: ${inst.plan}`);
      console.log(`   Status: ${inst.status}`);
      console.log('');
    });

    console.log('✅ Institutions API should work!');
    console.log('💡 If still failing, the issue might be with related table queries');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 This might be why the institutions API is failing');
  } finally {
    await client.end();
  }
}

testInstitutionsDirectly();
