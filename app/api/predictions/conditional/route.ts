import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/database'
import { Prisma } from '../../../../src/generated/prisma/client'

// SSE notification function
async function sendSSENotification(prediction: any) {
  try {
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
    
    // Store in memory for the SSE endpoint to pick up
    global.latestPrediction = latestPrediction
    
    console.log('📡 SSE Notification sent for conditional prediction:', prediction.id)
    
  } catch (error) {
    console.error('Error sending SSE notification:', error)
  }
}

// Extend the global type to include latest prediction
declare global {
  var latestPrediction: any
}

interface ConditionBasedPredictionRequest {
  studentName: string
  studentEmail: string
  rollNumber?: string
  institutionId?: string // Made optional for public access
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

export async function POST(request: NextRequest) {
  try {
    console.log('🔮 Creating condition-based prediction...')
    
    const body: ConditionBasedPredictionRequest = await request.json()
    console.log('📋 Condition-based prediction request:', body)
    
    // Validate required fields
    if (!body.studentName || !body.studentEmail || !body.examId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentName, studentEmail, examId' },
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
        matchedConditions.push(condition)
      }
    }
    
    console.log('✅ Matched conditions:', matchedConditions.length)
    
    // Calculate prediction based on matched conditions
    if (matchedConditions.length > 0) {
      // Use first matched condition for prediction
      const primaryCondition = matchedConditions[0]
      
      // Calculate percentile and rank based on condition values
      calculation = calculatePrediction({
        parameter: primaryCondition.parameter,
        operator: primaryCondition.operator,
        value: primaryCondition.value,
        operator2: primaryCondition.operator2,
        value2: primaryCondition.value2,
        bestCasePercentile: primaryCondition.bestCasePercentile,
        worstCasePercentile: primaryCondition.worstCasePercentile,
        bestCaseRank: primaryCondition.bestCaseRank,
        worstCaseRank: primaryCondition.worstCaseRank,
        avgRank: primaryCondition.avgRank,
        avgPercentile: primaryCondition.avgPercentile
      }, body)
      
      console.log('📊 Primary calculation:', calculation)
    } else {
      // Fallback calculation based on total score
      const totalScore = body.totalScore || 0
      const maxScore = 500 // Assumed maximum score
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

        // ✅ FIX: no undefined allowed
        rollNumber: body.rollNumber ?? null,

        // ✅ REQUIRED FIELDS (MISSING BEFORE)
        userId: "dummy-user-id", // ⚠️ replace later with auth user
        templateId: template.id,
        institutionId: body.institutionId || undefined, // Handle optional institutionId

        examId: template.id, // Use template ID as exam ID since no exam record
        examName: template.name,
        examCode: template.examCode,

        // ✅ FIX: Prisma doesn't like null for required numbers
        predictedRank: predictedRank ?? 0,
        predictedPercentile: predictedPercentile ?? 0,

        // ✅ FIX: safe numeric handling - use calculation values
        bestCaseRank: calculation.bestCaseRank || null,
        worstCaseRank: calculation.worstCaseRank || null,
        bestCasePercentile: calculation.bestCasePercentile || null,
        worstCasePercentile: calculation.worstCasePercentile || null,
        avgRank: calculation.avgRank || null,
        avgPercentile: calculation.avgPercentile || null,

        status: 'completed',
        predictionType: predictionType,

        // ✅ FIX: ensure valid JSON
        answers: JSON.parse(JSON.stringify(body.answers)),

        // ✅ FIX: clean JSON (NO Prisma casting needed)
        metadata
      }
    })
    
    console.log('✅ Condition-based prediction created:', prediction.id)
    
    // Send SSE notification to connected clients
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

function evaluateCondition(condition: ConditionEvaluation, studentData: ConditionBasedPredictionRequest): { matches: boolean } {
  const { parameter, operator, value, operator2, value2 } = condition
  
  // Get student value based on parameter
  let studentValue: number = 0
  switch (parameter) {
    case "Total Score":
      studentValue = studentData.totalScore || 0
      break
    case "Percentile":
      // Calculate percentile from total score (assuming max 500)
      const percentile = ((studentData.totalScore || 0) / 500) * 100
      studentValue = percentile
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
      return { matches: false }
  }
  
  const conditionValue = parseFloat(value)
  
  // Evaluate first condition
  let matchesFirst = false
  switch (operator) {
    case "gte":
      matchesFirst = studentValue >= conditionValue
      break
    case "lte":
      matchesFirst = studentValue <= conditionValue
      break
    case "gt":
      matchesFirst = studentValue > conditionValue
      break
    case "lt":
      matchesFirst = studentValue < conditionValue
      break
    case "eq":
      matchesFirst = studentValue === conditionValue
      break
    case "between":
      if (operator2 && value2) {
        const value2Num = parseFloat(value2)
        matchesFirst = studentValue >= conditionValue && studentValue <= value2Num
      }
      break
  }
  
  // If second condition exists, evaluate it
  if (operator2 && value2) {
    const condition2Value = parseFloat(value2)
    let matchesSecond = false
    
    switch (operator2) {
      case "gte":
        matchesSecond = studentValue >= condition2Value
        break
      case "lte":
        matchesSecond = studentValue <= condition2Value
        break
      case "gt":
        matchesSecond = studentValue > condition2Value
        break
      case "lt":
        matchesSecond = studentValue < condition2Value
        break
      case "eq":
        matchesFirst = studentValue === conditionValue
        matchesSecond = studentValue === condition2Value
        break
    }
    
    return { matches: matchesFirst && matchesSecond }
  }
  
  return { matches: matchesFirst }
}

function calculatePrediction(condition: ConditionEvaluation, studentData: ConditionBasedPredictionRequest): { percentile: number, rank: number, bestCaseRank: number, worstCaseRank: number, avgRank: number, bestCasePercentile: number, worstCasePercentile: number, avgPercentile: number } {
  // Use the actual condition values as entered in the exam creation
  let predictedPercentile = 50 // Default
  let predictedRank = 1000 // Default
  
  // Use the actual values from the condition if available
  if (condition.avgPercentile) {
    predictedPercentile = parseFloat(condition.avgPercentile)
  } else if (condition.bestCasePercentile && condition.worstCasePercentile) {
    // Fallback to average of best and worst case
    const best = parseFloat(condition.bestCasePercentile)
    const worst = parseFloat(condition.worstCasePercentile)
    predictedPercentile = (best + worst) / 2
  }
  
  if (condition.avgRank) {
    predictedRank = parseInt(condition.avgRank)
  } else if (condition.bestCaseRank && condition.worstCaseRank) {
    // Fallback to average of best and worst case
    const best = parseInt(condition.bestCaseRank)
    const worst = parseInt(condition.worstCaseRank)
    predictedRank = Math.round((best + worst) / 2)
  }
  
  return {
    percentile: Math.round(predictedPercentile * 10) / 10,
    rank: Math.max(1, predictedRank),
    bestCaseRank: condition.bestCaseRank ? parseInt(condition.bestCaseRank) : Math.max(1, predictedRank - 1000),
    worstCaseRank: condition.worstCaseRank ? parseInt(condition.worstCaseRank) : predictedRank + 1000,
    avgRank: predictedRank,
    bestCasePercentile: condition.bestCasePercentile ? parseFloat(condition.bestCasePercentile) : Math.min(100, predictedPercentile + 10),
    worstCasePercentile: condition.worstCasePercentile ? parseFloat(condition.worstCasePercentile) : Math.max(0, predictedPercentile - 10),
    avgPercentile: predictedPercentile
  }
}

