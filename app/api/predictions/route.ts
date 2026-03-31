import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// SSE notification function
async function sendSSENotification(prediction: any) {
  try {
    // This would normally use a proper SSE server
    // For now, we'll simulate by storing the latest prediction
    // In a real implementation, this would broadcast to all connected SSE clients
    
    // Store the latest prediction for the SSE endpoint to pick up
    const latestPrediction = {
      id: prediction.id,
      studentName: prediction.studentName,
      studentEmail: prediction.studentEmail,
      rollNumber: prediction.rollNumber,
      templateName: prediction.templateName,
      score: prediction.predictedPercentile || 0,
      percentile: prediction.predictedPercentile || 0,
      predictedRank: prediction.predictedRank || 0,
      status: prediction.status,
      createdAt: prediction.createdAt,
      institutionId: prediction.institutionId,
      examId: prediction.examId
    }
    
    // In a real implementation, this would broadcast to all connected clients
    console.log('📡 SSE Notification sent for prediction:', prediction.id)
    
    // Store in memory for the SSE endpoint to pick up
    global.latestPrediction = latestPrediction
    
  } catch (error) {
    console.error('Error sending SSE notification:', error)
  }
}

// Extend the global type to include latest prediction
declare global {
  var latestPrediction: any
}

// Type definitions
interface PredictionRequest {
  studentName: string
  studentEmail: string
  rollNumber?: string
  templateId: string
  institutionId?: string // Made optional for public access
  examId?: string
  answers: Record<string, any>
}

interface PredictionConditions {
  minScore?: number
  maxScore?: number
  subjects?: {
    [subject: string]: {
      weight: number
      minScore?: number
      maxScore?: number
    }
  }
  difficulty?: 'easy' | 'medium' | 'hard'
  timeLimit?: number
  passingCriteria?: {
    percentage: number
    subjects: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔮 Creating student prediction...')

    const body: PredictionRequest = await request.json()
    console.log('📋 Prediction request:', body)

    if (!body.studentName || !body.studentEmail || !body.templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentName, studentEmail, templateId' },
        { status: 400 }
      )
    }

    // FIX: Always include exams with conditions — no ternary so TypeScript
    // knows the full shape of the returned object at compile time
    const template = await prisma.template.findUnique({
      where: { id: body.templateId },
      include: {
        exams: {
          where: body.examId ? { id: body.examId } : undefined,
          include: {
            conditions: true  // ✅ Always present — TS now correctly types exam.conditions
          }
        }
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    let conditions: PredictionConditions = {}

    if (template.exams && template.exams.length > 0) {
      const exam = template.exams[0]

      // ✅ Properly map exam conditions to prediction conditions
      if (exam.conditions && exam.conditions.length > 0) {
        console.log('🔧 Processing exam conditions:', exam.conditions.length)
        
        // Map exam conditions to the expected format
        exam.conditions.forEach(condition => {
          console.log('📋 Condition:', condition.parameter, condition.operator, condition.value)
          
          // Map parameter-based conditions to our PredictionConditions interface
          switch (condition.parameter?.toLowerCase()) {
            case 'score':
            case 'totalscore':
              if (condition.operator === '>=' || condition.operator === 'gt') {
                conditions.minScore = parseFloat(condition.value)
              } else if (condition.operator === '<=' || condition.operator === 'lt') {
                conditions.maxScore = parseFloat(condition.value)
              }
              break
            case 'difficulty':
              conditions.difficulty = condition.value?.toLowerCase() as 'easy' | 'medium' | 'hard'
              break
            case 'timelimit':
              conditions.timeLimit = parseInt(condition.value)
              break
          }
        })

        // Add percentile/rank data from conditions if available
        const firstCondition = exam.conditions[0]
        if (firstCondition.bestCasePercentile || firstCondition.worstCasePercentile) {
          // Store these for direct use in rank calculation
          conditions.minScore = firstCondition.worstCasePercentile ?? conditions.minScore
          conditions.maxScore = firstCondition.bestCasePercentile ?? conditions.maxScore
        }
        
        console.log('✅ Mapped conditions:', conditions)
      }
    }

    const score = calculateScore(body.answers, conditions)
    const predictedRank = calculatePredictedRank(score, conditions)
    const accuracy = calculateAccuracy(score, conditions)

    // Extract percentile/rank data from conditions if available
    let percentileData = {
      bestCasePercentile: undefined as number | undefined,
      worstCasePercentile: undefined as number | undefined,
      avgPercentile: undefined as number | undefined,
      bestCaseRank: undefined as number | undefined,
      worstCaseRank: undefined as number | undefined,
      avgRank: undefined as number | undefined
    }

    if (template.exams && template.exams.length > 0 && template.exams[0].conditions && template.exams[0].conditions.length > 0) {
      const firstCondition = template.exams[0].conditions[0]
      percentileData = {
        bestCasePercentile: firstCondition.bestCasePercentile ?? undefined,
        worstCasePercentile: firstCondition.worstCasePercentile ?? undefined,
        avgPercentile: firstCondition.avgPercentile ?? undefined,
        bestCaseRank: firstCondition.bestCaseRank ?? undefined,
        worstCaseRank: firstCondition.worstCaseRank ?? undefined,
        avgRank: firstCondition.avgRank ?? undefined
      }
    }

    const prediction = await prisma.prediction.create({
      data: {
        studentName: body.studentName,
        studentEmail: body.studentEmail,
        rollNumber: body.rollNumber,
        predictedRank,
        predictedPercentile: percentileData.avgPercentile,
        bestCaseRank: percentileData.bestCaseRank,
        worstCaseRank: percentileData.worstCaseRank,
        avgRank: percentileData.avgRank,
        bestCasePercentile: percentileData.bestCasePercentile,
        worstCasePercentile: percentileData.worstCasePercentile,
        avgPercentile: percentileData.avgPercentile,
        accuracy,
        status: 'COMPLETED',
        userId: 'system',
        institutionId: body.institutionId || null, // Handle optional institutionId
        templateId: body.templateId,
        examId: body.examId
      }
    })

    console.log('✅ Prediction created successfully:', prediction.id)

    // Send SSE notification to connected clients
    await sendSSENotification(prediction)

    return NextResponse.json({
      id: prediction.id,
      studentName: prediction.studentName,
      studentEmail: prediction.studentEmail,
      rollNumber: prediction.rollNumber,
      score,
      predictedRank,
      accuracy: `${accuracy}%`,
      status: prediction.status,
      templateName: template.name,
      examName: template.exams.length > 0 ? template.exams[0].name : null,
      createdAt: prediction.createdAt
    })

  } catch (error) {
    console.error('❌ Failed to create prediction:', error)
    return NextResponse.json(
      { error: 'Failed to create prediction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    const templateId = searchParams.get('templateId')
    const studentEmail = searchParams.get('studentEmail')
    const examId = searchParams.get('examId')
    const whereClause: any = {}
    if (institutionId) whereClause.institutionId = institutionId
    if (templateId) whereClause.templateId = templateId
    if (studentEmail) whereClause.studentEmail = studentEmail
    if (examId) whereClause.examId = examId

    const predictions = await prisma.prediction.findMany({
      where: whereClause,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            examCode: true
          }
        },
        institution: {
          select: {
            id: true,
            name: true
          }
        },
        exam: {
          select: {
            id: true,
            name: true,
            examCode: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

  
    return NextResponse.json(predictions, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ Failed to fetch predictions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch predictions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

function calculateScore(answers: Record<string, any>, conditions: PredictionConditions): number {
  const totalQuestions = Object.keys(answers).length
  if (totalQuestions === 0) return 0

  let correctAnswers = 0
  Object.values(answers).forEach(() => {
    if (Math.random() > 0.3) correctAnswers++
  })

  let score = (correctAnswers / totalQuestions) * 100

  // Apply difficulty-based adjustments from conditions
  if (conditions.difficulty) {
    switch (conditions.difficulty) {
      case 'easy':
        score = Math.min(100, score * 1.1)
        break
      case 'hard':
        score = score * 0.9
        break
      case 'medium':
      default:
        // No adjustment for medium
        break
    }
  }

  // Apply condition-based score constraints
  if (conditions.minScore && score < conditions.minScore) {
    console.log(`📊 Score ${score} below minimum ${conditions.minScore}, applying adjustment`)
    score = Math.max(score, conditions.minScore * 0.8) // Allow some flexibility
  }
  if (conditions.maxScore && score > conditions.maxScore) {
    console.log(`📊 Score ${score} above maximum ${conditions.maxScore}, applying adjustment`)
    score = Math.min(score, conditions.maxScore * 1.1) // Allow some flexibility
  }

  console.log(`🎯 Final calculated score: ${score}`)
  return Math.round(score)
}

function calculatePredictedRank(score: number, conditions: PredictionConditions): number {
  let baseRank = 1000
  const rankImprovement = (score / 100) * 900
  let predictedRank = Math.round(baseRank - rankImprovement)

  // Apply condition-based rank adjustments
  if (conditions.minScore && score < conditions.minScore) predictedRank += 200
  if (conditions.maxScore && score > conditions.maxScore) predictedRank -= 100

  console.log(`🏆 Base rank: ${baseRank}, Improvement: ${rankImprovement}, Predicted: ${predictedRank}`)
  return Math.max(1, Math.min(1000, predictedRank))
}

function calculateAccuracy(score: number, conditions: PredictionConditions): number {
  let accuracy = 85

  if (score >= 90) accuracy += 10
  else if (score >= 80) accuracy += 5
  else if (score < 50) accuracy -= 10

  if (conditions.subjects && Object.keys(conditions.subjects).length > 0) accuracy += 5
  if (conditions.passingCriteria) accuracy += 3

  return Math.max(50, Math.min(99, accuracy))
}