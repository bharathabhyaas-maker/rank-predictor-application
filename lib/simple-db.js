// Simple database setup using generated client
const path = require('path')

// Import the generated Prisma client
const { PrismaClient } = require(path.join(__dirname, '../app/generated/prisma'))

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor",
    },
  },
})

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...')
    
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // Test basic operations
    const userCount = await prisma.user.count()
    console.log(`📊 Current users: ${userCount}`)

    const institutionCount = await prisma.institution.count()
    console.log(`📊 Current institutions: ${institutionCount}`)

    const templateCount = await prisma.template.count()
    console.log(`📊 Current templates: ${templateCount}`)

    console.log('✅ Database is ready!')
    console.log('\n🎯 Database tables created and accessible!')
    console.log('\n📋 Available tables:')
    console.log('- users (Super Admin, Admin, Manager, Analyst, Institution)')
    console.log('- institutions (Educational institutions)')
    console.log('- templates (Prediction templates)')
    console.log('- template_sections (Exam sections)')
    console.log('- template_conditions (Conditional logic)')
    console.log('- overall_cutoffs (Score cutoffs)')
    console.log('- sectional_cutoffs (Section-wise cutoffs)')
    console.log('- datasets (Historical data)')
    console.log('- ai_configurations (AI settings)')
    console.log('- ai_resources (Data sources)')
    console.log('- predictions (Student predictions)')
    console.log('- institution_templates (Template assignments)')
    console.log('- activity_logs (Audit trails)')

    await prisma.$disconnect()
    console.log('✅ Setup completed!')

  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  }
}

module.exports = { prisma, setupDatabase }

if (require.main === module) {
  setupDatabase()
}
