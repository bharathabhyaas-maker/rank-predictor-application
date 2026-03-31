import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as pg from "pg"
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function seedSuperAdmin() {
  try {
    console.log('🔍 Creating Super Admin credentials...\n');
    
    // Super admin credentials
    const superAdminEmail = 'superadmin@rankpredictor.com';
    const superAdminPassword = 'SuperAdmin123!';
    
    console.log('📋 Super Admin Details:');
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Password: ${superAdminPassword}`);
    console.log(`   Role: SUPER_ADMIN\n`);
    
    // Check if super admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { email: superAdminEmail }
    })

    if (existingAdmin) {
      console.log('⚠️ Super Admin already exists!');
      console.log('📝 Existing credentials:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Password: Use the password from this script or reset if needed\n`);
      console.log('🔑 LOGIN CREDENTIALS:');
      console.log('===================');
      console.log(`Email: ${superAdminEmail}`);
      console.log(`Password: ${superAdminPassword}`);
      console.log(`Role: SUPER_ADMIN`);
      console.log('\n🌐 Login at: http://localhost:3000/auth/super-admin/login');
      return existingAdmin.id
    }

    console.log('🔑 Creating super admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10)

    // Create super admin user
    const admin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: 'Super Admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        institutionId: null // Super admin doesn't belong to an institution
      }
    })

    console.log('✅ Super Admin user created successfully!');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('===================');
    console.log(`Email: ${superAdminEmail}`);
    console.log(`Password: ${superAdminPassword}`);
    console.log(`Role: SUPER_ADMIN`);
    console.log(`User ID: ${admin.id}`);
    console.log('\n📝 Save these credentials securely!');
    console.log('🌐 Login at: http://localhost:3000/auth/super-admin/login');
    
    return admin.id
  } catch (error) {
    console.error('❌ Error seeding super admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedSuperAdmin()
  .then(() => {
    console.log('\n🎉 Super admin seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  })
