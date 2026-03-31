import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { Prisma } from '@/src/generated/prisma/client'

interface ConditionBasedPredictionRequest {
  studentName: string
  studentEmail: string
  rollNumber?: string
  institutionId: string
  examId: string
  answers: Record<string, any>
  // Student scores for condition evaluation
  totalScore?: number
  englishScore?: number
  reasoningScore?: number
  legalScore?: number
  gkScore?: number
  mathsScore?: number
}

interface ConditionEvaluation {
  parameter: string
  operator: string
  value: string
  operator2?: string
  value2?: string
  bestCasePercentile?: string
  worstCasePercentile?: string
  bestCaseRank?: string
  worstCaseRank?: string
  avgRank?: string
  avgPercentile?: string
}

function evaluateCondition(condition: ConditionEvaluation, studentData: ConditionBasedPredictionRequest): { matches: boolean } {
  // Get student value based on parameter
  let studentValue: number = 0
  
  switch (condition.parameter) {
    case 'Total Score':
      studentValue = studentData.totalScore || 0
      break
    case 'Percentile':
      studentValue = (studentData.totalScore || 0) / 500 * 100 // Assuming 500 max score
      break
    case 'Section Score - English':
      studentValue = studentData.englishScore || 0
      break
    case 'Section Score - Reasoning':
      studentValue = studentData.reasoningScore || 0
      break
    case 'Section Score - Legal':
      studentValue = studentData.legalScore || 0
      break
    case 'Section Score - GK':
      studentValue = studentData.gkScore || 0
      break
    case 'Section Score - Maths':
      studentValue = studentData.mathsScore || 0
      break
    default:
      studentValue = 0
  }
  
  const conditionValue = parseFloat(condition.value)
  const conditionValue2 = condition.value2 ? parseFloat(condition.value2) : null
  
  let matches = false
  
  switch (condition.operator) {
    case 'gte':
      matches = studentValue >= conditionValue
      break
    case 'lte':
      matches = studentValue <= conditionValue
      break
    case 'gt':
      matches = studentValue > conditionValue
      break
    case 'lt':
      matches = studentValue < conditionValue
      break
    case 'eq':
      matches = studentValue === conditionValue
      break
    case 'between':
      matches = conditionValue2 !== null 
        ? studentValue >= conditionValue && studentValue <= conditionValue2
        : false
      break
    default:
      matches = false
  }
  
  return { matches }
}

function calculatePrediction(studentData: ConditionBasedPredictionRequest): { percentile: number, rank: number } {
  const totalScore = studentData.totalScore || 0
  const maxScore = 500 // Assumed maximum score
  
  const percentile = (totalScore / maxScore) * 100
  const rank = Math.round((100 - percentile) * 100)
  
  return {
    percentile: Math.round(percentile * 10) / 10,
    rank: Math.max(1, rank)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔮 Creating condition-based prediction...')
    
    const body: ConditionBasedPredictionRequest = await request.json()
    console.log('📋 Condition-based prediction request:', body)
    
    // Validate required fields
    if (!body.studentName || !body.studentEmail || !body.examId || !body.institutionId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentName, studentEmail, examId, institutionId' },
        { status: 400 }
      )
    }
    
    // Get template directly by examCode (since prediction page uses examCode)
    let template = await prisma.template.findFirst({
      where: { 
        examCode: body.examId 
      }
    })

    // If not found by examCode, try by ID
    if (!template) {
      template = await prisma.template.findUnique({
        where: { id: body.examId }
      })
    }

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found for exam: ' + body.examId },
        { status: 404 }
      )
    }

    console.log('📋 Found template:', template.name, template.examCode)

    // Get conditions from template placeholders
    const templateConfig = template.placeholders as any
    const conditions = templateConfig?.conditions || []

    if (!conditions || conditions.length === 0) {
      return NextResponse.json(
        { error: 'No conditions found for this exam template' },
        { status: 400 }
      )
    }

    console.log('🔍 Found conditions:', conditions.length, 'from template:', template.name)
    
    // Evaluate student against conditions
    let matchedConditions: ConditionEvaluation[] = []
    let calculation: any = null
    let predictedPercentile: number = 50
    let predictedRank: number = 1000
    
    for (const condition of conditions) {
      const evaluation = evaluateCondition(condition, body)
      if (evaluation.matches) {
        matchedConditions.push(evaluation)
        calculation = {
          bestCaseRank: parseInt(condition.bestCaseRank),
          worstCaseRank: parseInt(condition.worstCaseRank),
          avgRank: parseInt(condition.avgRank),
          bestCasePercentile: parseFloat(condition.bestCasePercentile),
          worstCasePercentile: parseFloat(condition.worstCasePercentile),
          avgPercentile: parseFloat(condition.avgPercentile)
        }
        
        if (condition.avgPercentile) {
          predictedPercentile = parseFloat(condition.avgPercentile)
        } else {
          const best = parseFloat(condition.bestCasePercentile)
          const worst = parseFloat(condition.worstCasePercentile)
          predictedPercentile = (best + worst) / 2
        }
        
        if (condition.avgRank) {
          predictedRank = parseInt(condition.avgRank)
        } else if (condition.bestCaseRank && condition.worstCaseRank) {
          const best = parseInt(condition.bestCaseRank)
          const worst = parseInt(condition.worstCaseRank)
          predictedRank = Math.round((best + worst) / 2)
        }
        
        break // Use first matching condition
      }
    }
    
    // If no conditions matched, use fallback calculation
    if (!calculation) {
      calculation = calculatePrediction(body)
      predictedPercentile = calculation.percentile
      predictedRank = calculation.rank
    }
    
    // Always use 'conditional' for this endpoint
    const predictionType = 'conditional'

    const metadata = JSON.parse(JSON.stringify({
      conditions: matchedConditions,
      studentScores: {
        totalScore: body.totalScore,
        englishScore: body.englishScore,
        reasoningScore: body.reasoningScore,
        legalScore: body.legalScore,
        gkScore: body.gkScore,
        mathsScore: body.mathsScore
      }
    }))

    // Save prediction to database
    const prediction = await prisma.prediction.create({
      data: {
        studentName: body.studentName,
        studentEmail: body.studentEmail,
        rollNumber: body.rollNumber ?? null,
        userId: "dummy-user-id",
        templateId: template.id,
        institutionId: body.institutionId,
        examId: template.id,
        examName: template.name,
        examCode: template.examCode,
        predictedRank: predictedRank ?? 0,
        predictedPercentile: predictedPercentile ?? 0,
        bestCaseRank: calculation?.bestCaseRank || null,
        worstCaseRank: calculation?.worstCaseRank || null,
        bestCasePercentile: calculation?.bestCasePercentile || null,
        worstCasePercentile: calculation?.worstCasePercentile || null,
        avgRank: calculation?.avgRank || null,
        avgPercentile: calculation?.avgPercentile || null,
        status: 'completed',
        predictionType: predictionType,
        answers: JSON.parse(JSON.stringify(body.answers)),
        metadata
      }
    })

    console.log('✅ Conditional prediction created:', prediction)

    return NextResponse.json({
      success: true,
      prediction: {
        examId: body.examId,
        examName: template.name,
        totalScore: body.totalScore,
        maxPossibleScore: 500,
        percentage: (body.totalScore / 500) * 100,
        rankRange: {
          minRank: calculation?.bestCaseRank || prediction.predictedRank || 1000,
          predictedRank: prediction.predictedRank || 1000,
          maxRank: calculation?.worstCaseRank || prediction.predictedRank || 1000
        },
        percentile: {
          minPercentile: calculation?.bestCasePercentile || prediction.predictedPercentile || 50,
          predictedPercentile: prediction.predictedPercentile || 50,
          maxPercentile: calculation?.worstCasePercentile || prediction.predictedPercentile || 50
        },
        totalCandidates: 100000,
        calculationMethod: 'Condition-Based Prediction',
        formData: {
          email: body.studentEmail,
          fullName: body.studentName,
          rollNumber: body.rollNumber,
          institutionId: body.institutionId
        }
      }
    })

  } catch (error) {
    console.error('❌ Error in conditional prediction:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
