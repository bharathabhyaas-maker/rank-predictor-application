import { NextRequest, NextResponse } from 'next/server'
import { updateExamTemplate } from '@/lib/api/exams'
import { prisma } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Fetching exam details for ID:', id)
    
    const exam = await prisma.exam.findUnique({
      where: {
        id: id
      },
      include: {
        template: {
          include: {
            sections: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        _count: {
          select: {
            predictions: true
          }
        }
      }
    })

    if (!exam) {
      console.log('❌ Exam not found:', id)
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found exam:', exam.name)

    // Transform the data to match the expected format
    // Use exam-specific config if available, otherwise fall back to template defaults
    const transformedExam = {
      id: exam.id,
      name: exam.name,
      examCode: exam.examCode,
      description: exam.description,
      date: exam.date.toISOString().split('T')[0],
      duration: exam.duration,
      status: exam.status.toLowerCase(),
      config: exam.config || {}, // Exam-specific conditions
      template: {
        id: exam.template.id,
        name: exam.template.name,
        examCode: exam.template.examCode,
        description: exam.template.description,
        status: exam.template.status.toLowerCase(),
        accuracy: exam.template.accuracy ? `${exam.template.accuracy}%` : 'N/A',
        shareLink: exam.template.examCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        subjects: exam.template.sections.map(section => ({
          name: section.name,
          totalQuestions: section.totalQuestions,
          positiveMarks: section.positiveMarks,
          negativeMarks: section.negativeMarks
        }))
      },
      // Use exam config for form requirements, fall back to template defaults
      requireHallTicket: exam.config?.requireHallTicket ?? true,
      askExpectedScore: exam.config?.askExpectedScore ?? true,
      collectCity: exam.config?.collectCity ?? false,
      // Additional exam-specific conditions
      examDate: exam.date,
      examDuration: exam.duration,
      predictions: exam._count.predictions,
      createdAt: exam.createdAt.toISOString().split('T')[0]
    }

    console.log('✅ Exam transformed successfully with conditions:', transformedExam.config)

    return NextResponse.json(transformedExam, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Failed to fetch exam:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch exam',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const template = await updateExamTemplate(id, data)
    return NextResponse.json(template)
  } catch (error) {
    console.error('Failed to update exam template:', error)
    return NextResponse.json(
      { error: 'Failed to update exam template' },
      { status: 500 }
    )
  }
}
