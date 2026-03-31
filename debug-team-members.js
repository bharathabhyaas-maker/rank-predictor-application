// Debug script to check existing team members and users
const { prisma } = require('./lib/database')

async function debugTeamMembers() {
  try {
    console.log('🔍 Checking existing team members...')
    
    const teamMembers = await prisma.teamMember.findMany({
      include: {
        institution: true
      }
    })
    
    console.log(`Found ${teamMembers.length} team members:`)
    teamMembers.forEach(member => {
      console.log(`  - ${member.name} (${member.email}) - Role: ${member.role}`)
    })
    
    console.log('\n🔍 Checking existing users...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`)
    })
    
    console.log('\n🔍 Checking institutions...')
    
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        institutionId: true,
        email: true
      }
    })
    
    console.log(`Found ${institutions.length} institutions:`)
    institutions.forEach(inst => {
      console.log(`  - ${inst.name} (${inst.institutionId}) - ${inst.email}`)
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugTeamMembers()
