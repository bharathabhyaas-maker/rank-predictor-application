import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Processing password change request...')
    
    const body = await request.json()
    const { institutionId, currentPassword, newPassword } = body
    
    console.log('🔐 Request data:', { institutionId, hasCurrentPassword: !!currentPassword, hasNewPassword: !!newPassword })
    
    // Validate required fields
    if (!institutionId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Find the user associated with this institution
    const user = await prisma.user.findFirst({
      where: { 
        institutionId: institutionId,
        role: 'INSTITUTION'
      },
      include: {
        institution: true
      }
    })
    
    if (!user) {
      console.log('❌ Institution user not found for institutionId:', institutionId)
      return NextResponse.json(
        { error: 'Institution user not found' },
        { status: 404 }
      )
    }
    
    console.log('🔐 Found user:', user.email, 'for institution:', user.institution?.name)
    console.log('🔐 Stored password format:', user.password.startsWith('$2') ? 'Hashed' : 'Plain text')
    console.log('🔐 Stored password length:', user.password.length)
    console.log('🔐 Current password provided:', currentPassword)
    
    // Verify current password (handle both plain text and hashed passwords)
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2')) {
      // Password is hashed, use bcrypt comparison
      isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      console.log('🔐 Using bcrypt comparison for hashed password')
    } else {
      // Password is plain text, use direct comparison
      isPasswordValid = currentPassword === user.password
      console.log('🔐 Using direct comparison for plain text password')
    }
    
    console.log('🔐 Password validation result:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ Current password does not match')
      console.log('❌ Expected password:', user.password)
      console.log('❌ Provided password:', currentPassword)
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }
    
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })
    
    console.log('✅ Password updated successfully for user:', user.email)
    
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    console.error('❌ Password change error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
