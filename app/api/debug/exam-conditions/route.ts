import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Debug: Fetching exams with conditions from database...')
    
    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        name: true,
        examCode: true,
        conditions: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('📋 Found exams:', exams.length)
    
    return NextResponse.json({
      success: true,
      exams: exams.map((exam: {
        id: string;
        name: string;
        examCode: string;
        conditions: any;
        status: string;
        createdAt: Date;
      }) => ({
        id: exam.id,
        name: exam.name,
        examCode: exam.examCode,
        conditions: exam.conditions,
        hasConditions: !!exam.conditions,
        status: exam.status
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
