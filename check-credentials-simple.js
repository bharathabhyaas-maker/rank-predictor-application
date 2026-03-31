// Simple check using fetch API
console.log('🔍 Checking Gyanville Academy credentials via API...\n');

fetch('http://localhost:3000/api/institutions')
  .then(response => response.json())
  .then(institutions => {
    console.log(`Found ${institutions.length} institutions:\n`);
    
    // Look for Gyanville Academy
    const gyanville = institutions.find(inst => 
      inst.name.toLowerCase().includes('gyanville') || 
      inst.email.toLowerCase().includes('gyanville')
    );
    
    if (gyanville) {
      console.log('✅ Found Gyanville Academy:');
      console.log(`   Name: ${gyanville.name}`);
      console.log(`   Email: ${gyanville.email}`);
      console.log(`   Institution ID: ${gyanville.institutionId}`);
      console.log(`   Status: ${gyanville.status}`);
      console.log(`   Plan: ${gyanville.plan}`);
      console.log(`   Created: ${gyanville.joinedDate}`);
      console.log('\n🔑 USE THESE CREDENTIALS FOR LOGIN:');
      console.log(`   Email: ${gyanville.email}`);
      console.log(`   Institution ID: ${gyanville.institutionId}`);
      console.log(`   Password: [Check super admin creation response]`);
    } else {
      console.log('❌ Gyanville Academy not found');
      console.log('\n📋 All institutions:');
      institutions.forEach((inst, index) => {
        console.log(`${index + 1}. ${inst.name}`);
        console.log(`   Email: ${inst.email}`);
        console.log(`   ID: ${inst.institutionId}`);
        console.log('');
      });
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
