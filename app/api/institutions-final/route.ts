import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Set DATABASE_URL directly from .env.local
const fs = require('fs')
const path = require('path')

try {
  const envLocalPath = path.join(process.cwd(), '.env.local')
  
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8')
    const lines = envContent.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('DATABASE_URL=')) {
        let databaseUrl = line.split('=')[1].trim()
        // Remove quotes if present
        databaseUrl = databaseUrl.replace(/^"|"$/g, '')
        
        console.log('🔧 Setting DATABASE_URL directly:', databaseUrl.substring(0, 20) + '...')
        
        // Set DATABASE_URL directly in process.env
        process.env.DATABASE_URL = databaseUrl
        
        // Also set it for Prisma
        process.env.POSTGRES_PRISMA_URL = databaseUrl
        
        break
      }
    }
  }
} catch (error) {
  console.error('❌ Failed to load DATABASE_URL:', error)
}

// Create Prisma client with DATABASE_URL set
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

export async function GET() {
  try {
    console.log('🔍 FINAL: Fetching institutions from database...')
    console.log('📡 DATABASE_URL available:', !!process.env.DATABASE_URL)
    
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { 
          error: 'Database configuration error',
          details: 'DATABASE_URL is not available'
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

    console.log(`✅ Found ${institutions.length} institutions in database`)

    const institutionStats = institutions.map((inst: any) => ({
      id: inst.id,
      institutionId: inst.institutionId,
      name: inst.name,
      email: inst.email,
      location: inst.location || '',
      students: inst.currentStudents || 0,
      templatesAssigned: inst.assignedTemplates?.length || 0,
      predictions: inst.predictions?.length || 0,
      status: inst.status?.toLowerCase() || 'active',
      joinedDate: inst.createdAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      plan: inst.plan || 'STANDARD'
    }))

    return NextResponse.json(institutionStats)
  } catch (error) {
    console.error('❌ Failed to fetch institutions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch institutions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('📝 FINAL: Creating institution in database...')
  
  try {
    const body = await request.json()
    console.log('📋 Creating institution with data:', body)
    
    // Validate required fields
    if (!body.name || !body.email || !body.location) {
      console.error('❌ Missing required fields:', { name: !!body.name, email: !!body.email, location: !!body.location })
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and location are required' },
        { status: 400 }
      )
    }
    
    // Generate credentials based on email
    const emailPrefix = body.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const institutionId = `${emailPrefix}${randomSuffix}`
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    console.log('🔑 Generated credentials:', { institutionId, password: '***' })
    
    // Check if institution with this email already exists
    const existingInstitution = await prisma.institution.findUnique({
      where: { email: body.email }
    })
    
    if (existingInstitution) {
      console.error('❌ Institution with this email already exists:', body.email)
      return NextResponse.json(
        { error: 'An institution with this email already exists' },
        { status: 409 }
      )
    }
    
    console.log('💾 Creating institution in database...')
    
    const institution = await prisma.institution.create({
      data: {
        name: body.name,
        email: body.email,
        location: body.location,
        plan: body.plan || 'STANDARD',
        contactPerson: body.contactPerson,
        phone: body.phone,
        institutionId: institutionId,
        password: password,
        status: 'ACTIVE'
      }
    })

    console.log('✅ Institution created successfully in database:', institution.id)

    // Create a user account for the institution with the same password
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.contactPerson || body.name,
        password: password,
        role: 'INSTITUTION',
        institutionId: institution.id
      }
    })

    console.log('✅ User created successfully in database:', user.id)

    return NextResponse.json({
      id: institution.id,
      institutionId: institution.institutionId,
      name: institution.name,
      email: institution.email,
      location: institution.location || '',
      students: 0,
      templatesAssigned: 0,
      predictions: 0,
      status: institution.status.toLowerCase(),
      joinedDate: institution.createdAt.toISOString().split('T')[0],
      plan: institution.plan,
      // Return the generated credentials for the admin to send to institution
      credentials: {
        institutionId: institution.institutionId,
        password: password
      }
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Failed to create institution:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create institution'
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'An institution with this email already exists'
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid user reference'
      } else if (error.message.includes('Database')) {
        errorMessage = 'Database connection error'
      } else {
        errorMessage = `Error: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    const institution = await prisma.institution.update({
      where: {
        id: body.id
      },
      data: {
        status: body.status.toUpperCase() as any
      }
    })

    return NextResponse.json({
      id: institution.id,
      institutionId: institution.institutionId,
      name: institution.name,
      email: institution.email,
      location: institution.location || '',
      students: institution.currentStudents || 0,
      templatesAssigned: 0,
      predictions: 0,
      status: institution.status.toLowerCase(),
      joinedDate: institution.createdAt.toISOString().split('T')[0],
      plan: institution.plan
    })
  } catch (error) {
    console.error('❌ Failed to update institution:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update institution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
