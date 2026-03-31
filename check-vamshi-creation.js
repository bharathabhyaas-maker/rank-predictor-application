const { Client } = require('pg');

async function checkVamshiCreation() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking Vamshi user details...');
    
    // Get Vamshi's current details
    const user = await client.query(`
      SELECT email, name, role, "createdAt", "updatedAt" 
      FROM users 
      WHERE email = 'vamshi@gmail.com'
    `);

    if (user.rows.length === 0) {
      console.log('❌ User vamshi@gmail.com not found');
      return;
    }

    const userDetails = user.rows[0];
    console.log('📋 Current user details:');
    console.log(`📧 Email: ${userDetails.email}`);
    console.log(`👤 Name: ${userDetails.name}`);
    console.log(`👤 Role: ${userDetails.role}`);
    console.log(`📅 Created: ${userDetails.createdAt}`);
    console.log(`📅 Updated: ${userDetails.updatedAt}`);

    // Check if there were any recent updates
    console.log('\n🔍 Checking if role should be ANALYST...');
    
    if (userDetails.role === 'ANALYST') {
      console.log('✅ User already has ANALYST role - correct!');
    } else if (userDetails.role === 'ADMIN') {
      console.log('⚠️  User has ADMIN role but should be ANALYST');
      console.log('🔄 Updating role to ANALYST...');
      
      // Update to ANALYST role
      const updateResult = await client.query(`
        UPDATE users 
        SET role = 'ANALYST', "updatedAt" = NOW()
        WHERE email = 'vamshi@gmail.com'
        RETURNING id, email, name, role, "updatedAt"
      `);

      const updatedUser = updateResult.rows[0];
      console.log('✅ Role updated successfully!');
      console.log(`👤 New Role: ${updatedUser.role}`);
      console.log(`📅 Updated at: ${updatedUser.updatedAt}`);
      
    } else {
      console.log(`ℹ️  User has role: ${userDetails.role}`);
    }

    console.log('\n🎉 Final Login Credentials:');
    console.log('📧 Email: vamshi@gmail.com');
    console.log('🔑 Password: vamshi123');
    console.log('👤 Role: ANALYST');
    console.log('🔗 Login URL: /auth/super-admin/login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkVamshiCreation();
