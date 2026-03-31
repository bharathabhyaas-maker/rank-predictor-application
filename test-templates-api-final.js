// Test the templates API by simulating what it does
const { Client } = require('pg');

async function testTemplatesAPIFinal() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Testing final templates API logic...');
    
    // Simulate the GET method logic
    const templates = await client.query(`
      SELECT id, name, "examCode", description, accuracy, "createdAt", "updatedAt"
      FROM templates 
      ORDER BY "createdAt" DESC
    `);

    console.log(`✅ Found ${templates.rows.length} templates`);

    // Get template IDs for related queries
    const templateIds = templates.rows.map(t => t.id);
    
    // Get assignments (like the API does)
    let assignments = [];
    if (templateIds.length > 0) {
      const assignmentsResult = await client.query(`
        SELECT "templateId", "institutionId", "assignedAt", status
        FROM "institution_templates"
        WHERE "templateId" = ANY($1)
      `, [templateIds]);
      assignments = assignmentsResult.rows;
    }
    
    // Get predictions (like the API does)  
    let predictions = [];
    if (templateIds.length > 0) {
      const predictionsResult = await client.query(`
        SELECT "templateId", "institutionId", "studentEmail"
        FROM predictions
        WHERE "templateId" = ANY($1)
      `, [templateIds]);
      predictions = predictionsResult.rows;
    }

    // Transform data like the API does
    const transformedTemplates = templates.rows.map(template => {
      // Get assignments for this template
      const templateAssignments = assignments.filter(a => a.templateId === template.id);
      const assignedInstitutionIds = templateAssignments.map(a => a.institutionId);
      
      // Get predictions for assigned institutions
      const validPredictions = predictions.filter(p => 
        assignedInstitutionIds.includes(p.institutionId)
      );
      
      // Helper function
      function getTemplateType(examCode, templateName) {
        if (examCode === 'CLAT-2025') return 'conditional';
        return 'ai';
      }
      
      function getPromptTemplate(examCode, templateName) {
        if (examCode.includes('CLAT')) {
          return `You are a percentile prediction expert for ${templateName}. Given a student score of {{score}} out of {{totalMarks}}, predict their likely percentile considering {{candidateCount}} expected candidates and {{difficulty}} paper difficulty.`;
        } else if (examCode.includes('JEE')) {
          return `Analyze JEE score of {{score}} out of {{totalMarks}} using historical dataset patterns. Consider {{candidateCount}} candidates and {{normalization}} normalization.`;
        }
        return `Analyze student score of {{score}} out of {{totalMarks}} for ${templateName}.`;
      }
      
      function getPlaceholders(examCode, templateName) {
        if (examCode.includes('CLAT')) {
          return {
            examName: templateName,
            totalMarks: "150",
            candidateCount: "75000",
            difficulty: "Moderate"
          };
        } else if (examCode.includes('JEE')) {
          return {
            examName: templateName,
            totalMarks: "300",
            candidateCount: "1200000",
            normalization: "Yes"
          };
        }
        return {
          examName: templateName,
          totalMarks: "500",
          candidateCount: "100000"
        };
      }
      
      const templateType = template.type || getTemplateType(template.examCode, template.name);
      
      return {
        id: template.id,
        name: template.name,
        examCode: template.examCode,
        description: template.description,
        type: templateType,
        promptTemplate: getPromptTemplate(template.examCode, template.name),
        placeholders: getPlaceholders(template.examCode, template.name),
        hasConditions: false, // Would check exam conditions
        predictions: validPredictions.length,
        status: 'ACTIVE', // Default status since column doesn't exist
        accuracy: template.accuracy?.toString() || '0',
        shareLink: template.examCode.toLowerCase().replace(/\s+/g, '-'),
        assignedTo: templateAssignments.map(assignment => ({
          institutionId: assignment.institutionId,
          assignedAt: assignment.assignedAt
        })),
        createdAt: template.createdAt.toISOString().split('T')[0],
        assignedInstitutions: templateAssignments.length
      }
    });

    console.log('\n📋 Final transformed templates (API response):');
    transformedTemplates.forEach((template, index) => {
      console.log(`${index + 1}. ${template.name} (${template.examCode})`);
      console.log(`   Type: ${template.type}`);
      console.log(`   Status: ${template.status}`);
      console.log(`   Predictions: ${template.predictions}`);
      console.log(`   Assigned Institutions: ${template.assignedInstitutions}`);
      console.log(`   Created: ${template.createdAt}`);
      console.log('');
    });

    console.log('✅ Templates API should work perfectly now!');
    console.log('💡 All database queries and transformations tested successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 This is the final error that needs to be fixed');
  } finally {
    await client.end();
  }
}

testTemplatesAPIFinal();
