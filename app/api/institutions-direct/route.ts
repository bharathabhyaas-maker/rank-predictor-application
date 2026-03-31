import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for created institutions (temporary solution)
let createdInstitutions = [
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

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/institutions-direct called')
    
    const body = await request.json()
    console.log('Creating institution with data:', body)
    
    // Validate required fields
    if (!body.name || !body.email || !body.location) {
      console.error('Missing required fields:', { name: !!body.name, email: !!body.email, location: !!body.location })
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
    
    console.log('Generated credentials:', { institutionId, password: '***' })
    
    // Create the new institution
    const newInstitution = {
      id: Date.now(), // Use timestamp as unique ID
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
    
    // Add to our in-memory storage
    createdInstitutions.push({
      id: newInstitution.id,
      institutionId: newInstitution.institutionId,
      name: newInstitution.name,
      email: newInstitution.email,
      location: newInstitution.location,
      students: newInstitution.students,
      templatesAssigned: newInstitution.templatesAssigned,
      predictions: newInstitution.predictions,
      status: newInstitution.status,
      joinedDate: newInstitution.joinedDate,
      plan: newInstitution.plan
    })
    
    console.log('✓ Institution created successfully and added to storage:', newInstitution.id)
    console.log('✓ Total institutions in storage:', createdInstitutions.length)
    
    return NextResponse.json(newInstitution, { status: 201 })
    
  } catch (error) {
    console.error('✗ Failed to create institution:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create institution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('GET /api/institutions-direct called')
    console.log('✓ Returning institutions from storage:', createdInstitutions.length)
    
    // Return all institutions including newly created ones
    return NextResponse.json(createdInstitutions)
    
  } catch (error) {
    console.error('✗ Failed to fetch institutions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch institutions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
