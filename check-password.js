const { Client } = require('pg');

async function checkPassword() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Bharathteja@localhost:5432/rank-predictor'
  });

  try {
    await client.connect();
    
    // Find Gyanville user and check their password
    const result = await client.query(`
      SELECT u.email, u.password, u.role, i.name as institution_name 
      FROM users u 
      JOIN institutions i ON u."institutionId" = i.id 
      WHERE i.name ILIKE '%gyanville%'
    `);
    
    console.log('Found users:', result.rows.length);
    result.rows.forEach(user => {
      console.log('Email:', user.email);
      console.log('Password (raw):', user.password);
      console.log('Password length:', user.password.length);
      console.log('Password starts with $2?:', user.password.startsWith('$2'));
      console.log('Institution:', user.institution_name);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkPassword();
