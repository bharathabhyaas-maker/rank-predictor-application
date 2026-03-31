const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createSampleUsers() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Creating sample users for different roles...');

    const users = [
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'admin123',
        role: 'ADMIN'
      },
      {
        name: 'Test Analyst',
        email: 'analyst@test.com',
        password: 'analyst123',
        role: 'ANALYST'
      },
      {
        name: 'Test Manager',
        email: 'manager@test.com',
        password: 'manager123',
        role: 'MANAGER'
      }
    ];

    for (const user of users) {
      // Check if user already exists
      const checkResult = await client.query(`
        SELECT id, email, name, role 
        FROM users 
        WHERE email = $1
      `, [user.email]);

      if (checkResult.rows.length > 0) {
        console.log(`✅ User ${user.email} already exists (${checkResult.rows[0].role})`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      console.log(`🔐 Password hashed for ${user.email}`);

      // Insert the user
      const insertResult = await client.query(`
        INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          $4,
          NOW(),
          NOW()
        )
        RETURNING id, email, name, role, "createdAt"
      `, [user.email, user.name, hashedPassword, user.role]);

      const newUser = insertResult.rows[0];
      
      console.log(`✅ ${user.role} created successfully!`);
      console.log(`🆔 ID: ${newUser.id}`);
      console.log(`📧 Email: ${newUser.email}`);
      console.log(`👤 Name: ${newUser.name}`);
      console.log(`🔑 Password: ${user.password}`);
      console.log(`👤 Role: ${newUser.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    console.log('🎉 All sample users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Super Admin: admin@rankpredict.com / admin123');
    console.log('Admin: admin@test.com / admin123');
    console.log('Analyst: analyst@test.com / analyst123');
    console.log('Manager: manager@test.com / manager123');
    
  } catch (error) {
    console.error('❌ Error creating sample users:', error.message);
  } finally {
    await client.end();
  }
}

// Run the function
createSampleUsers()
  .then(() => {
    console.log('🎉 Sample user creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Creation failed:', error.message);
    process.exit(1);
  });
