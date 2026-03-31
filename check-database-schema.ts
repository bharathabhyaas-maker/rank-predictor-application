// Check what tables and columns actually exist in your database
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

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...')

  try {
    // Try to query the Exam table to see if conditions field exists
    console.log('\n📋 Checking Exam table structure...')
    
    try {
      const exam = await prisma.exam.findFirst({
        select: {
          id: true,
          name: true,
          examCode: true,
          // Try to select conditions - this will fail if column doesn't exist
          conditions: true
        }
      })
      
      console.log('✅ Exam table has conditions field!')
      console.log('📊 Sample exam:', exam)
      
    } catch (error: any) {
      if (error.message.includes('conditions') || error.message.includes('column')) {
        console.log('❌ Exam table does NOT have conditions field')
        console.log('🔧 Database schema needs to be updated')
      } else {
        console.log('⚠️ Other error:', error.message)
      }
    }

    // Check Template table for type field
    console.log('\n📋 Checking Template table structure...')
    
    try {
      const template = await prisma.template.findFirst({
        select: {
          id: true,
          name: true,
          examCode: true,
          // Try to select type field
          type: true
        }
      })
      
      console.log('✅ Template table has type field!')
      console.log('📊 Sample template:', template)
      
    } catch (error: any) {
      if (error.message.includes('type') || error.message.includes('column')) {
        console.log('❌ Template table does NOT have type field')
        console.log('🔧 Database schema needs to be updated')
      } else {
        console.log('⚠️ Other error:', error.message)
      }
    }

    // List all exams to see what exists
    console.log('\n📋 All exams in database:')
    try {
      const exams = await prisma.exam.findMany({
        select: {
          id: true,
          name: true,
          examCode: true,
          createdAt: true
        },
        take: 10
      })
      
      if (exams.length === 0) {
        console.log('📭 No exams found in database')
      } else {
        exams.forEach(exam => {
          console.log(`  - ${exam.name} (${exam.examCode})`)
        })
      }
    } catch (error) {
      console.log('❌ Error listing exams:', error)
    }

    // List all templates
    console.log('\n📋 All templates in database:')
    try {
      const templates = await prisma.template.findMany({
        select: {
          id: true,
          name: true,
          examCode: true,
          createdAt: true
        },
        take: 10
      })
      
      if (templates.length === 0) {
        console.log('📭 No templates found in database')
      } else {
        templates.forEach(template => {
          console.log(`  - ${template.name} (${template.examCode})`)
        })
      }
    } catch (error) {
      console.log('❌ Error listing templates:', error)
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseSchema()
  .catch((error) => {
    console.error('❌ Check failed:', error)
    process.exit(1)
  })
