import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { TeamMember } from '@/src/generated/prisma/client'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing database connection and team_members table...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check if team_members table exists by trying to query it
    const teamMemberCount = await prisma.teamMember.count()
    console.log(`✅ team_members table exists, found ${teamMemberCount} records`)
    
    // Try to fetch a few team members
    const teamMembers = await prisma.teamMember.findMany({
      take: 10,
      include: {
        institution: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    console.log('📋 Sample team members:', teamMembers)

    // Also fetch users
    const userCount = await prisma.user.count()
    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log(`✅ users table exists, found ${userCount} records`)
    console.log('📋 Sample users:', users)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      teamMemberCount,
      userCount,
      teamMembers: teamMembers.map((tm: TeamMember & { institution?: { id: string; name: string } }) => ({
        id: tm.id,
        name: tm.name,
        email: tm.email,
        role: tm.role,
        status: tm.status,
        institution: tm.institution?.name || 'No institution'
      })),
      users: users.map((u: { id: string; name: string | null; email: string | null; role: string; createdAt: Date }) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
      }))
    })
    
  } catch (error) {
    console.error('❌ Database debug failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
