import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing template database connection...')
    
    // Test basic template query
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        examCode: true,
        status: true
      },
      take: 5
    })
    
    console.log('✅ Found templates:', templates.length)
    
    // Test template with relations
    const templateWithRelations = await prisma.template.findFirst({
      include: {
        predictions: {
          select: {
            id: true
          }
        },
        exams: {
          select: {
            id: true,
            name: true,
            conditions: true
          }
        }
      }
    })
    
    console.log('✅ Template with relations:', templateWithRelations?.name || 'None found')
    
    return NextResponse.json({
      success: true,
      templates: templates,
      templateWithRelations: templateWithRelations ? {
        id: templateWithRelations.id,
        name: templateWithRelations.name,
        examCode: templateWithRelations.examCode,
        hasPredictions: templateWithRelations.predictions.length > 0,
        hasExams: templateWithRelations.exams.length > 0,
        examCount: templateWithRelations.exams.length,
        firstExam: templateWithRelations.exams[0] ? {
          id: templateWithRelations.exams[0].id,
          name: templateWithRelations.exams[0].name,
          hasConditions: !!templateWithRelations.exams[0].conditions
        } : null
      } : null
    })
    
  } catch (error) {
    console.error('❌ Debug test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}
