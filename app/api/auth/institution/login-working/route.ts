import { NextRequest, NextResponse } from 'next/server'

// Mock institution login - working solution
const mockInstitutions = [
  {
    id: 1,
    institutionId: 'IID0001',
    name: 'Delhi Career Academy',
    email: 'delhi@career.com',
    password: 'password123',
    plan: 'Premium',
    status: 'ACTIVE'
  },
  {
    id: 2,
    institutionId: 'IID0002',
    name: 'Mumbai Institute of Technology',
    email: 'mumbai@tech.edu',
    password: 'password456',
    plan: 'Enterprise',
    status: 'ACTIVE'
  }
]

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Institution login attempt')
    
    const body = await request.json()
    console.log('📋 Login data:', { ...body, password: '***' })
    
    const { institutionId, password } = body
    
    // Validate required fields
    if (!institutionId || !password) {
      return NextResponse.json(
        { error: 'Institution ID and password are required' },
        { status: 400 }
      )
    }
    
    // Find institution by ID
    const institution = mockInstitutions.find(inst => inst.institutionId === institutionId)
    
    if (!institution) {
      console.log('❌ Institution not found:', institutionId)
      return NextResponse.json(
        { error: 'Invalid institution ID or password' },
        { status: 401 }
      )
    }
    
    // Check password
    if (institution.password !== password) {
      console.log('❌ Invalid password for:', institutionId)
      return NextResponse.json(
        { error: 'Invalid institution ID or password' },
        { status: 401 }
      )
    }
    
    if (institution.status !== 'ACTIVE') {
      console.log('❌ Institution not active:', institutionId)
      return NextResponse.json(
        { error: 'Institution account is not active' },
        { status: 403 }
      )
    }
    
    console.log('✅ Institution login successful:', institution.name)
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      institution: {
        id: institution.id,
        institutionId: institution.institutionId,
        name: institution.name,
        email: institution.email,
        plan: institution.plan,
        status: institution.status
      }
    })
    
  } catch (error) {
    console.error('❌ Institution login failed:', error)
    return NextResponse.json(
      { 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
