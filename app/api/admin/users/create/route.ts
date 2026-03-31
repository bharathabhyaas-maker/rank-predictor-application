import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/database'
import bcrypt from 'bcryptjs'

interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'ANALYST' | 'MANAGER'
}

export async function POST(request: NextRequest) {
  try {
    console.log('👥 Admin: Creating new user...')
    
    const body: CreateUserRequest = await request.json()
    console.log('📋 User creation request:', { ...body, password: '[REDACTED]' })
    
    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, role' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['ADMIN', 'ANALYST', 'MANAGER']
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: ADMIN, ANALYST, MANAGER' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    console.log('✅ User created successfully:', user)

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase().replace('_', '-'),
        createdAt: user.createdAt
      },
      loginCredentials: {
        email: body.email,
        password: body.password,
        role: body.role.toLowerCase().replace('_', '-')
      }
    })

  } catch (error) {
    console.error('❌ Error creating user:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to list all admin users (for super admin)
export async function GET() {
  try {
    console.log('👥 Admin: Fetching users...')
    
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'ANALYST', 'MANAGER', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📊 Found users:', users.length)

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase().replace('_', '-'),
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }))
    })

  } catch (error) {
    console.error('❌ Error fetching users:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
