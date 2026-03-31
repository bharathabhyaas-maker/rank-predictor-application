import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Super Admin Login - Starting authentication...')
    
    const { email, password } = await request.json()
    
    if (!email || !password) {
      console.log('❌ Super Admin Login - Missing credentials')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Super Admin Login - Looking up user:', email)
    
    // Find user with ADMIN role
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        lastLoginAt: true,
        createdAt: true
      }
    })
    
    if (!user) {
      console.log('❌ Super Admin Login - User not found or not admin')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    console.log('✅ Super Admin Login - User found:', user.email)
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Super Admin Login - Invalid password')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    console.log('✅ Super Admin Login - Password verified')
    
    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    console.log('✅ Super Admin Login - Login successful')
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: {
        ...userWithoutPassword,
        role: 'super-admin' // Map to frontend role
      },
      message: 'Login successful'
    })
    
  } catch (error) {
    console.error('❌ Super Admin Login - Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
