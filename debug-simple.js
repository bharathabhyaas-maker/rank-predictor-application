// Simple debug script using tsx
const { execSync } = require('child_process')

console.log('🔍 Running debug check...')

try {
  // Run a simple database query using tsx
  const result = execSync('npx tsx -e "
import { prisma } from \"./lib/database\";

async function debug() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 5
    });
    
    console.log(\"Team Members:\");
    teamMembers.forEach(member => {
      console.log(\`  - \${member.name} (\${member.email}) - \${member.role}\`);
    });
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      take: 5
    });
    
    console.log(\"\\nUsers:\");
    users.forEach(user => {
      console.log(\`  - \${user.name} (\${user.email}) - \${user.role}\`);
    });
    
  } catch (error) {
    console.error(\"Error:\", error.message);
  } finally {
    await prisma.\$disconnect();
  }
}

debug();
"', { encoding: 'utf8', cwd: process.cwd() })
  
  console.log(result)
  
} catch (error) {
  console.error('Debug script failed:', error.message)
}
