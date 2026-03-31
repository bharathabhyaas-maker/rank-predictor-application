import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, name, password } = await request.json()
    
    console.log('🔧 Fixing Vinay account...')
    
    // Check if team member exists
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        email: email.toLowerCase()
      }
    })
    
    if (!teamMember) {
      return NextResponse.json({
        success: false,
        error: 'Team member not found'
      })
    }
    
    console.log('✅ Found team member:', teamMember.name)
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() }
    })
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User account already exists'
      })
    }
    
    // Get default institution
    const defaultInstitution = await prisma.institution.findFirst({
      where: { institutionId: 'TEAM-MEMBERS' }
    })
    
    if (!defaultInstitution) {
      return NextResponse.json({
        success: false,
        error: 'Default institution not found'
      })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Map role from TeamMember to User
    let userRole = 'STUDENT'
    if (teamMember.role === 'ADMIN') {
      userRole = 'ADMIN'
    } else if (teamMember.role === 'MANAGER') {
      userRole = 'INSTITUTION'
    }
    
    // Create user account
    const userAccount = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword,
        role: userRole,
        institutionId: defaultInstitution.id
      }
    })
    
    console.log('✅ User account created successfully:', userAccount.id)
    
    return NextResponse.json({
      success: true,
      message: 'Vinay account created successfully',
      user: {
        id: userAccount.id,
        email: userAccount.email,
        name: userAccount.name,
        role: userAccount.role
      },
      teamMember: {
        id: teamMember.id,
        email: teamMember.email,
        name: teamMember.name,
        role: teamMember.role
      }
    })
    
  } catch (error) {
    console.error('❌ Error fixing Vinay:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
