import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    console.log('🔍 Creating default super admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@rankpredict.com',
        role: 'ADMIN'
      }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        email: existingAdmin.email,
        name: existingAdmin.name
      })
    }
    
    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@rankpredict.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Super admin user created successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Super admin user created successfully',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      },
      credentials: {
        email: 'admin@rankpredict.com',
        password: 'admin123'
      }
    })
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}
