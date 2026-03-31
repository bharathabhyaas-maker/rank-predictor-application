const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function checkAndCreateVamshi() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking existing admin users...');
    
    // Check existing users
    const existingUsers = await client.query(`
      SELECT email, name, role 
      FROM users 
      WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'ANALYST', 'MANAGER') 
      ORDER BY createdAt
    `);
    
    console.log('\n📋 Available admin users:');
    if (existingUsers.rows.length === 0) {
      console.log('No admin users found');
    } else {
      existingUsers.rows.forEach(row => {
        console.log(`- ${row.email} (${row.name}) - ${row.role}`);
      });
    }

    // Check if vamshi@gmail.com exists
    const vamshiCheck = await client.query(`
      SELECT email, name, role 
      FROM users 
      WHERE email = 'vamshi@gmail.com'
    `);

    if (vamshiCheck.rows.length > 0) {
      console.log('\n✅ User vamshi@gmail.com already exists:');
      console.log(`- ${vamshiCheck.rows[0].email} (${vamshiCheck.rows[0].name}) - ${vamshiCheck.rows[0].role}`);
      return;
    }

    // Create vamshi user
    console.log('\n👤 Creating user vamshi@gmail.com...');
    
    const hashedPassword = await bcrypt.hash('vamshi123', 10);
    
    const insertResult = await client.query(`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'vamshi@gmail.com',
        'Vamshi',
        $1,
        'ADMIN',
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role, "createdAt"
    `, [hashedPassword]);

    const newUser = insertResult.rows[0];
    
    console.log('✅ User created successfully!');
    console.log(`🆔 Email: ${newUser.email}`);
    console.log(`👤 Name: ${newUser.name}`);
    console.log(`🔑 Password: vamshi123`);
    console.log(`👤 Role: ${newUser.role}`);
    
    console.log('\n🎉 Login Credentials:');
    console.log('📧 Email: vamshi@gmail.com');
    console.log('🔑 Password: vamshi123');
    console.log('🔗 Login URL: /auth/super-admin/login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAndCreateVamshi()
  .then(() => {
    console.log('\n🎉 Process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  });
