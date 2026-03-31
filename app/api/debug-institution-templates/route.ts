import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Function to load environment variables
function loadEnvironmentVariables() {
  try {
    const { config } = require('dotenv')
    const path = require('path')
    
    const envPath = path.join(process.cwd(), '.env')
    const envLocalPath = path.join(process.cwd(), '.env.local')
    
    config({ path: envLocalPath })
    config({ path: envPath })
    
    console.log('✅ Environment variables loaded via dotenv')
  } catch (error) {
    console.error('❌ Failed to load environment variables:', error)
  }
}

loadEnvironmentVariables()

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
})

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
} as any)

export async function GET() {
  try {
    console.log('🔍 Debugging institution templates...')
    
    // Check institutions
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        institutionId: true,
        email: true
      }
    })
    
    console.log(`📊 Found ${institutions.length} institutions:`, institutions)
    
    // Check templates
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        examCode: true,
        status: true
      }
    })
    
    console.log(`📊 Found ${templates.length} templates:`, templates)
    
    // Check institution templates (assignments)
    const institutionTemplates = await prisma.institutionTemplate.findMany({
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            institutionId: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            examCode: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${institutionTemplates.length} institution-template assignments:`, institutionTemplates)
    
    // If no assignments exist, create some sample ones
    if (institutionTemplates.length === 0 && institutions.length > 0 && templates.length > 0) {
      console.log('🌱 Creating sample institution-template assignments...')
      
      const sampleAssignments = []
      
      // Assign first template to first institution
      if (institutions[0] && templates[0]) {
        const assignment = await prisma.institutionTemplate.create({
          data: {
            institutionId: institutions[0].id,
            templateId: templates[0].id,
            status: 'ACTIVE'
          }
        })
        sampleAssignments.push(assignment)
        console.log('✅ Created assignment:', assignment)
      }
      
      // Assign second template to first institution if exists
      if (institutions[0] && templates[1]) {
        const assignment = await prisma.institutionTemplate.create({
          data: {
            institutionId: institutions[0].id,
            templateId: templates[1].id,
            status: 'ACTIVE'
          }
        })
        sampleAssignments.push(assignment)
        console.log('✅ Created assignment:', assignment)
      }
      
      return NextResponse.json({
        message: 'Debug info and sample assignments created',
        institutions,
        templates,
        institutionTemplates: sampleAssignments,
        totalInstitutions: institutions.length,
        totalTemplates: templates.length,
        totalAssignments: sampleAssignments.length
      })
    }
    
    return NextResponse.json({
      message: 'Debug info',
      institutions,
      templates,
      institutionTemplates,
      totalInstitutions: institutions.length,
      totalTemplates: templates.length,
      totalAssignments: institutionTemplates.length
    })
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
