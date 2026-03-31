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

async function verifyAssignments() {
  try {
    console.log('🔍 Verifying template assignments are permanent...');
    
    // Check all institution templates
    const assignments = await prisma.institutionTemplate.findMany({
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            institutionId: true
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            examCode: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });
    
    console.log(`📊 Found ${assignments.length} total assignments:`);
    assignments.forEach((assignment, index) => {
      console.log(`  ${index + 1}. ${assignment.template.name} → ${assignment.institution.name}`);
      console.log(`     Status: ${assignment.status}`);
      console.log(`     Assigned: ${assignment.assignedAt.toISOString()}`);
      console.log(`     ---`);
    });
    
    // Check for any duplicate assignments
    const duplicates = assignments.filter((assignment, index, self) =>
      index !== self.findIndex((t) => (
        t.institutionId === assignment.institutionId && 
        t.templateId === assignment.templateId
      ))
    );
    
    if (duplicates.length > 0) {
      console.log(`⚠️ Found ${duplicates.length} duplicate assignments`);
    } else {
      console.log('✅ No duplicate assignments found');
    }
    
    // Check assignment status distribution
    const statusCounts = assignments.reduce((acc, assignment) => {
      acc[assignment.status] = (acc[assignment.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Assignment status distribution:', statusCounts);
    
    await prisma.$disconnect();
    console.log('✅ Assignment verification complete');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyAssignments();
