import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Fetching template with ID:', id)
    
    // First get basic template data
    const template = await prisma.template.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        examCode: true,
        description: true,
        status: true,
        accuracy: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!template) {
      console.error('❌ Template not found:', id)
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Template found:', template.name)
    
    // Get predictions count separately
    const predictionCount = await prisma.prediction.count({
      where: { templateId: id }
    })
    
    // Get exam data separately
    const exam = await prisma.exam.findFirst({
      where: { templateId: id },
      select: {
        id: true,
        name: true,
        conditions: true,
        sections: {
          select: {
            name: true,
            totalQuestions: true,
            positiveMarks: true,
            negativeMarks: true
          }
        }
      }
    })
    
    console.log('✅ Found exam:', exam?.name || 'None')
    console.log('✅ Exam has conditions:', !!exam?.conditions)
    console.log('✅ Exam conditions data:', JSON.stringify(exam?.conditions, null, 2))
    console.log('✅ Exam conditions keys:', exam?.conditions ? Object.keys(exam.conditions) : 'None')
    
    // Format response to match what frontend expects
    const templateType = exam?.conditions && Object.keys(exam.conditions).length > 0 ? 'conditional' : (exam ? 'ai' : 'dataset')
    console.log('🔍 Determined template type:', templateType)
    
    const formattedTemplate = {
      id: template.id,
      name: template.name,
      examCode: template.examCode,
      description: template.description,
      type: templateType,
      status: template.status.toLowerCase(),
      predictions: predictionCount,
      accuracy: template.accuracy ? `${template.accuracy}%` : 'N/A',
      createdAt: template.createdAt.toISOString().split('T')[0],
      updatedAt: template.updatedAt.toISOString().split('T')[0],
      // Include exam conditions
      conditions: exam?.conditions || {},
      // Include config from exam if available
      config: exam || {},
      // Include subjects from exam or template
      subjects: exam?.sections?.map((section: any) => ({
        name: section.name,
        totalQuestions: section.totalQuestions,
        positiveMarks: section.positiveMarks,
        negativeMarks: section.negativeMarks
      })) || [],
      // Default configuration flags
      requireHallTicket: true,
      askExpectedScore: true,
      collectCity: false
    }
    
    console.log('📤 Returning formatted template:', formattedTemplate)
    return NextResponse.json(formattedTemplate)
    
  } catch (error) {
    console.error('❌ Error fetching template:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack available'
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    console.log('📝 Updating template:', id, body)
    
    // Update template exam conditions if provided
    const updateData: any = {
      updatedAt: new Date()
    }
    
    if (body.conditions) {
      // Update the exam conditions
      const exam = await prisma.exam.findFirst({
        where: { templateId: id }
      })
      
      if (exam) {
        await prisma.exam.update({
          where: { id: exam.id },
          data: { conditions: body.conditions }
        })
        console.log('✅ Exam conditions updated')
      }
    }
    
    if (body.placeholders) {
      // For future: update template placeholders
      console.log('📝 Placeholder updates not yet implemented')
    }
    
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: updateData
    })
    
    console.log('✅ Template updated:', updatedTemplate)
    
    return NextResponse.json({
      success: true,
      template: updatedTemplate,
      message: 'Template updated successfully'
    })
    
  } catch (error) {
    console.error('❌ Error updating template:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
