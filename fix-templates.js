// Fix template configurations for proper prediction types
const { PrismaClient } = require('../src/generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixTemplates() {
  try {
    console.log('🔧 Fixing template configurations...\n');

    // Fix AI template - set AI source to internet
    const aiTemplate = await prisma.template.findFirst({
      where: { examCode: 'JEE-MAIN-2027' }
    });

    if (aiTemplate) {
      console.log('🤖 Fixing AI template:', aiTemplate.name);
      
      const updatedPlaceholders = {
        ...(aiTemplate.placeholders || {}),
        aiSource: 'internet' // Set to internet by default
      };

      await prisma.template.update({
        where: { id: aiTemplate.id },
        data: { placeholders: updatedPlaceholders }
      });

      console.log('✅ AI template updated with aiSource: internet');
    }

    // Add sample conditions to conditional templates
    const conditionalTemplates = await prisma.template.findMany({
      where: { type: 'conditional' }
    });

    for (const template of conditionalTemplates) {
      console.log('📋 Adding conditions to conditional template:', template.name);
      
      // Check if exam exists and has conditions
      const exam = await prisma.exam.findFirst({
        where: { examCode: template.examCode }
      });

      if (!exam) {
        console.log('⚠️ No exam found for:', template.examCode);
        
        // Create exam with conditions
        const newExam = await prisma.exam.create({
          data: {
            examCode: template.examCode,
            name: template.name,
            templateId: template.id,
            conditions: {
              create: [
                {
                  parameter: 'totalScore',
                  operator: '>=',
                  value: '150',
                  bestCasePercentile: 95,
                  worstCasePercentile: 85,
                  bestCaseRank: 5000,
                  worstCaseRank: 15000,
                  avgRank: 10000,
                  avgPercentile: 90
                },
                {
                  parameter: 'totalScore',
                  operator: '>=',
                  value: '100',
                  bestCasePercentile: 80,
                  worstCasePercentile: 70,
                  bestCaseRank: 50000,
                  worstCaseRank: 100000,
                  avgRank: 75000,
                  avgPercentile: 75
                },
                {
                  parameter: 'totalScore',
                  operator: '<',
                  value: '100',
                  bestCasePercentile: 60,
                  worstCasePercentile: 40,
                  bestCaseRank: 200000,
                  worstCaseRank: 500000,
                  avgRank: 350000,
                  avgPercentile: 50
                }
              ]
            }
          }
        });

        console.log('✅ Created exam with conditions for:', template.name);
      } else {
        console.log('✅ Exam already exists for:', template.examCode);
      }
    }

    console.log('\n🎉 Template configurations fixed!');
    
    // Verify the fixes
    console.log('\n🔍 Verification:');
    const templates = await prisma.template.findMany({
      select: {
        name: true,
        type: true,
        examCode: true,
        placeholders: true
      }
    });

    templates.forEach(template => {
      console.log(`\n📋 ${template.name}:`);
      console.log(`   Type: ${template.type}`);
      console.log(`   AI Source: ${template.placeholders?.aiSource || 'Not set'}`);
    });

  } catch (error) {
    console.error('❌ Error fixing templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTemplates();
