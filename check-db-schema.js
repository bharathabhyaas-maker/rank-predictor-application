const { Client } = require('pg');

async function checkSchema() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking users table schema...');
    
    // Get column information
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users table columns:');
    columns.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // Check existing users
    console.log('\n🔍 Checking existing users...');
    const users = await client.query(`
      SELECT email, name, role 
      FROM users 
      WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'ANALYST', 'MANAGER') 
      LIMIT 10
    `);
    
    console.log('\n👥 Existing admin users:');
    if (users.rows.length === 0) {
      console.log('No admin users found');
    } else {
      users.rows.forEach(row => {
        console.log(`- ${row.email} (${row.name}) - ${row.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
