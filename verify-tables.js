const { Client } = require('pg')

async function verifyTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor"
  })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL database')

    // Get all tables in the database
    const result = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)

    console.log('\n📊 Tables found in database:')
    if (result.rows.length === 0) {
      console.log('❌ No tables found!')
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name} (${row.table_type})`)
      })
    }

    // Check if specific tables exist
    const tablesToCheck = ['users', 'institutions', 'templates', 'predictions']
    console.log('\n🔍 Checking specific tables:')
    
    for (const table of tablesToCheck) {
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${table}'
        )
      `)
      console.log(`${table}: ${exists.rows[0].exists ? '✅ EXISTS' : '❌ MISSING'}`)
    }

    // Get table details for first few tables
    if (result.rows.length > 0) {
      console.log('\n📋 Table details:')
      for (let i = 0; i < Math.min(3, result.rows.length); i++) {
        const tableName = result.rows[i].table_name
        const columns = await client.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
          ORDER BY ordinal_position
        `)
        
        console.log(`\n📄 ${tableName}:`)
        columns.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Error verifying tables:', error.message)
  } finally {
    await client.end()
  }
}

verifyTables()
