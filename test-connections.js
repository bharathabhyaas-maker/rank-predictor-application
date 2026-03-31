const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  console.log('🔍 Testing database connections...')
  
  try {
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test institutions count
    const institutionCount = await prisma.institutions.count()
    console.log(`📊 Found ${institutionCount} institutions`)
    
    // Test templates count
    const templateCount = await prisma.templates.count()
    console.log(`📋 Found ${templateCount} templates`)
    
    // Test datasets count
    const datasetCount = await prisma.datasets.count()
    console.log(`💾 Found ${datasetCount} datasets`)
    
    // Test predictions count
    const predictionCount = await prisma.predictions.count()
    console.log(`🎯 Found ${predictionCount} predictions`)
    
    // Test sample data
    const sampleInstitution = await prisma.institutions.findFirst({
      select: {
        id: true,
        institutionId: true,
        name: true,
        email: true,
        plan: true,
        status: true
      }
    })
    
    if (sampleInstitution) {
      console.log('🏫 Sample institution:', sampleInstitution)
    }
    
    const sampleTemplate = await prisma.templates.findFirst({
      select: {
        id: true,
        name: true,
        examCode: true,
        predictionType: true,
        status: true
      }
    })
    
    if (sampleTemplate) {
      console.log('📝 Sample template:', sampleTemplate)
    }
    
    console.log('\n🎉 All database connections working properly!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()
