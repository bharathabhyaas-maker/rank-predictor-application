const { PrismaClient } = require('@prisma/client')

// Create Prisma client instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor",
    },
  },
})

// Test connection and create initial data
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...')
    
    await prisma.$connect()
    console.log('✅ Database connected successfully!')

    // Import bcrypt for password hashing
    const bcrypt = require('bcryptjs')

    // Create Super Admin
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@rankpredict.com' },
      update: {},
      create: {
        email: 'admin@rankpredict.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    })

    console.log('✅ Super admin created:', superAdmin.email)

    // Create sample institution
    const institutionPassword = await bcrypt.hash('inst123', 10)
    
    const institution = await prisma.institution.upsert({
      where: { institutionId: 'IID0001' },
      update: {},
      create: {
        institutionId: 'IID0001',
        name: 'Delhi Career Academy',
        email: 'admin@delhiacademy.com',
        password: institutionPassword,
        location: 'New Delhi',
        plan: 'PREMIUM',
        status: 'ACTIVE',
        maxStudents: 5000,
        currentStudents: 2450,
      },
    })

    console.log('✅ Sample institution created:', institution.name)

    // Create sample template
    const template = await prisma.template.create({
      data: {
        name: 'CLAT 2025 AI Predictor',
        examCode: 'CLAT-2025',
        description: 'AI-powered rank prediction for CLAT 2025',
        predictionType: 'AI',
        status: 'ACTIVE',
        createdBy: superAdmin.id,
      },
    })

    console.log('✅ Sample template created:', template.name)

    // Create template sections
    await prisma.templateSection.createMany({
      data: [
        {
          templateId: template.id,
          name: 'English Language',
          totalQuestions: 28,
          positiveMarks: 1.0,
          negativeMarks: -0.25,
          order: 1,
        },
        {
          templateId: template.id,
          name: 'Legal Reasoning',
          totalQuestions: 32,
          positiveMarks: 1.0,
          negativeMarks: -0.25,
          order: 2,
        },
        {
          templateId: template.id,
          name: 'Logical Reasoning',
          totalQuestions: 28,
          positiveMarks: 1.0,
          negativeMarks: -0.25,
          order: 3,
        },
        {
          templateId: template.id,
          name: 'Quantitative Techniques',
          totalQuestions: 12,
          positiveMarks: 1.0,
          negativeMarks: -0.25,
          order: 4,
        },
      ],
    })

    console.log('✅ Template sections created')

    // Create overall cutoff
    await prisma.overallCutoff.create({
      data: {
        templateId: template.id,
        minScore: 50.0,
        maxScore: 150.0,
      },
    })

    console.log('✅ Overall cutoff created')

    console.log('🎉 Database initialization completed!')
    console.log('\n🔐 Login credentials:')
    console.log('Super Admin: admin@rankpredict.com / admin123')
    console.log('Institution: IID0001 / inst123')
    console.log('\n📊 Database tables and sample data created successfully!')

    await prisma.$disconnect()
    console.log('✅ Database connection closed')

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    if (error.code === 'P1001') {
      console.log('💡 Tip: Make sure PostgreSQL is running and database exists')
    }
    if (error.code === 'P2801') {
      console.log('💡 Tip: Check your database connection string')
    }
    process.exit(1)
  }
}

// Export prisma client for use in other files
module.exports = { prisma, initializeDatabase }

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
}
