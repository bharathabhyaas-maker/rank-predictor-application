import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 FINAL: Institution login attempt')
    
    const { institutionId, password } = await request.json()
    console.log('📋 Login data:', { institutionId, password: '***' })
    
    // Validate required fields
    if (!institutionId || !password) {
      return NextResponse.json(
        { error: 'Institution ID and password are required' },
        { status: 400 }
      )
    }
    
    // Find institution by ID
    const institution = await prisma.institution.findUnique({
      where: {
        institutionId: institutionId
      },
      include: {
        users: {
          where: {
            role: 'INSTITUTION'
          }
        }
      }
    })
    
    if (!institution) {
      console.log('❌ Institution not found:', institutionId)
      return NextResponse.json(
        { error: 'Invalid institution ID or password' },
        { status: 401 }
      )
    }
    
    // Check if institution is active
    if (institution.status !== 'ACTIVE') {
      console.log('❌ Institution not active:', institutionId)
      return NextResponse.json(
        { error: 'Your institution account is not active. Please contact support.' },
        { status: 403 }
      )
    }
    
    // Get the institution user account
    const institutionUser = institution.users[0]
    
    if (!institutionUser) {
      console.log('❌ User account not found for institution:', institutionId)
      return NextResponse.json(
        { error: 'User account not found. Please contact support.' },
        { status: 401 }
      )
    }
    
    // Verify password (in production, you should hash passwords)
    if (institutionUser.password !== password) {
      console.log('❌ Invalid password for:', institutionId)
      return NextResponse.json(
        { error: 'Invalid institution ID or password' },
        { status: 401 }
      )
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: institutionUser.id },
      data: { lastLoginAt: new Date() }
    })
    
    console.log('✅ Institution login successful:', institution.name)
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: institutionUser.id,
        email: institution.email,
        name: institutionUser.name,
        role: institutionUser.role,
        institutionId: institution.id,
        institutionName: institution.name,
        institutionLoginId: institution.institutionId,
        institution: {
          id: institution.id,
          name: institution.name,
          email: institution.email,
          location: institution.location || '',
          phone: institution.phone || '',
          plan: institution.plan || 'standard',
          status: institution.status || 'active',
          contactPerson: institution.contactPerson || '',
          institutionId: institution.institutionId,
          createdAt: institution.createdAt.toISOString().split('T')[0]
        }
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
