require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  adapter: process.env.DATABASE_URL,
});

async function seedJEETest() {
  try {
    // First, get or create an admin user
    let admin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'superadmin@rankpredictor.com',
          name: 'Super Admin',
          password: 'admin123', // In production, this should be hashed
          role: 'SUPER_ADMIN',
          status: 'ACTIVE'
        }
      });
      console.log('Super admin created:', admin.id);
    }

    // Create JEE Main 2025 Template
    const jeeTemplate = await prisma.template.create({
      data: {
        name: 'JEE Main 2025 AI Predictor',
        examCode: 'JEE-MAIN-2025',
        description: 'AI-powered rank prediction for JEE Main 2025 examination using advanced machine learning algorithms',
        examDate: new Date('2025-04-05'), // Typical JEE Main date
        duration: 180, // 3 hours in minutes
        predictionType: 'AI',
        aiSource: 'INTERNET',
        status: 'ACTIVE',
        totalPredictions: 0,
        accuracy: 94.5,
        createdBy: admin.id
      }
    });

    console.log('JEE Main template created:', jeeTemplate.id);

    // Add template sections for JEE Main
    const sections = [
      { name: 'Physics', totalQuestions: 30, positiveMarks: 4, negativeMarks: -1, order: 1 },
      { name: 'Chemistry', totalQuestions: 30, positiveMarks: 4, negativeMarks: -1, order: 2 },
      { name: 'Mathematics', totalQuestions: 30, positiveMarks: 4, negativeMarks: -1, order: 3 }
    ];

    for (const sectionData of sections) {
      const section = await prisma.templateSection.create({
        data: {
          templateId: jeeTemplate.id,
          ...sectionData
        }
      });
      console.log(`Section created: ${section.name}`);
    }

    // Add overall cutoff
    await prisma.overallCutoff.create({
      data: {
        templateId: jeeTemplate.id,
        minScore: 0,
        maxScore: 360
      }
    });

    // Add AI Configuration
    await prisma.aIConfiguration.create({
      data: {
        templateId: jeeTemplate.id,
        isConnected: true,
        promptTemplate: `Based on the JEE Main 2025 exam pattern and historical data, analyze the given score and predict the most likely rank range. Consider factors like:
        - Total marks: {{totalMarks}}
        - Physics marks: {{physicsMarks}}
        - Chemistry marks: {{chemistryMarks}}
        - Mathematics marks: {{mathematicsMarks}}
        - Expected difficulty level: {{difficulty}}
        - Number of candidates: {{candidateCount}}
        
        Provide a detailed rank prediction with confidence interval.`
      }
    });

    // Add some AI resources
    const resources = [
      {
        type: 'URL',
        source: 'https://jeemain.nta.nic.in/',
        description: 'Official JEE Main website for latest information',
        status: 'ACTIVE'
      },
      {
        type: 'URL',
        source: 'https://www.shiksha.com/engineering/jee-main-exam-pattern',
        description: 'JEE Main exam pattern and syllabus details',
        status: 'ACTIVE'
      }
    ];

    const aiConfig = await prisma.aIConfiguration.findUnique({
      where: { templateId: jeeTemplate.id }
    });

    for (const resourceData of resources) {
      await prisma.aIResource.create({
        data: {
          aiConfigId: aiConfig.id,
          ...resourceData
        }
      });
    }

    console.log('JEE Main 2025 template successfully created with all sections and configurations!');
    console.log('Template ID:', jeeTemplate.id);
    console.log('Exam Code:', jeeTemplate.examCode);

  } catch (error) {
    console.error('Error seeding JEE test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedJEETest();
