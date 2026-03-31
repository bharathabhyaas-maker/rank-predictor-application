// Check the actual password hash for Gnanvilee Academy
console.log('🔍 Checking Gnanvilee Academy user account...\n');

fetch('http://localhost:3000/api/institutions')
  .then(response => response.json())
  .then(institutions => {
    const gnanvilee = institutions.find(inst => inst.name === 'Gnanvilee Academy');
    
    if (gnanvilee) {
      console.log('✅ Found Gnanvilee Academy:');
      console.log(`   Name: ${gnanvilee.name}`);
      console.log(`   Email: ${gnanvilee.email}`);
      console.log(`   Institution ID: ${gnanvilee.institutionId}`);
      console.log(`   Status: ${gnanvilee.status}`);
      
      console.log('\n🔑 LOGIN CREDENTIALS:');
      console.log(`   Email: ${gnanvilee.email}`);
      console.log(`   Institution ID: ${gnanvilee.institutionId}`);
      console.log(`   Password: [This should have been shown in super admin when created]`);
      
      console.log('\n📋 HOW TO LOGIN:');
      console.log('1. Go to institution login page');
      console.log('2. Enter Email: admin@gva.in');
      console.log('3. Enter Institution ID: admin557');
      console.log('4. Enter Password: [The password shown when you created it]');
      
    } else {
      console.log('❌ Institution not found');
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
