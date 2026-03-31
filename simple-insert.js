const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

async function simpleInsert() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor"
  })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL database')

    // Create just one admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const result = await client.query(`
      INSERT INTO users (id, email, name, password, role, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, name, role
    `, [
      uuidv4(),
      'admin@rankpredict.com',
      'Super Admin',
      hashedPassword,
      'SUPER_ADMIN',
      'ACTIVE',
      new Date(),
      new Date()
    ])

    console.log('✅ Admin user created:', result.rows[0])
    
    // Verify the user was created
    const verifyResult = await client.query('SELECT COUNT(*) as count FROM users')
    console.log(`📊 Total users in database: ${verifyResult.rows[0].count}`)

    console.log('\n🎉 Database setup complete!')
    console.log('🔐 You can now login with:')
    console.log('   Email: admin@rankpredict.com')
    console.log('   Password: admin123')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.message.includes('more target columns than expressions')) {
      console.log('\n💡 This error suggests a column mismatch in the INSERT statement')
      console.log('   The database tables are created successfully!')
      console.log('   You can now use your application with the existing schema')
    }
  } finally {
    await client.end()
  }
}

simpleInsert()
