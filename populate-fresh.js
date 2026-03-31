const { Client } = require('pg')
const bcrypt = require('bcryptjs')

// Generate UUID function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function populateFreshDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor"
  })

  try {
    await client.connect()
    console.log('✅ Connected to fresh PostgreSQL database')

    // Create Super Admin
    const adminPassword = await bcrypt.hash('admin123', 10)
    const adminId = generateUUID()
    
    await client.query(`
      INSERT INTO users (id, email, name, password, role, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, [
      adminId,
      'admin@rankpredict.com',
      'Super Admin',
      adminPassword,
      'SUPER_ADMIN',
      'ACTIVE'
    ])
    console.log('✅ Super Admin created')

    // Create Admin Users
    const managerPassword = await bcrypt.hash('admin123', 10)
    const managerId = generateUUID()
    
    await client.query(`
      INSERT INTO users (id, email, name, password, role, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, [
      managerId,
      'rajesh@rankpredict.com',
      'Rajesh Kumar',
      managerPassword,
      'ADMIN',
      'ACTIVE'
    ])
    console.log('✅ Admin user created')

    // Create Institutions
    const instPassword = await bcrypt.hash('inst123', 10)
    const instId = generateUUID()
    
    await client.query(`
      INSERT INTO institutions (id, "institutionId", name, email, password, location, "contactPerson", phone, plan, status, "maxStudents", "currentStudents", "joinedDate", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), NOW())
    `, [
      instId,
      'IID0001',
      'Delhi Career Academy',
      'admin@delhiacademy.com',
      instPassword,
      'New Delhi',
      'Rahul Verma',
      '+91 9876543210',
      'PREMIUM',
      'ACTIVE',
      5000,
      2450
    ])
    console.log('✅ Institution created')

    // Create Template
    const templateId = generateUUID()
    await client.query(`
      INSERT INTO templates (id, name, "examCode", description, "examDate", duration, "predictionType", "aiSource", status, "totalPredictions", accuracy, "createdBy", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    `, [
      templateId,
      'CLAT 2025 AI Predictor',
      'CLAT-2025',
      'AI-powered rank prediction for CLAT 2025 using historical data analysis',
      '2025-12-01',
      120,
      'AI',
      'DATASET',
      'ACTIVE',
      8234,
      91.2,
      adminId
    ])
    console.log('✅ Template created')

    // Create Template Sections
    const sections = [
      [generateUUID(), 'English Language', 28, 1.0, -0.25, 1],
      [generateUUID(), 'Legal Reasoning', 32, 1.0, -0.25, 2],
      [generateUUID(), 'Logical Reasoning', 28, 1.0, -0.25, 3],
      [generateUUID(), 'Quantitative Techniques', 12, 1.0, -0.25, 4]
    ]

    for (const [id, name, questions, positive, negative, order] of sections) {
      await client.query(`
        INSERT INTO "template_sections" (id, "templateId", name, "totalQuestions", "positiveMarks", "negativeMarks", "order", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [id, templateId, name, questions, positive, negative, order])
    }
    console.log('✅ Template sections created')

    // Create Overall Cutoff
    await client.query(`
      INSERT INTO "overall_cutoffs" (id, "templateId", "minScore", "maxScore", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, [
      generateUUID(),
      templateId,
      50.0,
      150.0
    ])
    console.log('✅ Overall cutoff created')

    // Create AI Configuration
    await client.query(`
      INSERT INTO "ai_configurations" (id, "templateId", "openaiApiKey", "isConnected", "promptTemplate", "lastVerifiedAt", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [
      generateUUID(),
      templateId,
      'sk-test-key-encrypted',
      true,
      'You are a rank prediction expert for CLAT exam. Given a student score of {{score}} out of {{totalMarks}}, with {{candidateCount}} total candidates and {{difficulty}} difficulty, predict percentile and rank range.',
      new Date()
    ])
    console.log('✅ AI configuration created')

    // Create Dataset
    const datasetId = generateUUID()
    await client.query(`
      INSERT INTO datasets (id, "examType", year, records, size, "fileName", "filePath", status, "uploadedBy", "uploadedAt", "description")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      datasetId,
      'CLAT',
      2024,
      45230,
      12.4,
      'clat_2024_results.csv',
      '/uploads/datasets/clat_2024_results.csv',
      'ACTIVE',
      adminId,
      new Date(),
      'CLAT 2024 official result data with section-wise scores and ranks'
    ])
    console.log('✅ Dataset created')

    // Create AI Resources
    const aiConfigId = generateUUID()
    await client.query(`
      INSERT INTO "ai_configurations" (id, "templateId", "openaiApiKey", "isConnected", "promptTemplate", "lastVerifiedAt", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id
    `, [
      aiConfigId,
      templateId,
      'sk-test-key-encrypted',
      true,
      'You are a rank prediction expert for CLAT exam.',
      new Date()
    ])

    const resources = [
      [generateUUID(), aiConfigId, 'URL', 'https://clat.ac.in/previous-year-data', 'CLAT Previous Year Analysis', 'ACTIVE'],
      [generateUUID(), aiConfigId, 'FILE', 'clat_cutoff_2023.csv', 'CLAT 2023 Cutoff Trends', 'ACTIVE']
    ]

    for (const [id, configId, type, source, desc, status] of resources) {
      await client.query(`
        INSERT INTO "ai_resources" (id, "aiConfigId", type, source, description, status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [id, configId, type, source, desc, status])
    }
    console.log('✅ AI resources created')

    // Create Institution-Template Assignment
    await client.query(`
      INSERT INTO "institution_templates" (id, "institutionId", "templateId", "assignedAt", "assignedBy", status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), $4, $5, NOW(), NOW())
    `, [
      generateUUID(),
      instId,
      templateId,
      adminId,
      'ACTIVE'
    ])
    console.log('✅ Template assignment created')

    // Create Sample Prediction
    await client.query(`
      INSERT INTO predictions (id, "templateId", "institutionId", "studentName", "studentEmail", "inputScore", "inputPercentile", "predictedRank", "predictedPercentile", confidence, category, "examSession", "ipAddress", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
    `, [
      generateUUID(),
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
      '192.168.1.1'
    ])
    console.log('✅ Sample prediction created')

    // Create Activity Log
    await client.query(`
      INSERT INTO "activity_logs" (id, "userId", action, resource, "resourceId", details, "ipAddress", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [
      generateUUID(),
      adminId,
      'CREATE_TEMPLATE',
      'Template',
      templateId,
      JSON.stringify({ templateName: 'CLAT 2025 AI Predictor', predictionType: 'AI' }),
      '192.168.1.100'
    ])
    console.log('✅ Activity log created')

    console.log('\n🎉 Fresh database populated successfully!')
    console.log('\n🔐 Login Credentials:')
    console.log('Super Admin: admin@rankpredict.com / admin123')
    console.log('Institution: IID0001 / inst123')
    console.log('\n📊 Summary:')
    console.log('✅ 2 Users (Super Admin + Admin)')
    console.log('✅ 1 Institution')
    console.log('✅ 1 Template with 4 sections')
    console.log('✅ 1 AI configuration with 2 resources')
    console.log('✅ 1 Dataset')
    console.log('✅ 1 Template assignment')
    console.log('✅ 1 Sample prediction')
    console.log('✅ 1 Activity log')
    console.log('\n🚀 Your rank predictor database is ready!')

  } catch (error) {
    console.error('❌ Error populating database:', error.message)
    console.error('Full error:', error)
  } finally {
    await client.end()
  }
}

populateFreshDatabase()
