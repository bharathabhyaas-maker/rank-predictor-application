import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Load environment variables manually if needed
if (!process.env.DATABASE_URL) {
  try {
    const fs = require('fs')
    const path = require('path')
    const envPath = path.join(process.cwd(), '.env')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    // Parse .env file and set environment variables
    envContent.split('\n').forEach((line: string) => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...values] = trimmedLine.split('=')
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim()
        }
      }
    })
    
    console.log('Manually loaded DATABASE_URL from .env file')
  } catch (error) {
    console.error('Failed to load .env file:', error)
  }
}

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('DATABASE_URL after manual load:', !!process.env.DATABASE_URL)
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          details: 'DATABASE_URL is still not available after manual load',
          troubleshooting: [
            'Check if .env file exists in project root',
            'Verify DATABASE_URL format in .env file',
            'Restart development server after changes'
          ]
        },
        { status: 500 }
      )
    }
    
    const institutions = await prisma.institution.findMany({
      include: {
        users: {
          where: {
            role: 'INSTITUTION'
          }
        },
        assignedTemplates: {
          include: {
            template: true
          }
        },
        predictions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${institutions.length} institutions`)

    const institutionStats = institutions.map((inst: any) => ({
      id: inst.id,
      institutionId: inst.institutionId,
      name: inst.name,
      email: inst.email,
      location: inst.location || '',
      students: inst.currentStudents,
      templatesAssigned: inst.assignedTemplates.length,
      predictions: inst.predictions.length,
      status: inst.status.toLowerCase(),
      joinedDate: inst.createdAt.toISOString().split('T')[0],
      plan: inst.plan
    }))

    return NextResponse.json(institutionStats)
  } catch (error) {
    console.error('Failed to fetch institutions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch institutions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
