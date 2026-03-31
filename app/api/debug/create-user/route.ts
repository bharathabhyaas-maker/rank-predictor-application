import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('🔧 Debug: Creating test user...')
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@test.com' }
    })
    
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Test user already exists',
        user: {
          email: existingUser.email,
          role: existingUser.role,
          id: existingUser.id
        }
      })
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    })
    
    console.log('✅ Test user created:', user)
    
    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      loginCredentials: {
        email: 'admin@test.com',
        password: 'admin123',
        role: 'super-admin'
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to create test user:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
