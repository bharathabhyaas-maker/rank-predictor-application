const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function debugUsers() {
  try {
    console.log('🔍 Debugging users and their institution assignments...');
    
    // Check users with their institutions
    const users = await prisma.user.findMany({
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            institutionId: true,
            email: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  User: ${user.name} (${user.email})`);
      console.log(`    Role: ${user.role}`);
      console.log(`    InstitutionId: ${user.institutionId}`);
      console.log(`    Institution: ${user.institution ? user.institution.name : 'None'}`);
      console.log(`    ---`);
    });
    
    // Check if there are any users without proper institution assignments
    const usersWithoutInstitution = users.filter(user => !user.institutionId || !user.institution);
    
    if (usersWithoutInstitution.length > 0) {
      console.log(`❌ Found ${usersWithoutInstitution.length} users without proper institution assignments:`);
      usersWithoutInstitution.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - InstitutionId: ${user.institutionId}`);
      });
      
      // Fix the first user without institution by assigning them to the first institution
      if (usersWithoutInstitution.length > 0) {
        const userToFix = usersWithoutInstitution[0];
        const firstInstitution = await prisma.institution.findFirst();
        
        if (firstInstitution) {
          console.log(`🔧 Fixing user ${userToFix.name} by assigning to ${firstInstitution.name}...`);
          
          await prisma.user.update({
            where: { id: userToFix.id },
            data: { institutionId: firstInstitution.id }
          });
          
          console.log('✅ User institution assignment fixed!');
        }
      }
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

debugUsers();
