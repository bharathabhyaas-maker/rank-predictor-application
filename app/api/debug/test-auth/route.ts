import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🧪 Testing authentication for:', email)
    
    // Find user by email
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase()
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
            phone: true,
            plan: true,
            status: true,
            institutionId: true
          }
        }
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({
        success: false,
        error: 'User not found',
        email: email
      })
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasInstitution: !!user.institution
    })
    
    // Test password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password')
      return NextResponse.json({
        success: false,
        error: 'Invalid password',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    }
    
    console.log('✅ Password valid')
    
    // Test role mapping
    let mappedRole = user.role.toLowerCase()
    if (user.role === "ADMIN") {
      mappedRole = "super-admin"
    } else if (user.role === "INSTITUTION") {
      mappedRole = "institution"
    } else if (user.role === "STUDENT") {
      mappedRole = "student"
    }
    
    console.log('🔄 Role mapping:', {
      original: user.role,
      mapped: mappedRole
    })
    
    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        originalRole: user.role,
        mappedRole: mappedRole,
        institution: user.institution
      }
    })
    
  } catch (error) {
    console.error('❌ Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
