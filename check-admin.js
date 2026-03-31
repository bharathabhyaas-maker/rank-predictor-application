const { Client } = require('pg');

async function checkAdminUser() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking admin user...');
    
    // Get all admin users
    const result = await client.query(`
      SELECT id, email, name, password, role, "createdAt" 
      FROM users 
      WHERE email LIKE '%admin%' OR role LIKE '%ADMIN%'
      ORDER BY "createdAt" DESC
    `);
    
    console.log('📊 Found users:', result.rows.length);
    
    result.rows.forEach(user => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Password:', user.password);
      console.log('Role:', user.role);
      console.log('Created:', user.createdAt);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAdminUser();
