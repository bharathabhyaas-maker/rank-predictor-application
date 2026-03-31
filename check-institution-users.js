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

async function checkInstitutionUsers() {
  try {
    console.log('🔍 Checking institution users and their assignments...');
    
    // Find all institution users
    const institutionUsers = await prisma.user.findMany({
      where: {
        role: 'INSTITUTION'
      },
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
    
    console.log(`📊 Found ${institutionUsers.length} institution users:`);
    institutionUsers.forEach(user => {
      console.log(`  User: ${user.name} (${user.email})`);
      console.log(`    Role: ${user.role}`);
      console.log(`    InstitutionId from user record: ${user.institutionId}`);
      console.log(`    Institution from relation: ${user.institution?.name} (${user.institution?.institutionId})`);
      console.log(`    ---`);
    });
    
    // For each institution user, check their assigned templates
    for (const user of institutionUsers) {
      if (user.institutionId) {
        console.log(`\n🔍 Checking templates for ${user.name}'s institution (${user.institutionId})...`);
        
        const assignedTemplates = await prisma.institutionTemplate.findMany({
          where: {
            institutionId: user.institutionId,
            status: 'ACTIVE'
          },
          include: {
            template: {
              select: {
                id: true,
                name: true,
                examCode: true,
                status: true
              }
            }
          }
        });
        
        console.log(`  Found ${assignedTemplates.length} assigned templates:`);
        assignedTemplates.forEach(at => {
          console.log(`    - ${at.template.name} (${at.template.examCode}) - Status: ${at.status}`);
        });
      }
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkInstitutionUsers();
