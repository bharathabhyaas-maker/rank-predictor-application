import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

interface SavePredictionRequest {
  studentName: string
  studentEmail: string
  rollNumber?: string
  userId?: string
  institutionId?: string
  examId: string
  templateId?: string | null
  totalScore: number
  predictedRank: number
  predictedPercentile: number
  bestCaseRank?: number
  bestCasePercentile?: number
  worstCaseRank?: number
  worstCasePercentile?: number
  avgRank?: number
  avgPercentile?: number
  answers?: Record<string, any>
  predictionType: string
  status: string
  metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: SavePredictionRequest = await request.json()
    
    console.log(' Save API received data:', JSON.stringify(body, null, 2))
    console.log(' Save API - studentName:', body.studentName)
    console.log(' Save API - studentEmail:', body.studentEmail)
    console.log(' Save API - predictedRank:', body.predictedRank)
    console.log(' Save API - predictedPercentile:', body.predictedPercentile)
    console.log(' Save API - examId:', body.examId)
    console.log(' Save API - institutionId:', body.institutionId)
    console.log(' Save API - userId:', body.userId)
    console.log(' Save API - templateId:', body.templateId)
    
    // Validate required fields
    if (!body.studentName || !body.studentEmail || !body.examId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentName, studentEmail, examId' },
        { status: 400 }
      )
    }

    if (typeof body.predictedRank !== 'number' || typeof body.predictedPercentile !== 'number') {
      return NextResponse.json(
        { error: 'Invalid prediction values: predictedRank and predictedPercentile must be numbers' },
        { status: 400 }
      )
    }

    // Resolve user
    let resolvedUserId: string
    try {
      const existingUser = await prisma.user.findFirst({
        where: { email: body.studentEmail }
      })

      if (existingUser) {
        resolvedUserId = existingUser.id
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: body.studentEmail,
            name: body.studentName,
            password: 'dummy-password',
            role: 'STUDENT'
          }
        })
        resolvedUserId = newUser.id
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to resolve user for prediction' },
        { status: 500 }
      )
    }

    // Resolve exam
    let exam: { id: string; name: string; examCode: string } | null = null
    try {
      exam = await prisma.exam.findFirst({
        where: {
          OR: [
            { id: { equals: body.examId, mode: 'insensitive' } },
            { examCode: { equals: body.examId, mode: 'insensitive' } }
          ]
        },
        select: { id: true, name: true, examCode: true }
      })
    } catch {
      // Continue without exam association
    }

    if (!exam) {
      try {
        // Find or create a fallback template first (templateId is required on Exam)
        let fallbackTemplate = await prisma.template.findFirst()
        if (!fallbackTemplate) {
          fallbackTemplate = await prisma.template.create({
            data: {
              name: 'Default Template',
              examCode: 'DEFAULT',
              type: 'ai',
              status: 'ACTIVE'
            }
          })
        }

        exam = await prisma.exam.create({
          data: {
            name: body.examId.replace(/-/g, ' ').toUpperCase(),
            examCode: body.examId.toUpperCase(),
            status: 'ACTIVE',
            date: new Date(),
            duration: 180,
            templateId: fallbackTemplate.id
          },
          select: { id: true, name: true, examCode: true }
        })
      } catch {
        // Proceed without exam relation
      }
    }

    // Validate template
    let validTemplateId: string | null = null
    if (body.templateId) {
      try {
        const template = await prisma.template.findUnique({
          where: { id: body.templateId }
        })
        validTemplateId = template ? body.templateId : null
      } catch {
        validTemplateId = null
      }
    }

    // Build create data
    const createData: any = {
      studentName: body.studentName,
      studentEmail: body.studentEmail,
      rollNumber: body.rollNumber ?? null,
      examName: exam?.name ?? body.examId,
      examCode: exam?.examCode ?? body.examId,
      predictedRank: body.predictedRank,
      predictedPercentile: body.predictedPercentile,
      bestCaseRank: body.bestCaseRank ?? body.predictedRank,
      worstCaseRank: body.worstCaseRank ?? body.predictedRank,
      avgRank: body.avgRank ?? body.predictedRank,
      bestCasePercentile: body.bestCasePercentile ?? body.predictedPercentile,
      worstCasePercentile: body.worstCasePercentile ?? body.predictedPercentile,
      avgPercentile: body.avgPercentile ?? body.predictedPercentile,
      status: body.status ?? 'completed',
      predictionType: body.predictionType ?? 'dataset',
      answers: JSON.parse(JSON.stringify(body.answers ?? {})),
      metadata: JSON.parse(JSON.stringify(body.metadata ?? {})),
      user: {
        connect: { id: resolvedUserId }
      }
    }

    if (exam?.id) {
      createData.exam = { connect: { id: exam.id } }
    }

    if (body.institutionId) {
      createData.institution = { connect: { id: body.institutionId } }
    }

    if (validTemplateId) {
      createData.template = { connect: { id: validTemplateId } }
    }

    try {
      console.log('🔍 About to create prediction with createData:', JSON.stringify(createData, null, 2))
      
      const prediction = await prisma.prediction.create({
        data: createData
      })

      console.log('✅ Prediction created successfully:', prediction.id)
      console.log('✅ Prediction data:', {
        id: prediction.id,
        studentName: prediction.studentName,
        predictedRank: prediction.predictedRank,
        predictedPercentile: prediction.predictedPercentile,
        examId: prediction.examId,
        createdAt: prediction.createdAt
      })

      return NextResponse.json({
        success: true,
        prediction: {
          id: prediction.id,
          studentName: prediction.studentName,
          studentEmail: prediction.studentEmail,
          predictedRank: prediction.predictedRank,
          predictedPercentile: prediction.predictedPercentile,
          examName: prediction.examName,
          examCode: prediction.examCode,
          status: prediction.status,
          predictionType: prediction.predictionType,
          createdAt: prediction.createdAt
        }
      })
    } catch (dbError: any) {
      console.error('❌ Database error creating prediction:', dbError)
      console.error('❌ Database error details:', dbError?.message)
      console.error('❌ Database error stack:', dbError?.stack)
      console.error('❌ Full error object:', JSON.stringify(dbError, null, 2))
      
      return NextResponse.json(
        {
          error: 'Database error creating prediction',
          details: dbError?.message ?? 'Unknown database error',
          errorType: 'DATABASE_ERROR'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save prediction' },
      { status: 500 }
    )
  }
}