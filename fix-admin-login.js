const { Client } = require('pg');

async function deleteAndRecreateAdmin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔐 Deleting and recreating admin user...');
    
    // Delete existing admin user
    await client.query(
      'DELETE FROM users WHERE email = $1',
      ['admin@rankpredictor.com']
    );
    console.log('✅ Deleted existing admin user');
    
    // Create new admin user with plain text password
    const result = await client.query(`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, role
    `, [
      'admin_' + Date.now(),
      'admin@rankpredictor.com',
      'Super Admin',
      'admin123', // Plain text password
      'SUPER_ADMIN',
      new Date(),
      new Date()
    ]);
    
    console.log('✅ New admin user created:', result.rows[0]);
    console.log('📋 New Login Credentials:');
    console.log('   Email: admin@rankpredictor.com');
    console.log('   Password: admin123');
    console.log('   Role: SUPER_ADMIN');
    console.log('🎉 Try logging in now!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

deleteAndRecreateAdmin();
