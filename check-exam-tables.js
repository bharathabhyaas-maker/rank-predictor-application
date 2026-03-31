const { Client } = require('pg');

async function checkExamTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking exam-related tables...');
    
    // Check condition-related tables
    const conditionResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%condition%'"
    );
    console.log('Condition-related tables:', conditionResult.rows.map(row => row.table_name));
    
    // Check exam-related tables
    const examResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%exam%'"
    );
    console.log('Exam-related tables:', examResult.rows.map(row => row.table_name));
    
    // Check if exam_conditions exists
    if (conditionResult.rows.length === 0) {
      console.log('❌ No exam_conditions table found - checking alternative names...');
      
      // Try common variations
      const variations = ['exam_condition', 'examconditions', 'conditions'];
      for (const variation of variations) {
        try {
          const checkResult = await client.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${variation}'`
          );
          if (checkResult.rows.length > 0) {
            console.log(`✅ Found alternative table: ${variation}`);
          }
        } catch (err) {
          // Continue checking
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkExamTables();
