import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Fetching total students from database...')
    
    const institutions = await prisma.institution.findMany({
      select: {
        currentStudents: true
      }
    })

    const totalStudents = institutions.reduce((sum: number, inst: any) => sum + (inst.currentStudents || 0), 0)

    console.log(`✅ Found ${totalStudents} total students in database`)

    return NextResponse.json({ total: totalStudents })
  } catch (error) {
    console.error('❌ Failed to fetch total students:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch total students',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
