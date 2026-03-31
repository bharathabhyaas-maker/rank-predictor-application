import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Simple database solution - use Prisma with direct environment setting
const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('🔍 SIMPLE: Fetching institutions from database...')
    
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
  console.log('📝 SIMPLE: Creating institution in database...')
  
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
    
    // Generate credentials
    const institutionId = `IID${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
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
