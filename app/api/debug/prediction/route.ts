import { NextRequest, NextResponse } from 'next/server'
import { predictRank, type PredictionData } from '@/utils/rankPrediction'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Debug: Testing prediction with data:', body)
    
    const { examId, score, maxScore, formData, subjectData } = body
    
    // Mock config for testing
    const config = {
      name: 'Test Exam',
      subjects: [
        { name: 'Subject 1', totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 },
        { name: 'Subject 2', totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 },
        { name: 'Subject 3', totalQuestions: 25, positiveMarks: 4, negativeMarks: 1 }
      ],
      requireHallTicket: true,
      askExpectedScore: true,
      collectCity: true
    }
    
    console.log('🔍 Debug: Calling predictRank with:', { examId, score, maxScore })
    
    const predictionData = predictRank(examId, score, maxScore, formData, subjectData, config)
    
    console.log('✅ Debug: Prediction result:', predictionData)
    
    return NextResponse.json({
      success: true,
      predictionData,
      message: 'Prediction calculation successful'
    })
    
  } catch (error) {
    console.error('❌ Debug: Prediction failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 })
  }
}
