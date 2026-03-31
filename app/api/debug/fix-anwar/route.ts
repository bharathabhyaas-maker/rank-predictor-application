import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    console.log('🔧 Fixing Anwar email mismatch...')
    
    // Find Anwar's user account with wrong email
    const wrongUser = await prisma.user.findFirst({
      where: { email: 'institution@admin.in' }
    })
    
    if (!wrongUser) {
      return NextResponse.json({
        success: false,
        error: 'User with institution@admin.in not found'
      })
    }
    
    console.log('Found user with wrong email:', wrongUser.email)
    
    // Check if the correct email already exists
    const existingCorrectUser = await prisma.user.findFirst({
      where: { email: 'anwarshaik0823@gmail.com' }
    })
    
    if (existingCorrectUser) {
      return NextResponse.json({
        success: false,
        error: 'User with anwarshaik0823@gmail.com already exists'
      })
    }
    
    // Update the user email to the correct one
    const updatedUser = await prisma.user.update({
      where: { id: wrongUser.id },
      data: {
        email: 'anwarshaik0823@gmail.com',
        name: 'Anwar'
      }
    })
    
    console.log('✅ Updated user email to:', updatedUser.email)
    
    return NextResponse.json({
      success: true,
      message: 'Anwar email updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    })
    
  } catch (error) {
    console.error('❌ Error fixing Anwar:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
