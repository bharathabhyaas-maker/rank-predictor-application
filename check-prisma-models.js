// Check what Prisma models are available
const checkPrismaModels = async () => {
  try {
    console.log('🔍 Checking Prisma models...')
    
    // Import prisma
    const { prisma } = require('@/lib/database')
    
    console.log('📋 Available models:')
    console.log('  - prisma.template:', typeof prisma.template)
    console.log('  - prisma.exam:', typeof prisma.exam)
    console.log('  - prisma.examCondition:', typeof prisma.examCondition)
    console.log('  - prisma.institution:', typeof prisma.institution)
    console.log('  - prisma.prediction:', typeof prisma.prediction)
    
    // Check if examCondition has deleteMany method
    if (prisma.examCondition) {
      console.log('✅ examCondition model exists')
      console.log('📋 examCondition methods:', Object.getOwnPropertyNames(prisma.examCondition))
      console.log('📋 examCondition.deleteMany:', typeof prisma.examCondition.deleteMany)
    } else {
      console.log('❌ examCondition model does not exist')
    }
    
    // Try a simple query to see if examCondition works
    try {
      console.log('\n🔍 Testing examCondition query...')
      const conditionCount = await prisma.examCondition.count()
      console.log(`✅ Found ${conditionCount} conditions in database`)
    } catch (error) {
      console.error('❌ examCondition query failed:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
  }
}

// Run the check
checkPrismaModels()
