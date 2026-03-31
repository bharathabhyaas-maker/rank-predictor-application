const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Create admin user with plain text password (for testing)
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@rankpredictor.com',
        name: 'Super Admin',
        password: 'admin123', // Plain text for now
        role: 'SUPER_ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Created admin user:', adminUser.email);
    console.log('📋 Login Credentials:');
    console.log('   Email: admin@rankpredictor.com');
    console.log('   Password: admin123');
    console.log('   Role: SUPER_ADMIN');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2002') {
      console.log('ℹ️  User already exists');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
