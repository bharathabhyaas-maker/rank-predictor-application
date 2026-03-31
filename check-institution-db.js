const { Client } = require('pg');

async function checkInstitutions() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking institutions table...');

    const result = await client.query(`
      SELECT id, "institutionId", name, email, location, plan, status, "createdAt"
      FROM institutions 
      ORDER BY "createdAt" DESC
    `);

    console.log('📊 Found institutions:', result.rows.length);
    
    result.rows.forEach((inst, index) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`${index + 1}. ID:`, inst.id);
      console.log('   Institution ID:', inst.institutionId);
      console.log('   Name:', inst.name);
      console.log('   Email:', inst.email);
      console.log('   Location:', inst.location);
      console.log('   Plan:', inst.plan);
      console.log('   Status:', inst.status);
      console.log('   Created:', inst.createdAt);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkInstitutions();
