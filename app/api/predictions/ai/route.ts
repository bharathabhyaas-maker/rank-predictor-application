import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getAIPrediction } from '@/lib/gemini'

// Global storage for latest prediction (shared across API routes)
declare global {
  var latestPrediction: any
}

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
    
    console.log('📡 SSE Notification sent for AI prediction:', prediction.id)
    
  } catch (error) {
    console.error('Error sending SSE notification:', error)
  }
}

// Extend the global type to include latest prediction
declare global {
  var latestPrediction: any
}

interface AIPredictionRequest {
  studentName: string
  studentEmail: string
  rollNumber?: string
  institutionId?: string // Made optional for public access
  examId: string
  templateId?: string // Made optional - handle missing templates gracefully
  totalScore: number
  answers?: Record<string, any>
  aiSource?: 'dataset' | 'internet' // Add AI source selection
  datasetId?: string // Add dataset ID for dataset-based predictions
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Creating AI-based prediction with Gemini...')
    
    const body: AIPredictionRequest = await request.json()
    console.log('📋 AI prediction request:', body)
    
    // Validate required fields
    if (!body.studentName || !body.studentEmail || !body.examId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentName, studentEmail, examId' },
        { status: 400 }
      )
    }

    // Get exam details (case-insensitive search)
    let exam = null;
    try {
      exam = await prisma.exam.findFirst({
        where: { 
          OR: [
            { id: { equals: body.examId, mode: 'insensitive' } },
            { examCode: { equals: body.examId, mode: 'insensitive' } }
          ]
        },
        include: {
          template: true
        }
      });
    } catch (examError) {
      console.log('⚠️ Could not find exam, continuing without exam association:', examError);
    }

    if (!exam) {
      console.log('⚠️ Exam not found, creating fallback exam entry...');
      // Create a fallback exam entry if not found
      try {
        exam = await prisma.exam.create({
          data: {
            name: body.examId.replace(/-/g, ' ').toUpperCase(),
            examCode: body.examId.toUpperCase(),
            status: 'ACTIVE',
            templateId: null // No template for fallback
          }
        });
        console.log('✅ Created fallback exam:', exam.id, exam.examCode);
      } catch (createError) {
        console.log('⚠️ Could not create fallback exam, using examId directly:', createError);
        // Continue with null exam - the save API will handle this
      }
    }

    console.log('📋 Found exam:', exam?.name, exam?.examCode)

    // Get template details to check AI source
    const template = body.templateId
      ? await prisma.template.findFirst({
          where: { id: body.templateId }
        })
      : null

    // ✅ Allow fallback (DO NOT BLOCK)
    if (!template) {
      console.log("⚠️ Template not found → continuing without template")
      console.log("📋 Using fallback mode for AI prediction")
    } else {
      console.log('📋 Found template:', template.name, 'Type:', template.type)
    }

    // Determine AI source and get dataset data if needed
    let aiSource = body.aiSource || 'internet' // Default to internet
    let datasetData = null

    if (aiSource === 'dataset' && body.datasetId) {
      // Get dataset information for pattern analysis
      const dataset = await prisma.dataset.findFirst({
        where: { id: body.datasetId }
      })
      
      if (dataset) {
        datasetData = {
          name: dataset.name,
          records: dataset.recordCount || 0,
          size: 'Unknown', // Can be calculated from fileUrl if needed
          totalCandidates: dataset.recordCount || 1000000,
          patterns: {
            // You can add pattern analysis here based on your dataset structure
            avgScore: 0, // Would need analysis of dataset data
            maxScore: 0, // Would need analysis of dataset data
            minScore: 0, // Would need analysis of dataset data
            scoreDistribution: {} // Would need analysis of dataset data
          }
        }
        console.log('📊 Using dataset for AI prediction:', dataset.name)
      }
    }

    console.log('🤖 AI Source:', aiSource, 'Dataset:', datasetData?.name || 'None')

    // Get AI prediction from Gemini with appropriate data source
    console.log('🤖 Calling Gemini AI for prediction...')
    console.log('📋 AI Parameters:', {
      score: body.totalScore,
      examName: exam?.name || 'Unknown Exam',
      aiSource: aiSource,
      hasDatasetData: !!datasetData,
      apiKeyExists: !!process.env.GEMINI_API_KEY
    })
    
    const aiResponse = await getAIPrediction({
      score: body.totalScore || 0,
      examName: exam?.name || 'Unknown Exam',
      aiSource: aiSource,
      datasetId: body.datasetId,
      datasetData: datasetData
    })

    console.log("🤖 Gemini AI Response:", aiResponse)
    console.log("📊 Response length:", aiResponse.length)

    // Parse AI response
    let parsed: any = {}
    try {
      parsed = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError)
      console.error('❌ Raw response:', aiResponse)
      
      // Use enhanced fallback prediction instead of generic hardcoded values
      const fallbackResponse = getEnhancedFallbackPrediction(body.totalScore || 0, exam?.name || 'Unknown Exam');
      console.log('🔄 Using enhanced fallback prediction:', fallbackResponse);
      
      try {
        parsed = JSON.parse(fallbackResponse);
      } catch (fallbackError) {
        console.error('❌ Failed to parse fallback response:', fallbackError);
        // Final fallback with realistic values
        const score = body.totalScore || 0;
        const percentage = Math.min(95, Math.max(5, (score / 300) * 100));
        const rank = Math.max(1, Math.floor(1200000 * (1 - percentage / 100)));
        
        parsed = {
          percentile: percentage,
          rank: rank,
          bestCasePercentile: Math.min(99.9, percentage + 5),
          bestCaseRank: Math.max(1, Math.floor(rank * 0.8)),
          worstCasePercentile: Math.max(0.1, percentage - 5),
          worstCaseRank: Math.min(1200000, Math.floor(rank * 1.2)),
          avgPercentile: percentage,
          avgRank: rank
        };
      }
    }

    const predictedPercentile = parsed.percentile ?? 50
    const predictedRank = parsed.rank ?? 5000
    const bestCasePercentile = parsed.bestCasePercentile ?? predictedPercentile + 10
    const bestCaseRank = parsed.bestCaseRank ?? Math.max(1, predictedRank - 1000)
    const worstCasePercentile = parsed.worstCasePercentile ?? predictedPercentile - 10
    const worstCaseRank = parsed.worstCaseRank ?? predictedRank + 1000
    const avgPercentile = parsed.avgPercentile ?? predictedPercentile
    const avgRank = parsed.avgRank ?? predictedRank

    console.log('📊 Parsed AI prediction:', {
      predictedPercentile,
      predictedRank,
      bestCasePercentile,
      bestCaseRank,
      worstCasePercentile,
      worstCaseRank,
      avgPercentile,
      avgRank
    })

    // Find or create a user for the prediction
    let userId = "dummy-user-id";
    try {
      // Try to find existing user by email
      const existingUser = await prisma.user.findFirst({
        where: { email: body.studentEmail }
      });
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create a new user if not found
        const newUser = await prisma.user.create({
          data: {
            email: body.studentEmail,
            name: body.studentName,
            password: "dummy-password", // Should be properly handled
            role: "STUDENT"
          }
        });
        userId = newUser.id;
        console.log('✅ Created new user for prediction:', userId);
      }
    } catch (userError) {
      console.error('⚠️ Error handling user:', userError);
      // Continue with dummy user ID as fallback
    }

    // Save prediction to database
    const prediction = await prisma.prediction.create({
      data: {
        studentName: body.studentName,
        studentEmail: body.studentEmail,
        rollNumber: body.rollNumber ?? null,
        
        // Use the found/created user ID
        userId: userId,
        templateId: body.templateId || null, // Handle null templateId gracefully
        institutionId: body.institutionId || undefined, // Handle optional institutionId
        
        examId: exam?.id || null,
        examName: exam?.name || body.examId,
        examCode: exam?.examCode || body.examId,
        
        // AI prediction values
        predictedRank: predictedRank,
        predictedPercentile: predictedPercentile,
        bestCaseRank: bestCaseRank,
        worstCaseRank: worstCaseRank,
        bestCasePercentile: bestCasePercentile,
        worstCasePercentile: worstCasePercentile,
        avgRank: avgRank,
        avgPercentile: avgPercentile,
        
        status: 'completed',
        predictionType: 'ai',
        
        answers: JSON.parse(JSON.stringify(body.answers || {})),
        metadata: JSON.parse(JSON.stringify({
          aiResponse: aiResponse,
          parsedResponse: parsed,
          totalScore: body.totalScore,
          aiModel: 'gemini-2.5-flash',
          aiSource: aiSource,
          datasetId: body.datasetId,
          datasetName: datasetData?.name || null,
          confidence: parsed.confidence || 0,
          dataSource: parsed.dataSource || 'internet'
        }))
      }
    })
    
    console.log('✅ AI-based prediction created:', prediction.id)
    
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
        createdAt: prediction.createdAt,
        // Add AI source information
        aiSource: aiSource,
        datasetId: body.datasetId,
        datasetName: datasetData?.name || null,
        confidence: parsed.confidence || 0,
        dataSource: parsed.dataSource || 'internet'
      }
    })
    
  } catch (error) {
    console.error('❌ Error creating AI prediction:', error)
    return NextResponse.json(
      { error: 'Failed to create AI prediction' },
      { status: 500 }
    )
  }
}
