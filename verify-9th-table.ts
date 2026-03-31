// Verify the 9th table was created and works
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Load environment variables
const { config } = require('dotenv')
const path = require('path')

const envPath = path.join(process.cwd(), '.env')
const envLocalPath = path.join(process.cwd(), '.env.local')

config({ path: envLocalPath })
config({ path: envPath })

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
})

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
} as any)

async function verifyNinthTable() {
  console.log('🔍 Verifying 9th table: exam_conditions...')

  try {
    // Try to query the new ExamCondition table
    console.log('\n📋 Testing ExamCondition table access...')
    
    try {
      const conditions = await prisma.examCondition.findMany({
        take: 5,
        select: {
          id: true,
          parameter: true,
          operator: true,
          value: true,
          bestCasePercentile: true,
          worstCasePercentile: true,
          exam: {
            select: {
              name: true,
              examCode: true
            }
          }
        }
      })
      
      console.log('✅ ExamCondition table is accessible!')
      console.log(`📊 Found ${conditions.length} conditions`)
      
      if (conditions.length > 0) {
        conditions.forEach(condition => {
          console.log(`  - ${condition.parameter} ${condition.operator} ${condition.value} (${condition.exam.name})`)
        })
      } else {
        console.log('📭 No conditions found yet (table is empty but accessible)')
      }
      
    } catch (error: any) {
      if (error.message.includes('examCondition') || error.message.includes('column')) {
        console.log('❌ ExamCondition table not accessible')
        console.log('🔧 Table may not exist or Prisma schema needs to be updated')
        return
      } else {
        console.log('⚠️ Other error:', error.message)
      }
    }

    // Check exams with conditions
    console.log('\n📋 Checking exams with conditions...')
    try {
      const examsWithConditions = await prisma.exam.findMany({
        include: {
          conditions: true
        },
        take: 5
      })
      
      console.log(`📊 Found ${examsWithConditions.length} exams`)
      
      examsWithConditions.forEach(exam => {
        console.log(`  - ${exam.name} (${exam.examCode}): ${exam.conditions.length} conditions`)
      })
      
    } catch (error) {
      console.log('❌ Error checking exams with conditions:', error)
    }

    console.log('\n✅ 9th table verification completed!')

  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyNinthTable()
  .catch((error) => {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  })
