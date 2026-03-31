// Test team member creation with password
require('dotenv').config({ path: '.env' });

async function testTeamMemberCreation() {
  console.log('🧪 Testing Team Member Creation...');
  
  const testData = {
    name: 'Test Admin User',
    email: `testadmin${Date.now()}@example.com`,
    role: 'MEMBER',
    department: 'IT Department',
    phone: '1234567890',
    password: 'testpassword123',
    institutionId: 'cmmk5bcww0006lglhjpl3h3gv' // Test institution ID
  };

  try {
    const response = await fetch('http://localhost:3000/api/team-members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      'Cookie': 'next-auth.session-token=test' // Mock session
      },
      body: JSON.stringify(testData)
    });

    console.log('📤 Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error response:', error);
      return;
    }

    const result = await response.json();
    console.log('✅ Team member created successfully:');
    console.log('📋 Result:', JSON.stringify(result, null, 2));
    
    if (result.adminId) {
      console.log('🆔 Admin ID generated:', result.adminId);
    } else {
      console.log('❌ Admin ID not found in response');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTeamMemberCreation();
