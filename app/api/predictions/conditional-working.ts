import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

interface ConditionBasedPredictionRequest {
  studentName: string
  studentEmail: string
  rollNumber?: string
  institutionId: string
  examId: string
  answers: Record<string, any>
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
  let studentValue = 0
  
  switch (condition.parameter) {
    case 'Total Score':
      studentValue = studentData.totalScore || 0
      break
    case 'Percentile':
      studentValue = (studentData.totalScore || 0) / 500 * 100
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
    
    // Get template directly by examCode
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
    let predictedPercentile = 50
    let predictedRank = 1000
    
    for (const condition of conditions) {
      const evaluation = evaluateCondition(condition, body)
      if (evaluation.matches) {
        matchedConditions.push(evaluation)
        
        // Use condition values directly
        const bestCaseRank = parseInt(condition.bestCaseRank)
        const worstCaseRank = parseInt(condition.worstCaseRank)
        const avgRank = parseInt(condition.avgRank)
        const bestCasePercentile = parseFloat(condition.bestCasePercentile)
        const worstCasePercentile = parseFloat(condition.worstCasePercentile)
        const avgPercentile = parseFloat(condition.avgPercentile)
        
        if (condition.avgPercentile) {
          predictedPercentile = avgPercentile
        } else {
          const best = bestCasePercentile
          const worst = worstCasePercentile
          predictedPercentile = (best + worst) / 2
        }
        
        if (condition.avgRank) {
          predictedRank = avgRank
        } else if (bestCaseRank && worstCaseRank) {
          const best = bestCaseRank
          const worst = worstCaseRank
          predictedRank = Math.round((best + worst) / 2)
        }
        
        break // Use first matching condition
      }
    }
    
    // If no conditions matched, use fallback calculation
    if (!calculation) {
      const totalScore = body.totalScore || 0
      const maxScore = 500
      const percentile = (totalScore / maxScore) * 100
      const rank = Math.round((100 - percentile) * 100)
      
      calculation = {
        percentile: Math.round(percentile * 10) / 10,
        rank: Math.max(1, rank),
        bestCaseRank: Math.max(1, rank - 1000),
        worstCaseRank: rank + 1000,
        avgRank: rank,
        bestCasePercentile: Math.min(100, percentile + 10),
        worstCasePercentile: Math.max(0, percentile - 10),
        avgPercentile: percentile
      }
      
      console.log('📊 Fallback calculation:', calculation)
    }
    
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
        predictionType: 'conditional',
        answers: JSON.parse(JSON.stringify(body.answers)),
        metadata: JSON.parse(JSON.stringify({
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
          minRank: calculation?.bestCaseRank || predictedRank || 1000,
          predictedRank: predictedRank || 1000,
          maxRank: calculation?.worstCaseRank || predictedRank || 1000
        },
        percentile: {
          minPercentile: calculation?.bestCasePercentile || predictedPercentile || 50,
          predictedPercentile: predictedPercentile || 50,
          maxPercentile: calculation?.worstCasePercentile || predictedPercentile || 50
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
