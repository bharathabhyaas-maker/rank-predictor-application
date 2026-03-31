const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/debug/team-members',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      console.log('=== LOOKING FOR ANWAR (anwarshaik0823@gmail.com) ===');
      
      // Look for Anwar specifically
      const anwarTeamMember = result.teamMembers.find(m => 
        m.email === 'anwarshaik0823@gmail.com' || 
        m.name.toLowerCase().includes('anwar')
      );
      
      const anwarUser = result.users.find(u => 
        u.email === 'anwarshaik0823@gmail.com' || 
        u.name.toLowerCase().includes('anwar')
      );
      
      console.log('\n=== SEARCH RESULTS ===');
      
      if (anwarTeamMember) {
        console.log('✅ Found Anwar in Team Members:');
        console.log(`  Email: ${anwarTeamMember.email}`);
        console.log(`  Name: ${anwarTeamMember.name}`);
        console.log(`  Role: ${anwarTeamMember.role}`);
        console.log(`  Status: ${anwarTeamMember.status}`);
      } else {
        console.log('❌ Anwar not found in Team Members');
      }
      
      if (anwarUser) {
        console.log('✅ Found Anwar in Users:');
        console.log(`  Email: ${anwarUser.email}`);
        console.log(`  Name: ${anwarUser.name}`);
        console.log(`  Role: ${anwarUser.role}`);
        console.log(`  Created: ${anwarUser.createdAt}`);
      } else {
        console.log('❌ Anwar not found in Users');
      }
      
      // Show all users with similar emails
      console.log('\n=== ALL USERS WITH "anwar" IN EMAIL ===');
      const similarUsers = result.users.filter(u => 
        u.email.toLowerCase().includes('anwar')
      );
      
      if (similarUsers.length > 0) {
        similarUsers.forEach(user => {
          console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      } else {
        console.log('No users found with "anwar" in email');
      }
      
      // Show all team members with similar emails
      console.log('\n=== ALL TEAM MEMBERS WITH "anwar" IN EMAIL ===');
      const similarTeamMembers = result.teamMembers.filter(m => 
        m.email.toLowerCase().includes('anwar')
      );
      
      if (similarTeamMembers.length > 0) {
        similarTeamMembers.forEach(member => {
          console.log(`  - ${member.name} (${member.email}) - Role: ${member.role}`);
        });
      } else {
        console.log('No team members found with "anwar" in email');
      }
      
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.log('Raw data:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
