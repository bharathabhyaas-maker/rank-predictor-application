import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Super Admin Forgot Password - Starting process...')
    
    const { email } = await request.json()
    
    if (!email) {
      console.log('❌ Super Admin Forgot Password - Email required')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Super Admin Forgot Password - Looking up admin:', email)
    
    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })
    
    if (!admin) {
      console.log('❌ Super Admin Forgot Password - Admin not found')
      return NextResponse.json(
        { error: 'Email not found in system' },
        { status: 404 }
      )
    }
    
    console.log('✅ Super Admin Forgot Password - Admin found:', admin.email)
    
    // Generate OTP (in production, this would be sent via email)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP in database (you might want to add an otpResetTokens table)
    // For now, we'll just log it
    console.log('✅ Super Admin Forgot Password - Generated OTP:', otp)
    
    // In production, you would:
    // 1. Store OTP with expiration
    // 2. Send email with OTP
    // 3. Return success message
    
    return NextResponse.json({
      success: true,
      message: 'Password reset code sent to your email',
      // For demo purposes only - remove in production
      debugOtp: otp,
      adminEmail: admin.email,
      adminName: admin.name
    })
    
  } catch (error) {
    console.error('❌ Super Admin Forgot Password - Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
