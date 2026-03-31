// Create CLAT-2025 exam with conditions
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

async function createCLATExam() {
  console.log('🌱 Creating CLAT-2025 exam with conditions...')

  try {
    // Find the CLAT-2025 template
    const template = await prisma.template.findFirst({
      where: { examCode: 'CLAT-2025' }
    })

    if (!template) {
      console.error('❌ CLAT-2025 template not found!')
      return
    }

    console.log('✅ Found CLAT-2025 template:', template.name)

    // Check if exam already exists
    const existingExam = await prisma.exam.findFirst({
      where: { examCode: 'CLAT-2025' }
    })

    if (existingExam) {
      console.log('⚠️ CLAT-2025 exam already exists, updating with conditions...')
      
      // Update existing exam with conditions
      const updatedExam = await prisma.exam.update({
        where: { id: existingExam.id },
        data: {
          conditions: JSON.stringify([
            {
              parameter: "Total Score",
              operator: "gte",
              value: "100",
              bestCasePercentile: "85.0",
              worstCasePercentile: "75.0",
              bestCaseRank: "11250",
              worstCaseRank: "18750"
            },
            {
              parameter: "Total Score",
              operator: "gte", 
              value: "120",
              bestCasePercentile: "90.0",
              worstCasePercentile: "80.0",
              bestCaseRank: "7500",
              worstCaseRank: "15000"
            },
            {
              parameter: "Section Score - English",
              operator: "gte",
              value: "25",
              bestCasePercentile: "88.0",
              worstCasePercentile: "78.0",
              bestCaseRank: "9000",
              worstCaseRank: "16500"
            },
            {
              parameter: "Section Score - Legal Reasoning", 
              operator: "gte",
              value: "30",
              bestCasePercentile: "92.0",
              worstCasePercentile: "82.0",
              bestCaseRank: "6000",
              worstCaseRank: "13500"
            }
          ])
        }
      })

      console.log('✅ Updated CLAT-2025 exam with conditions')
      console.log('📋 Conditions:', JSON.stringify(updatedExam.conditions, null, 2))

    } else {
      console.log('📝 Creating new CLAT-2025 exam with conditions...')
      
      // Create new exam with conditions
      const newExam = await prisma.exam.create({
        data: {
          name: 'CLAT 2025 Exam',
          examCode: 'CLAT-2025',
          description: 'CLAT 2025 exam with conditional prediction',
          date: new Date('2025-05-11'),
          duration: 120,
          status: 'ACTIVE',
          conditions: JSON.stringify([
            {
              parameter: "Total Score",
              operator: "gte",
              value: "100",
              bestCasePercentile: "85.0",
              worstCasePercentile: "75.0",
              bestCaseRank: "11250",
              worstCaseRank: "18750"
            },
            {
              parameter: "Total Score",
              operator: "gte", 
              value: "120",
              bestCasePercentile: "90.0",
              worstCasePercentile: "80.0",
              bestCaseRank: "7500",
              worstCaseRank: "15000"
            },
            {
              parameter: "Section Score - English",
              operator: "gte",
              value: "25",
              bestCasePercentile: "88.0",
              worstCasePercentile: "78.0",
              bestCaseRank: "9000",
              worstCaseRank: "16500"
            },
            {
              parameter: "Section Score - Legal Reasoning", 
              operator: "gte",
              value: "30",
              bestCasePercentile: "92.0",
              worstCasePercentile: "82.0",
              bestCaseRank: "6000",
              worstCaseRank: "13500"
            }
          ]),
          templateId: template.id
        }
      })

      console.log('✅ Created CLAT-2025 exam with conditions')
      console.log('📋 Conditions:', JSON.stringify(newExam.conditions, null, 2))
    }

  } catch (error) {
    console.error('❌ Error creating CLAT exam:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createCLATExam()
  .catch((error) => {
    console.error('❌ Creation failed:', error)
    process.exit(1)
  })
