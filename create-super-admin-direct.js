const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Checking for existing super admin...');
    
    // Check if super admin already exists
    const checkResult = await client.query(`
      SELECT id, email, name, password, role 
      FROM users 
      WHERE email = 'admin@rankpredict.com'
    `);
    
    if (checkResult.rows.length > 0) {
      const existingAdmin = checkResult.rows[0];
      console.log('✅ Super Admin already exists:');
      console.log('🆔 ID:', existingAdmin.id);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('🔒 Has Password:', !!existingAdmin.password);
      console.log('🔐 Is Hashed:', existingAdmin.password?.startsWith('$2'));
      return existingAdmin.id;
    }

    console.log('🔑 Creating super admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('🔐 Password hashed successfully');

    // Insert super admin user
    const insertResult = await client.query(`
      INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'admin@rankpredict.com',
        'Super Admin',
        $1,
        'SUPER_ADMIN',
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role, "createdAt"
    `, [hashedPassword]);

    const newAdmin = insertResult.rows[0];
    
    console.log('✅ Super Admin user created successfully!');
    console.log('🆔 ID:', newAdmin.id);
    console.log('📧 Email: admin@rankpredict.com');
    console.log('👤 Name:', newAdmin.name);
    console.log('🔑 Password: admin123');
    console.log('👤 Role: SUPER_ADMIN');
    console.log('📅 Created:', newAdmin.createdAt);
    console.log('🔒 Password Hash (first 20 chars):', hashedPassword.substring(0, 20) + '...');
    
    return newAdmin.id;
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    console.error('💥 Full error:', error);
    
    // Fallback: try with plain text password
    if (error.message.includes('bcrypt') || error.message.includes('hash')) {
      console.log('🔄 Trying with plain text password...');
      try {
        const fallbackResult = await client.query(`
          INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
          VALUES (
            gen_random_uuid(),
            'admin@rankpredict.com',
            'Super Admin',
            'admin123',
            'SUPER_ADMIN',
            NOW(),
            NOW()
          )
          RETURNING id, email, name, role, "createdAt"
        `);

        const fallbackAdmin = fallbackResult.rows[0];
        console.log('✅ Super Admin created with plain text password!');
        console.log('🆔 ID:', fallbackAdmin.id);
        console.log('📧 Email: admin@rankpredict.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: SUPER_ADMIN');
        
        return fallbackAdmin.id;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError.message);
      }
    }
    
    throw error;
  } finally {
    await client.end();
  }
}

// Run the function
createSuperAdmin()
  .then(() => {
    console.log('🎉 Super admin creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Creation failed:', error.message);
    process.exit(1);
  });
