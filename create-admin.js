require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // First, let's try to connect and see what happens
    await prisma.$connect();
    console.log('Connected to database');
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@rankpredictor.com',
        name: 'System Admin',
        password: 'admin123', // In production, this should be hashed
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    
    console.log('Admin user created:', admin.id);
    return admin.id;
  } catch (error) {
    console.error('Error:', error.message);
    
    // Try to find existing admin
    try {
      const existingAdmin = await prisma.user.findFirst({
        where: { email: 'admin@rankpredictor.com' }
      });
      if (existingAdmin) {
        console.log('Admin user already exists:', existingAdmin.id);
        return existingAdmin.id;
      }
    } catch (findError) {
      console.error('Error finding admin:', findError.message);
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
