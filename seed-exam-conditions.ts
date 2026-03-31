import { PrismaClient, Status } from '@prisma/client'
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

async function seedExamsWithConditions() {
  console.log('🌱 Seeding exams with conditions...')

  try {
    // Get existing templates
    const jeeTemplate = await prisma.template.findFirst({
      where: { examCode: 'JEE-ADV-2024' }
    })

    const neetTemplate = await prisma.template.findFirst({
      where: { examCode: 'NEET-UG-2024' }
    })

    if (!jeeTemplate || !neetTemplate) {
      console.log('❌ Templates not found. Please run the main seed first.')
      return
    }

    // Create JEE Advanced exam with conditions
    const existingJeeExam = await prisma.exam.findFirst({
      where: { examCode: 'JEE-ADV-2024-EXAM' }
    })

    if (!existingJeeExam) {
      const jeeExam = await prisma.exam.create({
        data: {
          name: 'JEE Advanced 2024 Mock Test',
          examCode: 'JEE-ADV-2024-EXAM',
          description: 'JEE Advanced mock test with conditional predictions',
          date: new Date('2024-06-01T09:00:00Z'),
          duration: 180, // 3 hours
          status: Status.ACTIVE,
          templateId: jeeTemplate.id,
          conditions: JSON.stringify([
            {
              parameter: "Total Score",
              operator: "gte",
              value: "200",
              bestCasePercentile: "98.5",
              worstCasePercentile: "95.0",
              bestCaseRank: "1500",
              worstCaseRank: "5000",
              avgRank: "3000",
              avgPercentile: "96.5"
            },
            {
              parameter: "Total Score",
              operator: "between",
              value: "150",
              operator2: "lte",
              value2: "199",
              bestCasePercentile: "92.0",
              worstCasePercentile: "85.0",
              bestCaseRank: "8000",
              worstCaseRank: "25000",
              avgRank: "15000",
              avgPercentile: "88.0"
            },
            {
              parameter: "Section Score - Physics",
              operator: "gte",
              value: "60",
              bestCasePercentile: "90.0",
              worstCasePercentile: "85.0",
              bestCaseRank: "10000",
              worstCaseRank: "20000",
              avgRank: "15000",
              avgPercentile: "87.5"
            }
          ])
        }
      })
      console.log('✅ JEE Advanced exam with conditions created:', jeeExam.name)
    } else {
      console.log('✅ JEE Advanced exam already exists')
    }

    // Create NEET UG exam with conditions
    const existingNeetExam = await prisma.exam.findFirst({
      where: { examCode: 'NEET-UG-2024-EXAM' }
    })

    if (!existingNeetExam) {
      const neetExam = await prisma.exam.create({
        data: {
          name: 'NEET UG 2024 Mock Test',
          examCode: 'NEET-UG-2024-EXAM',
          description: 'NEET UG mock test with conditional predictions',
          date: new Date('2024-05-01T09:00:00Z'),
          duration: 200, // 3 hours 20 minutes
          status: Status.ACTIVE,
          templateId: neetTemplate.id,
          conditions: JSON.stringify([
            {
              parameter: "Total Score",
              operator: "gte",
              value: "650",
              bestCasePercentile: "99.5",
              worstCasePercentile: "98.0",
              bestCaseRank: "500",
              worstCaseRank: "2000",
              avgRank: "1000",
              avgPercentile: "98.5"
            },
            {
              parameter: "Total Score",
              operator: "between",
              value: "500",
              operator2: "lte",
              value2: "649",
              bestCasePercentile: "95.0",
              worstCasePercentile: "85.0",
              bestCaseRank: "5000",
              worstCaseRank: "50000",
              avgRank: "20000",
              avgPercentile: "90.0"
            },
            {
              parameter: "Section Score - Biology",
              operator: "gte",
              value: "160",
              bestCasePercentile: "92.0",
              worstCasePercentile: "88.0",
              bestCaseRank: "15000",
              worstCaseRank: "30000",
              avgRank: "22000",
              avgPercentile: "90.0"
            }
          ])
        }
      })
      console.log('✅ NEET UG exam with conditions created:', neetExam.name)
    } else {
      console.log('✅ NEET UG exam already exists')
    }

    console.log('🎉 Exam conditions seeding completed!')

  } catch (error) {
    console.error('❌ Error seeding exam conditions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedExamsWithConditions()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
