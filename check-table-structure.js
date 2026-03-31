const { Client } = require('pg')

async function checkTableStructure() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank_predictor"
  })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL database')

    // Check users table structure
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position
    `)

    console.log('\n📄 Users table structure:')
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`)
    })

    // Try simple insert
    console.log('\n🧪 Testing simple insert...')
    const bcrypt = require('bcryptjs')
    const { v4: uuidv4 } = require('uuid')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    try {
      await client.query(`
        INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          "updatedAt" = NOW()
      `, [
        uuidv4(),
        'admin@rankpredict.com',
        'Super Admin',
        hashedPassword,
        'SUPER_ADMIN',
        new Date(),
        new Date()
      ])
      console.log('✅ Simple insert successful!')
    } catch (insertError) {
      console.error('❌ Insert failed:', insertError.message)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

checkTableStructure()
