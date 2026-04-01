import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'

async function sendSSENotification(prediction: any) {
  try {
    global.latestPrediction = {
      id: prediction.id,
      studentName: prediction.studentName,
      studentEmail: prediction.studentEmail,
      rollNumber: prediction.rollNumber,
      templateName: prediction.examName,
      score: prediction.predictedPercentile || 0,
      percentile: prediction.predictedPercentile || 0,
      predictedRank: prediction.predictedRank || 0,
      status: prediction.status,
      createdAt: prediction.createdAt,
      institutionId: prediction.institutionId,
      examId: prediction.examId
    }
    console.log('📡 SSE Notification sent for conditional prediction:', prediction.id)
  } catch (error) {
    console.error('Error sending SSE notification:', error)
  }
}

declare global {
  var latestPrediction: any
}

interface ConditionBasedPredictionRequest {
  studentName: string
  studentEmail: string
  rollNumber?: string
  institutionId?: string
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
  operator2?: string | null
  value2?: string | null
  bestCasePercentile?: string
  worstCasePercentile?: string
  bestCaseRank?: string
  worstCaseRank?: string
  avgRank?: string
  avgPercentile?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔮 Creating condition-based prediction...')

    const body: ConditionBasedPredictionRequest = await request.json()
    console.log('📋 Condition-based prediction request:', body)

    if (!body.studentName || !body.studentEmail || !body.examId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentName, studentEmail, examId' },
        { status: 400 }
      )
    }

    // Find template by examCode
    let template = await prisma.template.findFirst({
      where: { examCode: body.examId }
    })

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

    // Get active exam with conditions
    const exam = await prisma.exam.findFirst({
      where: {
        templateId: template.id,
        status: 'ACTIVE'
      },
      include: {
        conditions: true
      }
    })

    if (!exam) {
      return NextResponse.json(
        { error: 'No active exam found for this template' },
        { status: 404 }
      )
    }

    const conditions = exam.conditions || []

    if (!conditions || conditions.length === 0) {
      return NextResponse.json(
        { error: 'No conditions found for this exam' },
        { status: 400 }
      )
    }

    console.log('🔍 Evaluating', conditions.length, 'conditions for score:', body.totalScore)

    // Evaluate conditions
    let matchedConditions: ConditionEvaluation[] = []

    for (const condition of conditions) {
      const mappedCondition: ConditionEvaluation = {
        parameter: condition.parameter,
        operator: condition.operator,
        value: condition.value,
        operator2: condition.operator2,
        value2: condition.value2,
        bestCasePercentile: condition.bestCasePercentile?.toString() || undefined,
        worstCasePercentile: condition.worstCasePercentile?.toString() || undefined,
        bestCaseRank: condition.bestCaseRank?.toString() || undefined,
        worstCaseRank: condition.worstCaseRank?.toString() || undefined,
        avgRank: condition.avgRank?.toString() || undefined,
        avgPercentile: condition.avgPercentile?.toString() || undefined
      }

      const evaluation = evaluateCondition(mappedCondition, body)
      console.log(`  Condition: ${condition.parameter} ${condition.operator} ${condition.value}${condition.operator2 ? ` AND ${condition.operator2} ${condition.value2}` : ''} → matches: ${evaluation.matches}`)

      if (evaluation.matches) {
        matchedConditions.push(mappedCondition)
      }
    }

    console.log('✅ Matched conditions:', matchedConditions.length)

    let calculation: any

    if (matchedConditions.length > 0) {
      const primaryCondition = matchedConditions[0]
      calculation = calculatePrediction(primaryCondition, body)
      console.log('📊 Condition-based calculation:', calculation)
    } else {
      // Fallback when no condition matches
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

      console.log('📊 Fallback calculation (no condition matched):', calculation)
    }

    // ─── BUG 1 FIX ────────────────────────────────────────────────────────────
    // Previously predictedRank and predictedPercentile were declared as
    // let predictedRank = 1000 / let predictedPercentile = 50 and NEVER updated
    // from calculation. Now we read directly from calculation.
    const predictedRank = calculation.rank
    const predictedPercentile = calculation.percentile
    // ─────────────────────────────────────────────────────────────────────────

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

    // ─── BUG 2 FIX ────────────────────────────────────────────────────────────
    // Previously examId was set to template.id (a UUID) which caused mismatches
    // when the results page looked up by examCode. Now we use exam.id correctly.
    const prediction = await prisma.prediction.create({
      data: {
        studentName: body.studentName,
        studentEmail: body.studentEmail,
        rollNumber: body.rollNumber ?? null,
        userId: "dummy-user-id",
        templateId: template.id,
        institutionId: body.institutionId || undefined,
        examId: exam.id,           // ← use actual exam.id, not template.id
        examName: exam.name,       // ← use exam name, not template name
        examCode: template.examCode,
        predictedRank,             // ← now correctly from calculation
        predictedPercentile,       // ← now correctly from calculation
        bestCaseRank: calculation.bestCaseRank || null,
        worstCaseRank: calculation.worstCaseRank || null,
        bestCasePercentile: calculation.bestCasePercentile || null,
        worstCasePercentile: calculation.worstCasePercentile || null,
        avgRank: calculation.avgRank || null,
        avgPercentile: calculation.avgPercentile || null,
        status: 'completed',
        predictionType,
        answers: JSON.parse(JSON.stringify(body.answers)),
        metadata
      }
    })

    console.log('✅ Condition-based prediction created:', prediction.id)
    console.log(`   Score: ${body.totalScore} → Percentile: ${predictedPercentile}% → Rank: ${predictedRank}`)

    await sendSSENotification(prediction)

    return NextResponse.json({
      success: true,
      prediction: {
        id: prediction.id,
        studentName: prediction.studentName,
        studentEmail: prediction.studentEmail,
        predictedRank: prediction.predictedRank,
        predictedPercentile: prediction.predictedPercentile,
        bestCaseRank: prediction.bestCaseRank,
        worstCaseRank: prediction.worstCaseRank,
        bestCasePercentile: prediction.bestCasePercentile,
        worstCasePercentile: prediction.worstCasePercentile,
        avgRank: prediction.avgRank,
        avgPercentile: prediction.avgPercentile,
        examName: prediction.examName,
        examCode: prediction.examCode,
        status: prediction.status,
        predictionType: prediction.predictionType,
        createdAt: prediction.createdAt
      }
    })

  } catch (error) {
    console.error('❌ Error creating condition-based prediction:', error)
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    )
  }
}

function evaluateCondition(
  condition: ConditionEvaluation,
  studentData: ConditionBasedPredictionRequest
): { matches: boolean } {
  const { parameter, operator, value, operator2, value2 } = condition

  let studentValue: number = 0
  switch (parameter) {
    case "Total Score":
      studentValue = studentData.totalScore || 0
      break
    case "Percentile":
      studentValue = ((studentData.totalScore || 0) / 500) * 100
      break
    case "Section Score - English":
      studentValue = studentData.englishScore || 0
      break
    case "Section Score - Reasoning":
      studentValue = studentData.reasoningScore || 0
      break
    case "Section Score - Legal":
      studentValue = studentData.legalScore || 0
      break
    case "Section Score - GK":
      studentValue = studentData.gkScore || 0
      break
    case "Section Score - Maths":
      studentValue = studentData.mathsScore || 0
      break
    default:
      console.warn('⚠️ Unknown condition parameter:', parameter)
      return { matches: false }
  }

  const conditionValue = parseFloat(value)

  const evaluateOperator = (op: string, studentVal: number, condVal: number): boolean => {
    switch (op) {
      case "gte":     return studentVal >= condVal
      case "lte":     return studentVal <= condVal
      case "gt":      return studentVal > condVal
      case "lt":      return studentVal < condVal
      case "eq":      return studentVal === condVal
      case "between": return false // handled separately
      default:        return false
    }
  }

  // Handle "between" as a single operator with value2
  if (operator === "between" && value2) {
    const val2 = parseFloat(value2)
    return { matches: studentValue >= conditionValue && studentValue <= val2 }
  }

  const matchesFirst = evaluateOperator(operator, studentValue, conditionValue)

  // Second condition (e.g. gt 270 AND lte 300)
  if (operator2 && value2) {
    const condition2Value = parseFloat(value2)
    const matchesSecond = evaluateOperator(operator2, studentValue, condition2Value)
    return { matches: matchesFirst && matchesSecond }
  }

  return { matches: matchesFirst }
}

function calculatePrediction(
  condition: ConditionEvaluation,
  studentData: ConditionBasedPredictionRequest
): {
  percentile: number
  rank: number
  bestCaseRank: number
  worstCaseRank: number
  avgRank: number
  bestCasePercentile: number
  worstCasePercentile: number
  avgPercentile: number
} {
  // Use avgPercentile as the primary percentile — it's the direct DB value (e.g. 99.7)
  let predictedPercentile = 50
  let predictedRank = 1000

  if (condition.avgPercentile) {
    predictedPercentile = parseFloat(condition.avgPercentile)
  } else if (condition.bestCasePercentile && condition.worstCasePercentile) {
    predictedPercentile =
      (parseFloat(condition.bestCasePercentile) + parseFloat(condition.worstCasePercentile)) / 2
  }

  if (condition.avgRank) {
    predictedRank = parseInt(condition.avgRank)
  } else if (condition.bestCaseRank && condition.worstCaseRank) {
    predictedRank = Math.round(
      (parseInt(condition.bestCaseRank) + parseInt(condition.worstCaseRank)) / 2
    )
  }

  return {
    percentile: Math.round(predictedPercentile * 10) / 10,
    rank: Math.max(1, predictedRank),
    bestCaseRank: condition.bestCaseRank
      ? parseInt(condition.bestCaseRank)
      : Math.max(1, predictedRank - 1000),
    worstCaseRank: condition.worstCaseRank
      ? parseInt(condition.worstCaseRank)
      : predictedRank + 1000,
    avgRank: predictedRank,
    bestCasePercentile: condition.bestCasePercentile
      ? parseFloat(condition.bestCasePercentile)
      : Math.min(100, predictedPercentile + 2),
    worstCasePercentile: condition.worstCasePercentile
      ? parseFloat(condition.worstCasePercentile)
      : Math.max(0, predictedPercentile - 2),
    avgPercentile: predictedPercentile
  }
}

