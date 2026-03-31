import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { institutionId, password } = await request.json()

    if (!institutionId || !password) {
      return NextResponse.json({
        success: false,
        error: 'Institution ID and password are required'
      }, { status: 400 })
    }

    // Find institution by institutionId
    const institution = await prisma.institution.findUnique({
      where: {
        institutionId: institutionId.toUpperCase()
      },
      include: {
        users: {
          where: {
            role: 'INSTITUTION'
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true
          }
        }
      }
    })

    if (!institution) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Institution ID or Password'
      }, { status: 401 })
    }

    // Check if institution is active
    if (institution.status !== 'ACTIVE') {
      return NextResponse.json({
        success: false,
        error: 'Your institution account is not active. Please contact support.'
      }, { status: 401 })
    }

    // Get the institution user account (manager)
    const institutionUser = institution.users[0]
    if (!institutionUser) {
      return NextResponse.json({
        success: false,
        error: 'User account not found. Please contact support.'
      }, { status: 401 })
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, institutionUser.password)
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid Institution ID or Password'
      }, { status: 401 })
    }

    // Update last login
    await prisma.user.update({
      where: { id: institutionUser.id },
      data: { lastLoginAt: new Date() }
    })

    console.log('✅ Institution login successful:', institution.name)

    // Return success with user info
    return NextResponse.json({
      success: true,
      user: {
        id: institutionUser.id,
        email: institutionUser.email,
        name: institutionUser.name,
        role: 'institution',
        institutionId: institution.id,
        institutionName: institution.name
      }
    })

  } catch (error) {
    console.error('Institution login error:', error)
    return NextResponse.json({
      success: false,
      error: 'An error occurred during login'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
