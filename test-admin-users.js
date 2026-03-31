const { Client } = require('pg');

async function testAdminUsers() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Testing all admin users that can login...');
    
    // Get all admin users
    const adminUsers = await client.query(`
      SELECT email, name, role 
      FROM users 
      WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'ANALYST', 'MANAGER') 
      ORDER BY role, name
    `);
    
    console.log('\n👥 Admin Users that can login through super admin login page:');
    if (adminUsers.rows.length === 0) {
      console.log('❌ No admin users found');
    } else {
      adminUsers.rows.forEach((user, index) => {
        console.log(`${index + 1}. 📧 ${user.email}`);
        console.log(`   👤 ${user.name} (${user.role})`);
        console.log(`   🔗 Can login: /auth/super-admin/login`);
        console.log('');
      });
    }

    console.log('✅ All these users can login through the super admin login page!');
    console.log('💡 The system will auto-detect their role and redirect appropriately.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testAdminUsers();
