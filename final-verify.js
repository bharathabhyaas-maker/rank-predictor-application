const { Client } = require('pg')

async function finalVerify() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor"
  })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL database')

    // Check if tables exist
    const result = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)

    console.log('\n📊 Tables in database:')
    if (result.rows.length === 0) {
      console.log('❌ NO TABLES FOUND!')
      console.log('\n🔧 SOLUTION:')
      console.log('1. Open pgAdmin')
      console.log('2. Connect to your "rank-predictor" database')
      console.log('3. Open SQL Query Tool')
      console.log('4. Copy and paste the contents of create-tables.sql')
      console.log('5. Execute the SQL script')
      console.log('\n💡 The SQL script creates all 13 tables with proper structure')
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name} (${row.table_type})`)
      })
      console.log(`\n✅ Found ${result.rows.length} tables successfully!`)
    }

    // Show database info
    const dbInfo = await client.query('SELECT current_database()')
    console.log(`\n🗄️ Database: ${dbInfo.rows[0].current_database}`)

    const schemaInfo = await client.query('SELECT current_schema()')
    console.log(`📋 Schema: ${schemaInfo.rows[0].current_schema}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

finalVerify()
