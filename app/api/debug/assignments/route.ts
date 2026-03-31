import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Function to load environment variables manually
function loadEnvironmentVariables() {
  if (!process.env.DATABASE_URL) {
    try {
      const fs = require('fs')
      const path = require('path')
      const envLocalPath = path.join(process.cwd(), '.env.local')
      const envPath = path.join(process.cwd(), '.env')
      
      // Try .env.local first, then .env
      let envContent = ''
      if (fs.existsSync(envLocalPath)) {
        envContent = fs.readFileSync(envLocalPath, 'utf8')
        console.log('Loading from .env.local')
      } else if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8')
        console.log('Loading from .env')
      } else {
        console.log('No .env.local or .env file found')
      }
      
      // Remove BOM from the entire content
      envContent = envContent.replace(/^\uFEFF/, '')
      
      // Parse .env file and set environment variables
      envContent.split('\n').forEach((line: string) => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...values] = trimmedLine.split('=')
          if (key && values.length > 0) {
            let value = values.join('=').trim()
            value = value.replace(/^"|"$/g, '') // Remove quotes
            // Remove BOM from key if present
            const cleanKey = key.replace(/^\uFEFF/, '').trim()
            process.env[cleanKey] = value
          }
        }
      })
      
      console.log('Manually loaded DATABASE_URL from env file:', !!process.env.DATABASE_URL)
    } catch (error) {
      console.error('Failed to load env file:', error)
    }
  }
}

// Initialize Prisma client
function getPrismaClient() {
  loadEnvironmentVariables()
  return new PrismaClient()
}

export async function GET(request: NextRequest) {
  
  try {
    console.log('🔍 Debugging template assignments...')
    
    // Get all institutions
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        institutionId: true
      }
    })
    
    console.log('📋 All institutions:')
    institutions.forEach(inst => {
      console.log(`  - ${inst.name} (ID: ${inst.id}, institutionId: ${inst.institutionId})`)
    })
    
    // Get all template assignments
    const assignments = await prisma.institutionTemplate.findMany({
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
            examCode: true,
            status: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })
    
    console.log(`\n📋 All template assignments (${assignments.length}):`)
    assignments.forEach((assignment: any) => {
      console.log(`  - Template: ${assignment.template.name} (${assignment.template.id})`)
      console.log(`    → Institution: ${assignment.institution.name} (${assignment.institution.id})`)
      console.log(`    → Status: ${assignment.status}`)
      console.log(`    → Assigned: ${assignment.assignedAt}`)
      console.log('')
    })
    
    // Specifically check Gyanville Academy
    const gyanville = institutions.find(inst => 
      inst.name.toLowerCase().includes('gyanville') || 
      inst.name.toLowerCase().includes('academy')
    )
    
    if (gyanville) {
      console.log(`🎯 Checking assignments for: ${gyanville.name}`)
      const gyanvilleAssignments = assignments.filter(a => a.institutionId === gyanville.id)
      console.log(`  Found ${gyanvilleAssignments.length} assignments:`)
      gyanvilleAssignments.forEach((assignment: any) => {
        console.log(`    - ${assignment.template.name} (${assignment.status})`)
      })
    } else {
      console.log('❌ No institution found with "Gyanville" or "Academy" in name')
    }
    
    return NextResponse.json({
      institutions,
      assignments,
      gyanvilleAssignments: gyanville ? assignments.filter(a => a.institutionId === gyanville.id) : []
    })
  } catch (error) {
    console.error('❌ Failed to debug assignments:', error)
    return NextResponse.json(
      { 
        error: 'Failed to debug assignments',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
