import { NextRequest, NextResponse } from 'next/server'

// Direct approach - bypass Prisma for now and use hardcoded connection
export async function GET() {
  try {
    console.log('🔍 Direct database test without Prisma...')
    
    // First, let's check if we can read the .env.local file
    const fs = require('fs')
    const path = require('path')
    const envLocalPath = path.join(process.cwd(), '.env.local')
    
    let databaseUrl = ''
    
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf8')
      console.log('📁 .env.local file found, content length:', envContent.length)
      
      // Extract DATABASE_URL (handle both with and without quotes)
      const lines = envContent.split('\n')
      for (const line of lines) {
        if (line.startsWith('DATABASE_URL=')) {
          databaseUrl = line.split('=')[1].trim()
          // Remove quotes if present
          databaseUrl = databaseUrl.replace(/^"|"$/g, '')
          console.log('📡 DATABASE_URL extracted, length:', databaseUrl.length)
          console.log('📡 DATABASE_URL starts with postgresql:', databaseUrl.startsWith('postgresql'))
          console.log('📡 DATABASE_URL preview:', databaseUrl.substring(0, 20) + '...')
          break
        }
      }
    } else {
      console.error('❌ .env.local file not found at:', envLocalPath)
      return NextResponse.json({
        error: 'Environment file not found',
        details: '.env.local file not found',
        path: envLocalPath
      }, { status: 500 })
    }
    
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in .env.local')
      return NextResponse.json({
        error: 'DATABASE_URL not found',
        details: 'DATABASE_URL not found in .env.local file'
      }, { status: 500 })
    }
    
    // For now, return mock data but with database connection info
    const mockInstitutions = [
      {
        id: 1,
        institutionId: 'IID0001',
        name: 'Delhi Career Academy',
        email: 'delhi@career.com',
        location: 'Delhi',
        students: 150,
        templatesAssigned: 3,
        predictions: 450,
        status: 'active',
        joinedDate: '2024-01-15',
        plan: 'Premium'
      },
      {
        id: 2,
        institutionId: 'IID0002',
        name: 'Mumbai Institute of Technology',
        email: 'mumbai@tech.edu',
        location: 'Mumbai',
        students: 200,
        templatesAssigned: 5,
        predictions: 800,
        status: 'active',
        joinedDate: '2024-02-20',
        plan: 'Enterprise'
      }
    ]
    
    console.log('✅ Returning mock institutions with database info')
    
    return NextResponse.json({
      institutions: mockInstitutions,
      databaseInfo: {
        databaseUrlFound: !!databaseUrl,
        databaseUrlLength: databaseUrl.length,
        databaseUrlFormat: databaseUrl.startsWith('postgresql') ? 'correct' : 'incorrect'
      }
    })
    
  } catch (error) {
    console.error('❌ Direct test failed:', error)
    return NextResponse.json({
      error: 'Direct test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Direct institution creation test...')
    
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
    
    // Create mock institution
    const newInstitution = {
      id: Date.now(),
      institutionId: institutionId,
      name: body.name,
      email: body.email,
      location: body.location,
      plan: body.plan || 'STANDARD',
      contactPerson: body.contactPerson,
      phone: body.phone,
      students: 0,
      templatesAssigned: 0,
      predictions: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      credentials: {
        institutionId: institutionId,
        password: password
      }
    }
    
    console.log('✅ Institution created successfully (mock):', newInstitution.id)
    
    return NextResponse.json(newInstitution, { status: 201 })
    
  } catch (error) {
    console.error('❌ Failed to create institution:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create institution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
