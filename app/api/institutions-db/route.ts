import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// AGGRESSIVE ENVIRONMENT LOADING - Load immediately at module level
const fs = require('fs')
const path = require('path')

console.log('🔧 AGGRESSIVE: Loading environment variables at module level...')

// Try .env.local first, then .env
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

let envLoaded = false
let loadedFile = ''

if (fs.existsSync(envLocalPath)) {
  console.log('📁 Found .env.local file')
  const envContent = fs.readFileSync(envLocalPath, 'utf8')
  envContent.split('\n').forEach((line: string) => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...values] = trimmedLine.split('=')
      if (key && values.length > 0) {
        let value = values.join('=').trim()
        // Remove quotes if present
        value = value.replace(/^"|"$/g, '')
        process.env[key.trim()] = value
        
        if (key.trim() === 'DATABASE_URL') {
          console.log('📡 DATABASE_URL loaded:', value.substring(0, 20) + '...')
        }
      }
    }
  })
  envLoaded = true
  loadedFile = '.env.local'
  console.log('✅ Environment variables loaded from .env.local')
} else if (fs.existsSync(envPath)) {
  console.log('📁 Found .env file')
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach((line: string) => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...values] = trimmedLine.split('=')
      if (key && values.length > 0) {
        let value = values.join('=').trim()
        // Remove quotes if present
        value = value.replace(/^"|"$/g, '')
        process.env[key.trim()] = value
        
        if (key.trim() === 'DATABASE_URL') {
          console.log('📡 DATABASE_URL loaded:', value.substring(0, 20) + '...')
        }
      }
    }
  })
  envLoaded = true
  loadedFile = '.env'
  console.log('✅ Environment variables loaded from .env')
} else {
  console.error('❌ No .env or .env.local file found')
  console.error('❌ Searched paths:', envLocalPath, envPath)
}

console.log(`📊 Environment status: ${envLoaded ? 'LOADED' : 'NOT LOADED'} from ${loadedFile}`)
console.log(`📡 DATABASE_URL exists:`, !!process.env.DATABASE_URL)
console.log(`📡 DATABASE_URL length:`, process.env.DATABASE_URL?.length || 0)

// Create Prisma client after environment is loaded
let prisma: PrismaClient

if (process.env.DATABASE_URL) {
  try {
    prisma = new PrismaClient()
    console.log('✅ Prisma client created successfully')
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error)
    prisma = null as any
  }
} else {
  console.error('❌ Cannot create Prisma client - DATABASE_URL not available')
  prisma = null as any
}

export async function GET() {
  try {
    console.log('🔍 GET: Fetching institutions from database...')
    
    if (!prisma) {
      return NextResponse.json(
        { 
          error: 'Database client not available',
          details: 'Prisma client could not be created'
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
  console.log('📝 POST: Creating institution...')
  
  try {
    if (!prisma) {
      return NextResponse.json(
        { 
          error: 'Database client not available',
          details: 'Prisma client could not be created'
        },
        { status: 500 }
      )
    }
    
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
    
    // Check what's in the database
    console.log('🔍 DEBUG: Checking existing institutions...')
    const allInstitutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        institutionId: true
      }
    })
    
    console.log('📊 DEBUG: All institutions in database:')
    allInstitutions.forEach(inst => {
      console.log(`  - ${inst.name} (${inst.email})`)
    })
    
    // Check if institution with this email already exists
    const existingInstitution = await prisma.institution.findUnique({
      where: { email: body.email }
    })
    
    console.log('🔍 DEBUG: Existing institution check result:', existingInstitution ? 'FOUND' : 'NOT FOUND')
    
    if (existingInstitution) {
      console.error('❌ Institution with this email already exists:', body.email)
      console.log('📋 DEBUG: Existing institution details:', existingInstitution)
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
    if (!prisma) {
      return NextResponse.json(
        { 
          error: 'Database client not available',
          details: 'Prisma client could not be created'
        },
        { status: 500 }
      )
    }
    
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
