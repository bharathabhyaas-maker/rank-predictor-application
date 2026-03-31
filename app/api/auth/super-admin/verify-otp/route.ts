import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Super Admin Verify OTP - Starting verification...')
    
    const { email, otp } = await request.json()
    
    if (!email || !otp) {
      console.log('❌ Super Admin Verify OTP - Missing fields')
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Super Admin Verify OTP - Verifying for:', email)
    
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
      console.log('❌ Super Admin Verify OTP - Admin not found')
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      )
    }
    
    // For demo purposes, we'll accept any 6-digit OTP
    // In production, you would:
    // 1. Check against stored OTP in database
    // 2. Verify OTP hasn't expired
    // 3. Mark OTP as used
    
    const isValidOtp = /^\d{6}$/.test(otp)
    
    if (!isValidOtp) {
      console.log('❌ Super Admin Verify OTP - Invalid OTP format')
      return NextResponse.json(
        { error: 'Invalid OTP format' },
        { status: 400 }
      )
    }
    
    console.log('✅ Super Admin Verify OTP - OTP verified successfully')
    
    return NextResponse.json({
      success: true,
      message: 'OTP verified! You can now reset your password.',
      // In production, you would return a reset token
      resetToken: 'demo-reset-token'
    })
    
  } catch (error) {
    console.error('❌ Super Admin Verify OTP - Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
