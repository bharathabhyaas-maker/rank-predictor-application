// Script to update existing templates with correct types
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

async function updateTemplateTypes() {
  console.log('🔄 Updating template types...')

  try {
    // Get all existing templates
    const templates = await prisma.template.findMany()
    console.log(`📋 Found ${templates.length} templates`)

    for (const template of templates) {
      console.log(`\n🔍 Processing template: ${template.name} (${template.examCode})`)
      
      // Determine the correct type based on examCode or name
      let newType = 'ai' // default
      
      if (template.examCode.includes('CLAT') || template.name.includes('CLAT')) {
        newType = 'ai'
        console.log(`  📝 Setting type to 'ai' for CLAT template`)
      } else if (template.examCode.includes('JEE') || template.name.includes('JEE')) {
        newType = 'ai'
        console.log(`  📝 Setting type to 'ai' for JEE template`)
      } else if (template.examCode.includes('NEET') || template.name.includes('NEET')) {
        newType = 'ai'
        console.log(`  📝 Setting type to 'ai' for NEET template`)
      }
      
      // Check if this template should be conditional based on your description
      if (template.examCode === 'CLAT-2025') {
        newType = 'conditional' // You mentioned this was created as conditional
        console.log(`  📝 Setting type to 'conditional' for CLAT-2025 (as per your creation)`)
      }

      // Update the template with the new type and add placeholder data
      const updateData: any = {
        type: newType
      }

      // Add AI-specific data for AI templates
      if (newType === 'ai') {
        updateData.promptTemplate = `You are a percentile prediction expert for ${template.name}. Given a student score of {{score}} out of {{totalMarks}}, predict their likely percentile considering {{candidateCount}} expected candidates and {{difficulty}} paper difficulty.`
        updateData.placeholders = {
          examName: template.name,
          totalMarks: "150",
          candidateCount: "75000",
          difficulty: "Moderate",
          historicalAvg: "85"
        }
      }

      // Update the template
      const updated = await prisma.template.update({
        where: { id: template.id },
        data: updateData
      })

      console.log(`  ✅ Updated template type to: ${updated.type}`)
    }

    console.log('\n🎉 Template types updated successfully!')

    // Show updated templates
    const updatedTemplates = await prisma.template.findMany({
      select: {
        name: true,
        examCode: true,
        type: true,
        status: true
      }
    })

    console.log('\n📋 Updated templates:')
    updatedTemplates.forEach(template => {
      console.log(`  - ${template.name} (${template.examCode}): ${template.type}`)
    })

  } catch (error) {
    console.error('❌ Error updating template types:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateTemplateTypes()
  .catch((error) => {
    console.error('❌ Update failed:', error)
    process.exit(1)
  })
