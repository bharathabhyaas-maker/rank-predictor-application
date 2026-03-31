// Debug script to check actual template data in database
// This will help us understand why JEE MAIN 2025 still shows "AI"

import { prisma } from './lib/database.js';

async function debugTemplateType() {
  try {
    console.log('🔍 Debugging JEE MAIN 2025 template type...\n');

    // Find the JEE MAIN 2025 template
    const template = await prisma.template.findFirst({
      where: {
        examCode: 'JEE-MAIN-2025'
      }
    });

    if (!template) {
      console.log('❌ JEE MAIN 2025 template not found');
      return;
    }

    console.log('📋 Template Data:');
    console.log('================');
    console.log('ID:', template.id);
    console.log('Name:', template.name);
    console.log('Exam Code:', template.examCode);
    console.log('Type:', template.type);
    console.log('Description:', template.description);
    console.log('Status:', template.status);
    console.log('Placeholders:', JSON.stringify(template.placeholders, null, 2));
    console.log('Created At:', template.createdAt);
    console.log('Updated At:', template.updatedAt);
    console.log('');

    // Check what the API would return
    console.log('🔧 API Logic Test:');
    console.log('==================');
    
    let templateType = 'ai'; // default
    
    // Apply the fixed logic
    if (template.type === 'conditional') {
      templateType = 'conditional';
    } else if (template.type === 'ai') {
      templateType = 'ai';
    } else if (template.type === 'dataset') {
      templateType = 'dataset';
    } else {
      // Fallback: check placeholders for conditions
      const config = template.placeholders;
      if (config && config.conditions && config.conditions.length > 0) {
        templateType = 'conditional';
      } else if (config && config.aiSource) {
        templateType = 'ai';
      } else {
        templateType = 'ai'; // default fallback
      }
    }

    console.log('Detected Type:', templateType);
    console.log('UI Should Show:', templateType === 'conditional' ? 'Condition Based' : (templateType === 'ai' ? 'AI' : 'Dataset'));
    console.log('');

    // Check if there are any associated exams
    console.log('📊 Associated Exams:');
    console.log('====================');
    
    const exams = await prisma.exam.findMany({
      where: {
        templateId: template.id
      },
      select: {
        id: true,
        name: true,
        examCode: true,
        conditions: true
      }
    });

    console.log('Number of exams:', exams.length);
    exams.forEach((exam, index) => {
      console.log(`Exam ${index + 1}:`, exam.name, exam.examCode);
      console.log(`  Conditions:`, JSON.stringify(exam.conditions, null, 2));
    });

    console.log('');
    console.log('🎯 Diagnosis:');
    console.log('=============');
    
    if (template.type === 'conditional') {
      console.log('✅ Template type is correctly set to "conditional"');
      console.log('❌ Issue might be in API caching or UI not refreshing');
    } else if (template.placeholders && template.placeholders.conditions) {
      console.log('✅ Conditions found in placeholders');
      console.log('❌ Template type not set, but fallback should work');
    } else {
      console.log('❌ No conditional data found in template');
      console.log('🔧 Template might have been created incorrectly');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugTemplateType();
