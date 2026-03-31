import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  console.log('🔐 Login API: Request received')
  
  try {
    const { email, password, role } = await request.json()
    console.log('🔐 Login API: Parsed request data:', { email, role, passwordLength: password?.length })
    
    if (!email || !password || !role) {
      console.log('🔐 Login API: Missing required fields')
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Find user by email or institutionId (for institutions)
    let user;
    
    if (role === 'institution') {
      // For institutions, find by email only
      user = await prisma.user.findFirst({
        where: {
          role: 'INSTITUTION',
          email: email
        },
        include: {
          institution: true
        }
      })
    } else if (role === 'super-admin' || role === 'admin') {
      // For admin roles, find by email only
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          institution: true
        }
      })
    } else {
      // For generic login, find by email
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          institution: true
        }
      })
    }

    console.log('🔐 Login API - Found user:', user?.email, 'Role:', user?.role)
    console.log('🔐 Login API - User institution:', user?.institution)
    console.log('🔐 Login API - User institutionId:', user?.institutionId)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password (handle both plain text and hashed passwords)
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2')) {
      // Password is hashed, use bcrypt comparison
      isPasswordValid = await bcrypt.compare(password, user.password)
      console.log('🔐 Login: Using bcrypt comparison for hashed password')
    } else {
      // Password is plain text, use direct comparison
      isPasswordValid = password === user.password
      console.log('🔐 Login: Using direct comparison for plain text password')
    }
    
    console.log('🔐 Login: Password validation result:', isPasswordValid)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if role matches
    const normalizedRole = role.toUpperCase().replace('-', '_')
    const userRole = user.role.toUpperCase()
    
    // Only allow admin roles (super admin, admin, analyst, manager) and institution roles
    if (!['SUPER_ADMIN', 'ADMIN', 'ANALYST', 'MANAGER', 'INSTITUTION'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 401 }
      )
    }
    
    // For admin users, allow login if they provide any admin role or no role (auto-detect)
    if (['SUPER_ADMIN', 'ADMIN', 'ANALYST', 'MANAGER'].includes(userRole)) {
      if (role !== 'generic' && normalizedRole !== userRole) {
        // If they specified a role but it doesn't match, still allow if they're admin user
        console.log('🔐 Login: Admin user with mismatched role, but allowing login')
      }
    } else if (role !== 'generic' && normalizedRole !== userRole) {
      // For non-admin users, roles must match exactly
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 401 }
      )
    }

    // Return user data with institution details
    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase().replace('_', '-'),
        institutionId: user.institutionId
      },
      institution: user.institution ? {
        id: user.institution.id,
        name: user.institution.name,
        email: user.institution.email,
        location: user.institution.location,
        phone: user.institution.phone,
        plan: user.institution.plan,
        status: user.institution.status,
        institutionId: user.institution.institutionId
      } : null
    }

    console.log('🔐 Login API - Response data:', responseData)
    console.log('🔐 Login API - Institution in response:', responseData.institution?.name)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('🔐 Login API - Error:', error)
    console.error('🔐 Login API - Error type:', typeof error)
    console.error('🔐 Login API - Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    // Ensure we always return JSON, never HTML
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
