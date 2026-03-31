const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/postgres'
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Create the database (outside transaction)
    await client.query('CREATE DATABASE "rank-predictor";');
    console.log('Database "rank-predictor" created successfully');

    await client.end();
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database "rank-predictor" already exists');
    } else {
      console.error('Error creating database:', error);
      process.exit(1);
    }
  }

  // Connect to the new database
  const dbClient = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank-predictor'
  });

  try {
    await dbClient.connect();
    console.log('Connected to rank-predictor database');

    // Read and execute the SQL file
    const fs = require('fs');
    const sql = fs.readFileSync('./create-database.sql', 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await dbClient.query(statement.trim());
      }
    }
    
    console.log('Database schema created successfully');

    await dbClient.end();
    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error creating schema:', error);
    process.exit(1);
  }
}

createDatabase();
