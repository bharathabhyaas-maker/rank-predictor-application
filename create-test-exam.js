const { Client } = require('pg');

async function createTestExam() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Creating test exam...');

    // Use the first template we found
    const templateId = 'cmmucgx500000n8lhgk1k9'; // JEE MAIN 2021 template

    const result = await client.query(`
      INSERT INTO exams (id, name, "examCode", date, duration, "templateId", status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, name, "examCode"
    `, [
      'test-exam-001',
      'JEE MAIN 2021 Test',
      'JEE-MAIN-2021',
      new Date('2021-09-01'),
      180, // 3 hours
      templateId,
      'ACTIVE'
    ]);

    console.log('✅ Test exam created:');
    console.log('   ID:', result.rows[0].id);
    console.log('   Name:', result.rows[0].name);
    console.log('   Code:', result.rows[0].examCode);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTestExam();
