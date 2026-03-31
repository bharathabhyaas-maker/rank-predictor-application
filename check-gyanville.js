// Check Gyanville Academy login credentials
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkInstitutionCredentials() {
  try {
    console.log('🔍 Checking Gyanville Academy credentials...\n');
    
    // Find institution by name
    const institution = await prisma.institution.findFirst({
      where: {
        name: {
          contains: 'Gyanville',
          mode: 'insensitive'
        }
      },
      include: {
        users: {
          where: {
            role: 'INSTITUTION'
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true, // This will be hashed, but we can see the email
            role: true,
            createdAt: true
          }
        }
      }
    });
    
    if (institution) {
      console.log('✅ Found Gyanville Academy:');
      console.log(`   Name: ${institution.name}`);
      console.log(`   Email: ${institution.email}`);
      console.log(`   Institution ID: ${institution.institutionId}`);
      console.log(`   Status: ${institution.status}`);
      console.log(`   Created: ${institution.createdAt}`);
      
      if (institution.users && institution.users.length > 0) {
        const user = institution.users[0];
        console.log(`   User Email: ${user.email}`);
        console.log(`   User Name: ${user.name}`);
        console.log(`   User Role: ${user.role}`);
        console.log(`   User Created: ${user.createdAt}`);
        console.log('\n🔑 LOGIN CREDENTIALS:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Institution ID: ${institution.institutionId}`);
        console.log(`   Password: [The password set during creation]`);
      } else {
        console.log('❌ No institution user account found!');
      }
    } else {
      console.log('❌ Gyanville Academy not found in database');
      
      // List all institutions to help debug
      const allInstitutions = await prisma.institution.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          institutionId: true,
          status: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      
      console.log('\n📋 Recent Institutions (last 5):');
      allInstitutions.forEach(inst => {
        console.log(`   ${inst.name} (${inst.email}) - ${inst.institutionId}`);
      });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkInstitutionCredentials();
