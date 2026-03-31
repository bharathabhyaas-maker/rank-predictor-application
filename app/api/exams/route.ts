import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  
  try {
    console.log('🔍 Fetching exams from database...')
    
    const { searchParams } = new URL(request.url)
    const examCode = searchParams.get('examCode')
    
    let whereClause = {}
    if (examCode) {
      whereClause = {
        examCode: {
          equals: examCode,
          mode: 'insensitive'
        }
      }
    }
    
    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: {
        template: {
          select: {
            id: true,
            name: true,
            examCode: true
          }
        },
        predictions: true,
        conditions: { // Include conditions from the new table
          select: {
            id: true,
            parameter: true,
            operator: true,
            value: true,
            operator2: true,
            value2: true,
            bestCasePercentile: true,
            worstCasePercentile: true,
            bestCaseRank: true,
            worstCaseRank: true,
            avgRank: true,
            avgPercentile: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    console.log(`✅ Found ${exams.length} exams`)

    const examStats = exams.map((exam: any) => ({
      id: exam.id,
      name: exam.name,
      examCode: exam.examCode,
      description: exam.description,
      date: exam.date.toISOString().split('T')[0],
      duration: exam.duration,
      status: exam.status.toLowerCase(),
      conditions: exam.conditions,
      template: exam.template,
      predictions: exam.predictions.length,
      createdAt: exam.createdAt.toISOString().split('T')[0]
    }))

    return NextResponse.json(examStats)
  } catch (error) {
    console.error('❌ Failed to fetch exams:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch exams',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  
  console.log('📝 Creating exam template in database...')
  
  try {
    const body = await request.json()
    console.log('📋 Creating exam template with data:', body)
    
    // Validate required fields for template creation
    if (!body.name || !body.examCode || !body.type) {
      console.error('❌ Missing required fields:', { 
        name: !!body.name, 
        examCode: !!body.examCode, 
        type: !!body.type
      })
      return NextResponse.json(
        { error: 'Missing required fields: name, examCode, and type are required' },
        { status: 400 }
      )
    }
    
    // Check if template with this examCode already exists
    const existingTemplate = await prisma.template.findUnique({
      where: { examCode: body.examCode }
    })
    
    if (existingTemplate) {
      console.error('❌ Template with this examCode already exists:', body.examCode)
      return NextResponse.json(
        { error: 'A template with this exam code already exists' },
        { status: 409 }
      )
    }
    
    console.log('💾 Creating template in database...')
    
    const template = await prisma.template.create({
      data: {
        name: body.name,
        examCode: body.examCode,
        description: body.description || null,
        type: body.type || 'ai'
      }
    })

    console.log('✅ Template created successfully in database:', template.id)

    // Create an exam linked to this template (required for conditional predictions)
    let exam = null
    // Always create exam for conditional predictions, even if no date is provided
    if (body.type === 'conditional' || body.config?.examDate) {
      try {
        const examData: any = {
          name: body.name,
          examCode: body.examCode,
          description: body.description,
          date: body.config?.examDate ? new Date(body.config.examDate) : new Date(), // Default to today if no date
          duration: body.config?.duration || 120,
          status: 'ACTIVE',
          templateId: template.id
        }
        
        console.log('🔍 Creating exam with data:', JSON.stringify(examData, null, 2))
        
        exam = await prisma.exam.create({
          data: examData
        })
        console.log('✅ Exam created successfully in database:', exam.id)
        
        // Save conditions to the separate ExamCondition table
        if (body.type === 'conditional' && body.config?.conditions && Array.isArray(body.config.conditions)) {
          console.log('💾 Saving conditions to ExamCondition table...')
          console.log('🔍 Body type:', body.type)
          console.log('🔍 Config conditions:', body.config.conditions)
          console.log('🔍 Conditions array length:', body.config.conditions.length)
          
          const conditionsToSave = body.config.conditions.filter((c: any) => c.parameter && c.operator && c.value)
          console.log('🔍 Filtered conditions to save:', conditionsToSave.length)
          
          for (const condition of conditionsToSave) {
            console.log('🔍 Saving condition:', condition)
            try {
              const savedCondition = await prisma.examCondition.create({
                data: {
                  examId: exam.id,
                  parameter: condition.parameter,
                  operator: condition.operator,
                  value: condition.value,
                  operator2: condition.operator2 || null,
                  value2: condition.value2 || null,
                  bestCasePercentile: condition.bestCasePercentile ? parseFloat(condition.bestCasePercentile) : null,
                  worstCasePercentile: condition.worstCasePercentile ? parseFloat(condition.worstCasePercentile) : null,
                  bestCaseRank: condition.bestCaseRank ? parseInt(condition.bestCaseRank) : null,
                  worstCaseRank: condition.worstCaseRank ? parseInt(condition.worstCaseRank) : null,
                  avgRank: condition.avgRank ? parseInt(condition.avgRank) : null,
                  avgPercentile: condition.avgPercentile ? parseFloat(condition.avgPercentile) : null,
                }
              })
              console.log('✅ Condition saved successfully:', savedCondition.id)
            } catch (conditionError) {
              console.error('❌ Failed to save condition:', conditionError)
              console.error('❌ Condition data:', condition)
            }
          }
          console.log(`✅ Saved ${conditionsToSave.length} conditions to database`)
        } else {
          console.log('⚠️ No conditions to save. Details:')
          console.log('  - Body type:', body.type)
          console.log('  - Body.config exists:', !!body.config)
          console.log('  - Body.config.conditions exists:', !!body.config?.conditions)
          console.log('  - Body.config.conditions is array:', Array.isArray(body.config?.conditions))
          console.log('  - Body.config.conditions length:', body.config?.conditions?.length || 0)
        }
        
      } catch (examError) {
        console.error('❌ Failed to create exam:', examError)
        console.error('❌ Exam creation error details:', {
          message: examError instanceof Error ? examError.message : 'Unknown error',
          body: body,
          conditions: body.config?.conditions
        })
        return NextResponse.json(
          { 
            error: 'Failed to create exam template',
            details: examError instanceof Error ? examError.message : 'Unknown error',
            body: body
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      id: template.id,
      name: template.name,
      examCode: template.examCode,
      type: body.type,
      description: template.description,
      status: 'active',
      config: body.config || {},
      createdAt: template.createdAt.toISOString().split('T')[0],
      updatedAt: template.createdAt.toISOString().split('T')[0],
      predictions: 0,
      accuracy: template.accuracy ? `${template.accuracy}%` : 'N/A',
      shareLink: template.examCode.toLowerCase().replace(/\s+/g, '-')
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Unhandled error in POST /api/exams:', error)
    
    let errorMessage = 'Failed to create exam template'
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'A template with this exam code already exists'
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid reference'
      } else if (error.message.includes('Database')) {
        errorMessage = 'Database connection error'
      } else {
        errorMessage = `Error: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  
  try {
    const body = await request.json()
    
    const exam = await prisma.exam.update({
      where: {
        id: body.id
      },
      data: {
        status: body.status?.toUpperCase() as any,
        date: body.date ? new Date(body.date) : undefined,
        duration: body.duration
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            examCode: true
          }
        },
        predictions: true
      }
    })

    return NextResponse.json({
      id: exam.id,
      name: exam.name,
      examCode: exam.examCode,
      description: exam.description,
      date: exam.date.toISOString().split('T')[0],
      duration: exam.duration,
      status: exam.status.toLowerCase(),
      template: exam.template,
      predictions: exam.predictions.length,
      createdAt: exam.createdAt.toISOString().split('T')[0]
    })
  } catch (error) {
    console.error('❌ Failed to update exam:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update exam',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Exam ID is required' },
        { status: 400 }
      )
    }
    
    await prisma.exam.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Exam deleted successfully'
    })
  } catch (error) {
    console.error('❌ Failed to delete exam:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete exam',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
