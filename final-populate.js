const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

async function populateData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor"
  })

  try {
    await client.connect()
    console.log('✅ Connected to PostgreSQL database')

    // Create Super Admin
    const hashedAdminPassword = await bcrypt.hash('admin123', 10)
    const adminId = uuidv4()
    
    await client.query(`
      INSERT INTO users (id, email, name, password, role, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        "updatedAt" = NOW()
    `, [
      adminId,
      'admin@rankpredict.com',
      'Super Admin',
      hashedAdminPassword,
      'SUPER_ADMIN',
      'ACTIVE',
      new Date(),
      new Date()
    ])
    console.log('✅ Super admin created')

    // Create sample institution
    const hashedInstPassword = await bcrypt.hash('inst123', 10)
    const instId = uuidv4()
    
    await client.query(`
      INSERT INTO institutions (id, "institutionId", name, email, password, location, plan, status, "maxStudents", "currentStudents", "joinedDate", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT ("institutionId") DO UPDATE SET
        name = EXCLUDED.name,
        "updatedAt" = NOW()
    `, [
      instId,
      'IID0001',
      'Delhi Career Academy',
      'admin@delhiacademy.com',
      hashedInstPassword,
      'New Delhi',
      'PREMIUM',
      'ACTIVE',
      5000,
      2450,
      new Date(),
      new Date(),
      new Date()
    ])
    console.log('✅ Sample institution created')

    // Create sample template
    const templateId = uuidv4()
    await client.query(`
      INSERT INTO templates (id, name, "examCode", description, "predictionType", "aiSource", status, "totalPredictions", "createdBy", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      templateId,
      'CLAT 2025 AI Predictor',
      'CLAT-2025',
      'AI-powered rank prediction for CLAT 2025 using historical data analysis',
      'AI',
      'DATASET',
      'ACTIVE',
      0,
      adminId,
      new Date(),
      new Date()
    ])
    console.log('✅ Sample template created')

    // Create template sections
    const sections = [
      [uuidv4(), 'English Language', 28, 1.0, -0.25, 1],
      [uuidv4(), 'Legal Reasoning', 32, 1.0, -0.25, 2],
      [uuidv4(), 'Logical Reasoning', 28, 1.0, -0.25, 3],
      [uuidv4(), 'Quantitative Techniques', 12, 1.0, -0.25, 4]
    ]

    for (const [id, name, questions, positive, negative, order] of sections) {
      await client.query(`
        INSERT INTO "template_sections" (id, "templateId", name, "totalQuestions", "positiveMarks", "negativeMarks", "order", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [id, templateId, name, questions, positive, negative, order, new Date(), new Date()])
    }
    console.log('✅ Template sections created')

    // Create overall cutoff
    await client.query(`
      INSERT INTO "overall_cutoffs" (id, "templateId", "minScore", "maxScore", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      uuidv4(),
      templateId,
      50.0,
      150.0,
      new Date(),
      new Date()
    ])
    console.log('✅ Overall cutoff created')

    // Create AI configuration
    await client.query(`
      INSERT INTO "ai_configurations" (id, "templateId", "openaiApiKey", "isConnected", "promptTemplate", "lastVerifiedAt", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      uuidv4(),
      templateId,
      'sk-test-key-encrypted',
      true,
      'You are a rank prediction expert for CLAT exam. Given a student score of {{score}} out of {{totalMarks}}, with {{candidateCount}} total candidates and {{difficulty}} difficulty, predict percentile and rank range.',
      new Date(),
      new Date(),
      new Date()
    ])
    console.log('✅ AI configuration created')

    // Create sample prediction
    await client.query(`
      INSERT INTO predictions (id, "templateId", "institutionId", "studentName", "studentEmail", "inputScore", "inputPercentile", "predictedRank", "predictedPercentile", "confidence", "category", "examSession", "ipAddress", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      uuidv4(),
      templateId,
      instId,
      'Amit Kumar',
      'amit@student.com',
      125.5,
      95.2,
      2456,
      95.2,
      0.89,
      'General',
      'Morning',
      '192.168.1.1',
      new Date()
    ])
    console.log('✅ Sample prediction created')

    console.log('\n🎉 Database populated successfully!')
    console.log('\n🔐 Login credentials:')
    console.log('Super Admin: admin@rankpredict.com / admin123')
    console.log('Institution: IID0001 / inst123')
    console.log('\n📊 Summary:')
    console.log('- 1 Super Admin user')
    console.log('- 1 Institution')
    console.log('- 1 Template with 4 sections')
    console.log('- 1 AI configuration')
    console.log('- 1 Sample prediction')
    console.log('\n✅ Your database is now ready for the rank predictor application!')

  } catch (error) {
    console.error('❌ Error populating data:', error.message)
    console.error('Full error:', error)
  } finally {
    await client.end()
  }
}

populateData()
