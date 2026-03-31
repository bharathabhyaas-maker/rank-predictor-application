const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  try {
    console.log('🔧 Creating Super Admin credentials...\n');

    // Super admin credentials
    const superAdminData = {
      name: 'Super Admin',
      email: 'superadmin@rankpredictor.com',
      password: 'SuperAdmin123!', // You can change this
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      institutionId: null // Super admin doesn't belong to an institution
    };

    console.log('📋 Super Admin Details:');
    console.log(`   Name: ${superAdminData.name}`);
    console.log(`   Email: ${superAdminData.email}`);
    console.log(`   Role: ${superAdminData.role}`);
    console.log(`   Password: ${superAdminData.password}`);
    console.log(`   Status: ${superAdminData.status}\n`);

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminData.email }
    });

    if (existingSuperAdmin) {
      console.log('⚠️ Super Admin already exists!');
      console.log('📝 Existing credentials:');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Role: ${existingSuperAdmin.role}`);
      console.log(`   Password: [Use the password from the seed script or reset if needed]\n`);
      
      // Option to update password
      console.log('🔄 Would you like to update the password? (Uncomment the code below)');
      console.log('// const hashedPassword = await bcrypt.hash(superAdminData.password, 10);');
      console.log('// await prisma.user.update({');
      console.log('//   where: { email: superAdminData.email },');
      console.log('//   data: { password: hashedPassword }');
      console.log('// });');
      
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        ...superAdminData,
        password: hashedPassword
      }
    });

    console.log('✅ Super Admin created successfully!');
    console.log(`   User ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Status: ${superAdmin.status}`);
    console.log(`   Created: ${superAdmin.createdAt}\n`);

    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('===================');
    console.log(`Email: ${superAdminData.email}`);
    console.log(`Password: ${superAdminData.password}`);
    console.log(`Role: ${superAdminData.role}`);
    console.log('\n📝 Save these credentials securely!');
    console.log('🌐 Use these to login at: http://localhost:3000/auth/super-admin/login');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Additional seed functions for other admin roles
async function seedOtherAdmins() {
  try {
    console.log('\n🔧 Creating additional admin users...\n');

    const adminUsers = [
      {
        name: 'Admin User',
        email: 'admin@rankpredictor.com',
        password: 'AdminUser123!',
        role: 'ADMIN'
      },
      {
        name: 'Analyst User',
        email: 'analyst@rankpredictor.com',
        password: 'AnalystUser123!',
        role: 'ANALYST'
      },
      {
        name: 'Manager User',
        email: 'manager@rankpredictor.com',
        password: 'ManagerUser123!',
        role: 'MANAGER'
      }
    ];

    for (const adminData of adminUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: adminData.email }
      });

      if (existingUser) {
        console.log(`⚠️ ${adminData.role} already exists: ${adminData.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      const user = await prisma.user.create({
        data: {
          ...adminData,
          password: hashedPassword,
          status: 'ACTIVE',
          institutionId: null // Admin users don't belong to institutions
        }
      });

      console.log(`✅ ${adminData.role} created:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${adminData.password}`);
      console.log(`   Role: ${user.role}\n`);
    }

    console.log('🔑 ALL ADMIN CREDENTIALS:');
    console.log('========================');
    adminUsers.forEach(admin => {
      console.log(`${admin.role}:`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error creating admin users:', error);
  }
}

// Main seed function
async function main() {
  console.log('🚀 Starting Super Admin Seed...\n');
  
  await seedSuperAdmin();
  await seedOtherAdmins();
  
  console.log('✅ Seed completed successfully!');
  console.log('\n📝 Next Steps:');
  console.log('1. Use the super admin credentials to login');
  console.log('2. Create institutions and templates');
  console.log('3. Test the permission-based access control');
}

// Run the seed
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { seedSuperAdmin, seedOtherAdmins };
