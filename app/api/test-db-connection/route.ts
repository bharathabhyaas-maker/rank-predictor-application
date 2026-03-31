import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection with centralized utility...')
    
    // Test database connection
    const templates = await prisma.template.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        examCode: true,
        status: true
      }
    })
    
    const institutionCount = await prisma.institution.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        institutionCount: institutionCount,
        templateCount: templates.length,
        sampleTemplates: templates
      }
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database test failed'
    }, { status: 500 })
  }
}
