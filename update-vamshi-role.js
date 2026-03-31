const { Client } = require('pg');

async function updateVamshiRole() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking vamshi@gmail.com current role...');
    
    // Check current user
    const currentUser = await client.query(`
      SELECT email, name, role 
      FROM users 
      WHERE email = 'vamshi@gmail.com'
    `);

    if (currentUser.rows.length === 0) {
      console.log('❌ User vamshi@gmail.com not found');
      return;
    }

    const user = currentUser.rows[0];
    console.log(`📋 Current role: ${user.role}`);
    
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ANALYST' || user.role === 'MANAGER') {
      console.log('✅ User already has admin role. They should be able to login.');
      console.log('\n🎉 Login Credentials:');
      console.log('📧 Email: vamshi@gmail.com');
      console.log('🔑 Password: vamshi123');
      console.log('🔗 Login URL: /auth/super-admin/login');
      return;
    }

    console.log('🔄 Updating role to ADMIN...');
    
    // Update the user's role to ADMIN
    const updateResult = await client.query(`
      UPDATE users 
      SET role = 'ADMIN', "updatedAt" = NOW()
      WHERE email = 'vamshi@gmail.com'
      RETURNING id, email, name, role, "updatedAt"
    `);

    const updatedUser = updateResult.rows[0];
    
    console.log('✅ User role updated successfully!');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 Name: ${updatedUser.name}`);
    console.log(`👤 New Role: ${updatedUser.role}`);
    
    console.log('\n🎉 Login Credentials:');
    console.log('📧 Email: vamshi@gmail.com');
    console.log('🔑 Password: vamshi123');
    console.log('🔗 Login URL: /auth/super-admin/login');
    console.log('\n✅ You can now login with these credentials!');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
  } finally {
    await client.end();
  }
}

updateVamshiRole()
  .then(() => {
    console.log('\n🎉 Process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  });
