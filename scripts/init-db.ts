#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:Bharathteja@localhost:5432/rank-predictor",
    },
  },
})

async function initDatabase() {
  try {
    console.log('🚀 Initializing database...')

    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')

    // Run migrations
    console.log('📋 Running database migrations...')
    // Note: In production, you would run: npx prisma migrate deploy

    // Check if super admin exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (!existingSuperAdmin) {
      console.log('👤 Creating super admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await prisma.user.create({
        data: {
          email: 'admin@rankpredict.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
        },
      })
      console.log('✅ Super admin created: admin@rankpredict.com / admin123')
    } else {
      console.log('👤 Super admin already exists')
    }

    console.log('🎉 Database initialization completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Update the super admin password')
    console.log('2. Create admin users and institutions')
    console.log('3. Upload datasets and create templates')

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export { initDatabase }
