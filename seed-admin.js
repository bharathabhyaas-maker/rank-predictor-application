require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  adapter: process.env.DATABASE_URL,
});

async function seedAdmin() {
  try {
    // Check if super admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@rankpredict.com' }
    });

    if (existingAdmin) {
      console.log('Super Admin user already exists:', existingAdmin.id);
      return existingAdmin.id;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create super admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@rankpredict.com',
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });

    console.log('✅ Super Admin user created successfully!');
    console.log('📧 Email: admin@rankpredict.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: SUPER_ADMIN');
    console.log('🆔 ID:', admin.id);
    
    return admin.id;
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
