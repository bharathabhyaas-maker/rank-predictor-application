const { Client } = require('pg');

async function testSuperAdminLogin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Testing super admin login credentials...');
    
    // Get the super admin user
    const result = await client.query(`
      SELECT id, email, name, password, role 
      FROM users 
      WHERE email = 'admin@rankpredict.com' AND role = 'SUPER_ADMIN'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Super admin not found');
      return;
    }
    
    const admin = result.rows[0];
    console.log('✅ Super admin found:');
    console.log('🆔 ID:', admin.id);
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.name);
    console.log('🔑 Role:', admin.role);
    console.log('🔒 Password Hash:', admin.password.substring(0, 30) + '...');
    console.log('🔐 Is Bcrypt Hash:', admin.password.startsWith('$2'));
    
    // Test password verification (simulate bcrypt.compare)
    const bcrypt = require('bcryptjs');
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    console.log('🧪 Password Test:');
    console.log('🔑 Test Password:', testPassword);
    console.log('✅ Password Valid:', isValid);
    
    if (isValid) {
      console.log('🎉 Login should work! Try these credentials:');
      console.log('📧 Email: admin@rankpredict.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: super-admin');
    } else {
      console.log('❌ Password verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testSuperAdminLogin();
