// Comprehensive check for authentication and prediction issues
console.log('🔍 COMPREHENSIVE SYSTEM DIAGNOSIS\n');

// Check 1: Authentication Status
console.log('1️⃣ AUTHENTICATION CHECK:');
fetch('http://localhost:3000/api/institutions')
  .then(response => response.json())
  .then(institutions => {
    const gnanvilee = institutions.find(inst => inst.name.includes('Gnanvilee'));
    
    if (gnanvilee) {
      console.log('✅ Institution Found:');
      console.log(`   Name: ${gnanvilee.name}`);
      console.log(`   Email: ${gnanvilee.email}`);
      console.log(`   ID: ${gnanvilee.institutionId}`);
      console.log(`   Status: ${gnanvilee.status}`);
      console.log(`   Students: ${gnanvilee.students}`);
      console.log(`   Templates: ${gnanvilee.templatesAssigned}`);
      console.log(`   Predictions: ${gnanvilee.predictions}`);
    } else {
      console.log('❌ Institution not found');
    }
    
    // Check 2: Templates and Predictions
    console.log('\n2️⃣ TEMPLATES & PREDICTIONS:');
    
    if (gnanvilee) {
      // Get institution templates
      return fetch(`http://localhost:3000/api/institution-templates?institutionId=${gnanvilee.id}`)
        .then(response => response.json())
        .then(templates => {
          console.log(`✅ Assigned Templates: ${templates.length}`);
          templates.forEach((t, i) => {
            console.log(`   ${i+1}. ${t.name} - ${t.predictions} predictions`);
          });
          
          // Get predictions
          return fetch(`http://localhost:3000/api/predictions?institutionId=${gnanvilee.id}`)
            .then(response => response.json())
            .then(predictions => {
              console.log(`✅ Total Predictions: ${predictions.length}`);
              predictions.slice(0, 3).forEach((p, i) => {
                console.log(`   ${i+1}. ${p.studentName} - ${p.template?.name || 'Unknown'} - ${p.score || 'N/A'}`);
              });
              
              // Check 3: Template Types
              console.log('\n3️⃣ TEMPLATE TYPE ANALYSIS:');
              const templateTypes = {};
              templates.forEach(t => {
                templateTypes[t.type || 'unknown'] = (templateTypes[t.type || 'unknown'] || 0) + 1;
              });
              console.log('Template Types:', templateTypes);
              
              // Check 4: Issues Summary
              console.log('\n4️⃣ ISSUES SUMMARY:');
              const totalPreds = templates.reduce((sum, t) => sum + (t.predictions || 0), 0);
              const actualPreds = predictions.length;
              
              if (totalPreds !== actualPreds) {
                console.log('⚠️ MISMATCH: Template predictions count ≠ Actual predictions count');
                console.log(`   Template count: ${totalPreds}, Actual count: ${actualPreds}`);
              }
              
              if (predictions.length === 0) {
                console.log('⚠️ NO PREDICTIONS: No predictions found in database');
              }
              
              if (templates.length === 0) {
                console.log('⚠️ NO TEMPLATES: No templates assigned to institution');
              }
              
              console.log('\n✅ DIAGNOSIS COMPLETE');
            });
        });
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
