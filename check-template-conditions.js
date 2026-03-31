const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTemplateAndConditions() {
  console.log('🔍 Checking templates and their conditions...\n');
  
  // Get all templates with their exams and conditions
  const templates = await prisma.template.findMany({
    include: {
      exams: {
        include: {
          conditions: true
        }
      }
    }
  });
  
  console.log(`Found ${templates.length} templates:\n`);
  
  templates.forEach(template => {
    console.log(`📋 Template: ${template.name} (${template.examCode})`);
    console.log(`   Type: ${template.type}`);
    console.log(`   Exams: ${template.exams.length}`);
    
    if (template.exams.length > 0) {
      template.exams.forEach(exam => {
        console.log(`   📝 Exam: ${exam.name} (${exam.examCode})`);
        console.log(`   📋 Conditions: ${exam.conditions.length}`);
        
        if (exam.conditions.length > 0) {
          exam.conditions.forEach((condition, index) => {
            console.log(`      ${index + 1}. ${condition.parameter} ${condition.operator} ${condition.value}`);
            console.log(`         Best: ${condition.bestCasePercentile}% | Worst: ${condition.worstCasePercentile}%`);
          });
        }
      });
    }
    console.log('');
  });
  
  // Check specific exam codes that might be used
  const examCodes = ['CLAT-2025', 'JEE-MAIN-2025', 'NEET-2025', 'TEST-COND-2026'];
  
  console.log('🎯 Checking specific exam codes:\n');
  for (const code of examCodes) {
    const template = templates.find(t => t.examCode === code);
    if (template) {
      console.log(`✅ ${code}: Found template with type "${template.type}"`);
      
      if (template.exams.length > 0 && template.exams[0].conditions.length > 0) {
        console.log(`   📋 Has ${template.exams[0].conditions.length} conditions - SHOULD USE CONDITIONAL PREDICTION`);
      } else {
        console.log(`   ⚠️ No conditions found - will use fallback prediction`);
      }
    } else {
      console.log(`❌ ${code}: No template found`);
    }
  }
  
  await prisma.$disconnect();
}

checkTemplateAndConditions().catch(console.error);
