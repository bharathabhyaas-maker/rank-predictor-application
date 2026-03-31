const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

// Load environment variables
require('dotenv').config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

async function debugDatabase() {
  try {
    console.log('🔍 Debugging institution templates...');
    
    // Check institutions
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        institutionId: true,
        email: true
      }
    });
    
    console.log(`📊 Found ${institutions.length} institutions:`, institutions);
    
    // Check templates
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        examCode: true,
        status: true
      }
    });
    
    console.log(`📊 Found ${templates.length} templates:`, templates);
    
    // Check institution templates (assignments)
    const institutionTemplates = await prisma.institutionTemplate.findMany({
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
      }
    });
    
    console.log(`📊 Found ${institutionTemplates.length} institution-template assignments:`, institutionTemplates);
    
    // If no assignments exist, create some sample ones
    if (institutionTemplates.length === 0 && institutions.length > 0 && templates.length > 0) {
      console.log('🌱 Creating sample institution-template assignments...');
      
      // Assign first template to first institution
      if (institutions[0] && templates[0]) {
        const assignment = await prisma.institutionTemplate.create({
          data: {
            institutionId: institutions[0].id,
            templateId: templates[0].id,
            status: 'ACTIVE'
          }
        });
        console.log('✅ Created assignment:', assignment);
      }
      
      // Assign second template to first institution if exists
      if (institutions[0] && templates[1]) {
        const assignment = await prisma.institutionTemplate.create({
          data: {
            institutionId: institutions[0].id,
            templateId: templates[1].id,
            status: 'ACTIVE'
          }
        });
        console.log('✅ Created assignment:', assignment);
      }
      
      console.log('🎉 Sample assignments created successfully!');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

debugDatabase();
