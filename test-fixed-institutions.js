const { Client } = require('pg');

async function testFixedInstitutions() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Bharathteja@localhost:5432/rank_predictor'
  });

  try {
    await client.connect();
    console.log('🔍 Testing fixed institutions API logic...');
    
    // Test institutions query
    const institutions = await client.query(`
      SELECT id, "institutionId", name, email, location, plan, status, "createdAt", "contactPerson", "phone"
      FROM institutions 
      ORDER BY "createdAt" DESC
    `);
    
    console.log(`✅ Found ${institutions.rows.length} institutions`);
    
    // Get template assignments
    const institutionIds = institutions.rows.map(inst => inst.id);
    
    const templateAssignments = await client.query(`
      SELECT 
        "institutionId", 
        "templateId", 
        "assignedAt", 
        it.status as assignment_status,
        t.name as template_name,
        t."examCode" as template_examCode
      FROM "institution_templates" it
      LEFT JOIN templates t ON it."templateId" = t.id
      WHERE it."institutionId" = ANY($1)
    `, [institutionIds]);
    
    // Get predictions
    const predictions = await client.query(`
      SELECT "institutionId", "templateId", "studentEmail", "createdAt"
      FROM predictions
      WHERE "institutionId" = ANY($1)
    `, [institutionIds]);

    console.log(`📊 Template assignments: ${templateAssignments.rows.length}`);
    console.log(`📊 Predictions: ${predictions.rows.length}`);
    
    // Transform like the API does
    const transformedInstitutions = institutions.rows.map(inst => {
      const assignments = templateAssignments.rows.filter(
        assignment => assignment.institutionId === inst.id
      );
      
      const institutionPredictions = predictions.rows.filter(
        prediction => prediction.institutionId === inst.id
      );
      
      const assignedTemplateIds = assignments.map(assignment => assignment.templateId);
      const validPredictions = institutionPredictions.filter(
        prediction => assignedTemplateIds.includes(prediction.templateId)
      );
      
      const uniqueStudents = new Set(validPredictions.map(p => p.studentEmail)).size;
      
      return {
        id: inst.id,
        institutionId: inst.institutionId,
        name: inst.name,
        email: inst.email,
        location: inst.location,
        students: uniqueStudents,
        templatesAssigned: assignments.length,
        predictions: validPredictions.length,
        status: inst.status,
        joinedDate: inst.createdAt.toISOString().split('T')[0],
        plan: inst.plan,
        contactPerson: inst.contactPerson,
        phone: inst.phone
      }
    });

    console.log('\n📋 Transformed institutions (like API would return):');
    transformedInstitutions.forEach((inst, index) => {
      console.log(`${index + 1}. ${inst.name} (${inst.institutionId})`);
      console.log(`   Email: ${inst.email}`);
      console.log(`   Location: ${inst.location}`);
      console.log(`   Students: ${inst.students}`);
      console.log(`   Templates: ${inst.templatesAssigned}`);
      console.log(`   Predictions: ${inst.predictions}`);
      console.log(`   Plan: ${inst.plan}`);
      console.log(`   Status: ${inst.status}`);
      console.log('');
    });

    console.log('✅ Institutions API should now work!');
    console.log('💡 The "Failed to fetch institutions" error should be resolved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 This might be why the institutions API is still failing');
  } finally {
    await client.end();
  }
}

testFixedInstitutions();
