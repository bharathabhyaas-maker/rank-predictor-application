const { Client } = require('pg');

async function createAdminUser() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔐 Connected to database');
    
    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@rankpredictor.com']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    // Create admin user
    const result = await client.query(`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, role
    `, [
      'admin_' + Date.now(),
      'admin@rankpredictor.com',
      'Super Admin',
      'admin123',
      new Date(),
      new Date()
    ]);
    
    console.log('✅ Admin user created:', result.rows[0]);
    console.log('📋 Login Credentials:');
    console.log('   Email: admin@rankpredictor.com');
    console.log('   Password: admin123');
    console.log('   Role: SUPER_ADMIN');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdminUser();
