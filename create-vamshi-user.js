const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createVamshiUser() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking if vamshi@gmail.com already exists...');
    
    // Check if user already exists
    const existingUser = await client.query(`
      SELECT email, name, role 
      FROM users 
      WHERE email = 'vamshi@gmail.com'
    `);

    if (existingUser.rows.length > 0) {
      console.log('✅ User vamshi@gmail.com already exists:');
      console.log(`- ${existingUser.rows[0].email} (${existingUser.rows[0].name}) - ${existingUser.rows[0].role}`);
      console.log('\n🔑 Try logging in with password: vamshi123');
      return;
    }

    console.log('👤 Creating user vamshi@gmail.com...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('vamshi123', 10);
    console.log('🔐 Password hashed successfully');
    
    // Insert the user with correct column names
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
    console.log(`🆔 ID: ${newUser.id}`);
    console.log(`📧 Email: ${newUser.email}`);
    console.log(`👤 Name: ${newUser.name}`);
    console.log(`👤 Role: ${newUser.role}`);
    
    console.log('\n🎉 Login Credentials:');
    console.log('📧 Email: vamshi@gmail.com');
    console.log('🔑 Password: vamshi123');
    console.log('🔗 Login URL: /auth/super-admin/login');
    console.log('\n💡 You can now use these credentials to login!');
    
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await client.end();
  }
}

createVamshiUser()
  .then(() => {
    console.log('\n🎉 Process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error.message);
    process.exit(1);
  });
