const { Client } = require('pg');

async function checkExams() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking exams table...');

    const result = await client.query(`
      SELECT id, name, "examCode", "templateId"
      FROM exams 
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    console.log('📊 Found exams:', result.rows.length);
    
    result.rows.forEach((exam, index) => {
      console.log(`  ${index + 1}. ID: ${exam.id}`);
      console.log(`     Name: ${exam.name}`);
      console.log(`     Code: ${exam.examCode}`);
      console.log(`     Template: ${exam.templateId}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkExams();
