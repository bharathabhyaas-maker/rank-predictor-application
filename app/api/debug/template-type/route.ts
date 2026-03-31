import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging JEE MAIN 2025 template type...')

    // Find the JEE MAIN 2025 template
    const template = await prisma.template.findFirst({
      where: {
        examCode: 'JEE-MAIN-2025'
      }
    })

    if (!template) {
      return NextResponse.json({
        success: false,
        error: 'JEE MAIN 2025 template not found'
      })
    }

    console.log('📋 Found template:', template.name)

    // Check what the API would return
    let templateType = 'ai' // default
    
    // Apply the fixed logic
    if (template.type === 'conditional') {
      templateType = 'conditional'
    } else if (template.type === 'ai') {
      templateType = 'ai'
    } else if (template.type === 'dataset') {
      templateType = 'dataset'
    } else {
      // Fallback: check placeholders for conditions
      const config = template.placeholders as any
      if (config && config.conditions && config.conditions.length > 0) {
        templateType = 'conditional'
      } else if (config && config.aiSource) {
        templateType = 'ai'
      } else {
        templateType = 'ai' // default fallback
      }
    }

    // Check associated exams
    const exams = await prisma.exam.findMany({
      where: {
        templateId: template.id
      },
      select: {
        id: true,
        name: true,
        examCode: true,
        conditions: true
      }
    })

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        examCode: template.examCode,
        type: template.type,
        description: template.description,
        status: template.status,
        placeholders: template.placeholders,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      },
      detectedType: templateType,
      uiDisplay: templateType === 'conditional' ? 'Condition Based' : (templateType === 'ai' ? 'AI' : 'Dataset'),
      associatedExams: exams,
      diagnosis: {
        hasCorrectType: template.type === 'conditional',
        hasConditionsInPlaceholders: !!(template.placeholders as any)?.conditions,
        conditionsCount: (template.placeholders as any)?.conditions?.length || 0,
        hasAssociatedExams: exams.length > 0
      }
    })

  } catch (error) {
    console.error('❌ Debug failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
