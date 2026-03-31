const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function testLogin() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔐 Testing login...');
    
    // Get admin user
    const result = await client.query(
      'SELECT id, email, password, role FROM users WHERE email = $1',
      ['admin@rankpredictor.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('📊 User found:');
    console.log('Email:', user.email);
    console.log('Stored Password:', user.password);
    console.log('Role:', user.role);
    
    // Test password comparison
    const testPassword = 'admin123';
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2')) {
      // Hashed password - use bcrypt
      isPasswordValid = await bcrypt.compare(testPassword, user.password);
      console.log('🔍 Using bcrypt comparison');
    } else {
      // Plain text password - use direct comparison
      isPasswordValid = testPassword === user.password;
      console.log('🔍 Using direct comparison');
    }
    
    console.log('✅ Password Valid:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('🎉 Login should work!');
    } else {
      console.log('❌ Login will fail');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testLogin();
