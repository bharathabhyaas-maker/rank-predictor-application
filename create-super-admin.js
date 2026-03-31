const { PrismaClient } = require('./src/generated/prisma/client/index.js');
const bcrypt = require('bcryptjs');

// Simple Prisma client without adapter for seeding
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/rank_predictor'
    }
  }
});

async function createSuperAdmin() {
  try {
    console.log('🔍 Checking for existing super admin...');
    
    // Check if super admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: 'admin@rankpredict.com' }
    });

    if (existingAdmin) {
      console.log('✅ Super Admin already exists:', existingAdmin.id);
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('🔑 Has Password:', !!existingAdmin.password);
      console.log('🔒 Is Hashed:', existingAdmin.password?.startsWith('$2'));
      return existingAdmin.id;
    }

    console.log('🔑 Creating super admin user...');
    
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
    console.log('🔒 Password Hash:', admin.password.substring(0, 20) + '...');
    
    return admin.id;
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    console.error('💥 Error details:', error.message);
    
    // Try alternative approach with plain text password
    if (error.message.includes('SASL') || error.message.includes('password')) {
      console.log('🔄 Trying with plain text password...');
      try {
        const admin = await prisma.user.create({
          data: {
            email: 'admin@rankpredict.com',
            name: 'Super Admin',
            password: 'admin123', // Plain text for now
            role: 'SUPER_ADMIN'
          }
        });
        
        console.log('✅ Super Admin created with plain text password!');
        console.log('📧 Email: admin@rankpredict.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: SUPER_ADMIN');
        console.log('🆔 ID:', admin.id);
        
        return admin.id;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError.message);
      }
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createSuperAdmin()
  .then(() => {
    console.log('🎉 Super admin creation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Creation failed:', error.message);
    process.exit(1);
  });
