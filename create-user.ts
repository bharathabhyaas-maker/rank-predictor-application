import { prisma } from './lib/database'
import * as bcrypt from 'bcryptjs'

async function createTestUser() {
  try {
    console.log('🔐 Creating test admin user...')
    
    // Clear existing users
    await prisma.user.deleteMany()
    console.log('✅ Cleared existing users')
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@rankpredictor.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Created admin user:', adminUser.email)
    console.log('📋 Login Credentials:')
    console.log('   Email: admin@rankpredictor.com')
    console.log('   Password: admin123')
    console.log('   Role: SUPER_ADMIN')
    
  } catch (error) {
    console.error('❌ Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
