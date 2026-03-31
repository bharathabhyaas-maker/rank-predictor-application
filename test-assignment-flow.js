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

async function testAssignmentFlow() {
  try {
    console.log('🔍 Testing complete assignment flow...');
    
    // 1. Check all templates
    const templates = await prisma.template.findMany({
      include: {
        assignedTo: {
          include: {
            institution: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${templates.length} templates:`);
    templates.forEach(template => {
      console.log(`  Template: ${template.name} (${template.examCode})`);
      console.log(`    Assigned to ${template.assignedTo.length} institutions:`);
      template.assignedTo.forEach(assignment => {
        console.log(`      - ${assignment.institution.name} (${assignment.institution.institutionId}) - Status: ${assignment.status}`);
      });
      console.log(`    ---`);
    });
    
    // 2. Check all institutions
    const institutions = await prisma.institution.findMany({
      include: {
        assignedTemplates: {
          include: {
            template: true
          }
        }
      }
    });
    
    console.log(`\n📊 Found ${institutions.length} institutions:`);
    institutions.forEach(institution => {
      console.log(`  Institution: ${institution.name} (${institution.institutionId})`);
      console.log(`    Has ${institution.assignedTemplates.length} templates:`);
      institution.assignedTemplates.forEach(assignment => {
        console.log(`      - ${assignment.template.name} (${assignment.template.examCode}) - Status: ${assignment.status}`);
      });
      console.log(`    ---`);
    });
    
    // 3. Test the institution-templates API response for first institution
    if (institutions.length > 0) {
      const firstInstitution = institutions[0];
      console.log(`\n🔍 Testing API response for ${firstInstitution.name}...`);
      
      const assignedTemplates = await prisma.institutionTemplate.findMany({
        where: {
          institutionId: firstInstitution.id,
          status: 'ACTIVE'
        },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              examCode: true,
              description: true,
              status: true,
              accuracy: true,
              createdAt: true,
              updatedAt: true
            }
          }
        },
        orderBy: {
          assignedAt: 'desc'
        }
      });
      
      console.log(`✅ Institution API would return ${assignedTemplates.length} templates:`);
      assignedTemplates.forEach(at => {
        console.log(`  - ${at.template.name} (${at.template.examCode}) - Status: ${at.status}`);
      });
      
      // 4. Check if there are any users for this institution
      const users = await prisma.user.findMany({
        where: { institutionId: firstInstitution.id },
        include: { institution: true }
      });
      
      console.log(`\n👥 Found ${users.length} users for ${firstInstitution.name}:`);
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
        console.log(`    InstitutionId from user record: ${user.institutionId}`);
        console.log(`    Institution from relation: ${user.institution?.name}`);
      });
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testAssignmentFlow();
