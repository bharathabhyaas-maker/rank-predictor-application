const { Client } = require('pg');

async function findGyanville() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Bharathteja@localhost:5432/rank-predictor'
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Find institutions with Gyanville in the name
    const result = await client.query('SELECT * FROM institutions WHERE name ILIKE \'%gyanville%\' OR name ILIKE \'%academy%\'');
    console.log('Found institutions:', result.rows);
    
    if (result.rows.length > 0) {
      const institution = result.rows[0];
      console.log('\nGyanville Academy Details:');
      console.log('ID:', institution.id);
      console.log('Name:', institution.name);
      console.log('Email:', institution.email);
      console.log('Status:', institution.status);
      console.log('Plan:', institution.plan);
      
      // Find users for this institution
      const usersResult = await client.query('SELECT * FROM users WHERE "institutionId" = $1', [institution.id]);
      console.log('\nUsers for this institution:');
      usersResult.rows.forEach(user => {
        console.log('User:', user.email, 'Role:', user.role, 'Status:', user.status);
      });
    } else {
      console.log('No Gyanville Academy institution found in database');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

findGyanville();
