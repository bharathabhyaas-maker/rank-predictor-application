import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

export async function GET() {
  try {
    console.log('🔍 Debug: Fetching users from database...')
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institutionId: true,
        createdAt: true,
        password: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('📋 Found users:', users)
    
    return NextResponse.json({
      success: true,
      users: users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        institutionId: u.institutionId,
        hasPassword: !!u.password,
        isHashed: u.password?.startsWith('$2') || false
      }))
    })
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
