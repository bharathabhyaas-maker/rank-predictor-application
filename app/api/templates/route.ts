import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// Helper functions to determine template types temporarily
function getTemplateType(examCode: string, templateName: string): string {
  if (examCode === 'CLAT-2025') {
    return 'conditional'
  }
  return 'ai'
}

function getPromptTemplate(examCode: string, templateName: string): string {
  if (examCode.includes('CLAT')) {
    return `You are a percentile prediction expert for ${templateName}. Given a student score of {{score}} out of {{totalMarks}}, predict their likely percentile considering {{candidateCount}} expected candidates and {{difficulty}} paper difficulty.`
  } else if (examCode.includes('JEE')) {
    return `Analyze JEE score of {{score}} out of {{totalMarks}} using historical dataset patterns. Consider {{candidateCount}} candidates and {{normalization}} normalization.`
  } else if (examCode.includes('NEET')) {
    return `Analyze NEET UG score of {{score}} out of {{totalMarks}} marks using historical dataset patterns. With {{candidateCount}} candidates expected and considering {{difficulty}} difficulty level, predict percentile range.`
  }
  return `Analyze student score of {{score}} out of {{totalMarks}} for ${templateName}.`
}

function getPlaceholders(examCode: string, templateName: string): any {
  if (examCode.includes('CLAT')) {
    return {
      examName: templateName,
      totalMarks: "150",
      candidateCount: "75000",
      difficulty: "Moderate",
      historicalAvg: "85"
    }
  } else if (examCode.includes('JEE')) {
    return {
      examName: templateName,
      totalMarks: "300",
      candidateCount: "1200000",
      normalization: "Yes",
      shift_adjustment: "Enabled"
    }
  } else if (examCode.includes('NEET')) {
    return {
      examName: templateName,
      totalMarks: "720",
      candidateCount: "2400000",
      difficulty: "Moderate"
    }
  }
  return {
    examName: templateName,
    totalMarks: "500",
    candidateCount: "100000"
  }
}

// Type definitions
interface TemplateWithRelations {
  id: string
  name: string
  examCode: string
  description: string | null
  type?: string | null
  status?: string | null
  accuracy: number | null
  createdAt: Date
  updatedAt: Date
  assignedTo: {
    id: string
    institutionId: string
    templateId: string
    assignedAt: Date
    status: string
    institution: {
      id: string
      name: string
    }
  }[]
  predictions: {
    id: string
    institutionId: string
    templateId: string
  }[]
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching templates from database...')

    const { searchParams } = new URL(request.url)
    const examCode = searchParams.get('examCode')

    let templates;
    if (examCode) {
      templates = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        examCode: string;
        description: string | null;
        accuracy: number | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
      }>>`
        SELECT id, name, "examCode", description, accuracy, "createdAt", "updatedAt", type
        FROM templates 
        WHERE "examCode" = ${examCode}
        ORDER BY "createdAt" DESC
      `
    } else {
      templates = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        examCode: string;
        description: string | null;
        accuracy: number | null;
        createdAt: Date;
        updatedAt: Date;
        type: string;
      }>>`
        SELECT id, name, "examCode", description, accuracy, "createdAt", "updatedAt", type
        FROM templates 
        ORDER BY "createdAt" DESC
      `
    }

    console.log(`✅ Found ${templates.length} templates`)

    const templateIds = templates.map((t) => t.id)

    let assignments: Array<{
      templateId: string;
      institutionId: string;
      assignedAt: Date;
      status: string;
    }> = []
    if (templateIds.length > 0) {
      const assignmentsResult = await prisma.$queryRaw<Array<{
        templateId: string;
        institutionId: string;
        assignedAt: Date;
        status: string;
      }>>`
        SELECT "templateId", "institutionId", "assignedAt", status
        FROM "institution_templates"
        WHERE "templateId" = ANY(${templateIds})
      `
      assignments = assignmentsResult
    }

    let predictions: Array<{
      templateId: string;
      institutionId: string;
      studentEmail: string;
    }> = []
    if (templateIds.length > 0) {
      const predictionsResult = await prisma.$queryRaw<Array<{
        templateId: string;
        institutionId: string;
        studentEmail: string;
      }>>`
        SELECT "templateId", "institutionId", "studentEmail"
        FROM predictions
        WHERE "templateId" = ANY(${templateIds})
      `
      predictions = predictionsResult
    }

    // FIX: Fetch all exams with conditions for all templateIds in one query — outside the loop
    let examsWithConditions: Array<{
      id: string;
      templateId: string;
      conditions: Array<{ id: string }>
    }> = []
    if (templateIds.length > 0) {
      try {
        examsWithConditions = await prisma.exam.findMany({
          where: {
            templateId: { in: templateIds }   // ✅ Fixed: single argument object, no stray `{`
          },
          include: {
            conditions: true
          }
        })
      } catch (error) {
        console.log('Error fetching exams with conditions:', error)
      }
    }

    const transformedTemplates = templates.map((template) => {
      const templateAssignments = assignments.filter(a => a.templateId === template.id)
      const assignedInstitutionIds = templateAssignments.map(a => a.institutionId)
      const validPredictions = predictions.filter(p => assignedInstitutionIds.includes(p.institutionId))

      // FIX: Check conditions for THIS specific template only, using pre-fetched data
      const examForTemplate = examsWithConditions.find(e => e.templateId === template.id)
      const hasConditions = !!(
        examForTemplate &&
        examForTemplate.conditions &&
        examForTemplate.conditions.length > 0
      )

      return {
        id: template.id,
        name: template.name,
        examCode: template.examCode,
        description: template.description,
        type: template.type || 'ai',
        promptTemplate: getPromptTemplate(template.examCode, template.name),
        placeholders: getPlaceholders(template.examCode, template.name),
        hasConditions,
        predictions: validPredictions.length,
        status: 'ACTIVE',
        accuracy: template.accuracy?.toString() || '0',
        shareLink: template.examCode.toLowerCase().replace(/\s+/g, '-'),
        assignedTo: templateAssignments.map(assignment => ({
          institutionId: assignment.institutionId,
          assignedAt: assignment.assignedAt
        })),
        createdAt: template.createdAt.toISOString().split('T')[0],
        assignedInstitutions: templateAssignments.length
      }
    })

    console.log(transformedTemplates)

    return NextResponse.json(transformedTemplates, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Failed to fetch templates:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('📝 Creating template in database...')

  try {
    const body = await request.json()
    console.log('📋 Creating template with data:', body)

    interface CreateTemplateRequest {
      name: string
      examCode: string
      description?: string
      type?: string
      status?: string
      accuracy?: number
    }

    const templateData: CreateTemplateRequest = body

    if (!templateData.name || !templateData.examCode) {
      console.error('❌ Missing required fields:', { name: !!templateData.name, examCode: !!templateData.examCode })
      return NextResponse.json(
        { error: 'Missing required fields: name and examCode are required' },
        { status: 400 }
      )
    }

    const existingTemplate = await prisma.template.findUnique({
      where: { examCode: templateData.examCode }
    })

    if (existingTemplate) {
      console.error('❌ Template with this examCode already exists:', templateData.examCode)
      return NextResponse.json(
        { error: 'A template with this exam code already exists' },
        { status: 409 }
      )
    }

    console.log('💾 Creating template in database...')

    const template = await prisma.template.create({
      data: {
        name: templateData.name,
        examCode: templateData.examCode,
        description: templateData.description,
        type: templateData.type || 'ai',
        accuracy: templateData.accuracy ? parseFloat(templateData.accuracy.toString()) : null
      }
    })

    console.log('✅ Template created successfully in database:', template.id)

    return NextResponse.json({
      id: template.id,
      name: template.name,
      examCode: template.examCode,
      description: template.description,
      type: template.type,
      status: template.status,
      accuracy: template.accuracy ? `${template.accuracy}%` : 'N/A',
      shareLink: template.examCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      predictions: 0,
      createdAt: template.createdAt.toISOString().split('T')[0],
      assignedInstitutions: 0
    }, { status: 201 })
  } catch (error) {
    console.error('❌ Failed to create template:', error)

    let errorMessage = 'Failed to create template'
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'A template with this exam code already exists'
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

    interface UpdateTemplateRequest {
      id: string
      status: string
      accuracy?: number
    }

    const updateData: UpdateTemplateRequest = body

    const template = await prisma.template.update({
      where: {
        id: updateData.id
      },
      data: {
        accuracy: updateData.accuracy ? parseFloat(updateData.accuracy.toString()) : undefined
      }
    })

    return NextResponse.json({
      id: template.id,
      name: template.name,
      examCode: template.examCode,
      description: template.description,
      status: template.status,
      accuracy: template.accuracy ? `${template.accuracy}%` : 'N/A',
      shareLink: template.examCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      predictions: 0,
      createdAt: template.createdAt.toISOString().split('T')[0],
      assignedInstitutions: 0
    })
  } catch (error) {
    console.error('❌ Failed to update template:', error)
    return NextResponse.json(
      {
        error: 'Failed to update template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE request received for template deletion')

    const url = new URL(request.url)
    const templateId = url.searchParams.get('id')

    if (!templateId) {
      const body = await request.json().catch(() => ({}))
      const bodyTemplateId = body.id

      if (!bodyTemplateId) {
        console.error('❌ No template ID provided')
        return NextResponse.json(
          { error: 'Template ID is required' },
          { status: 400 }
        )
      }

      const result = await deleteTemplate(bodyTemplateId)
      return result
    }

    console.log(`🔍 Deleting template with ID: ${templateId}`)
    const result = await deleteTemplate(templateId)
    return result

  } catch (error) {
    console.error('❌ Failed to delete template:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function deleteTemplate(templateId: string) {
  console.log(`🗑️ Deleting template with ID: ${templateId}`)

  const existingTemplates = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    examCode: string;
    description: string | null;
    accuracy: number | null;
    createdAt: Date;
    type: string;
  }>>`
    SELECT id, name, "examCode", description, accuracy, "createdAt", type
    FROM templates 
    WHERE id = ${templateId}
  `

  if (existingTemplates.length === 0) {
    throw new Error('Template not found')
  }

  const existingTemplate = existingTemplates[0]

  const assignments = await prisma.$queryRaw<Array<{
    templateId: string;
    institutionId: string;
  }>>`
    SELECT "templateId", "institutionId"
    FROM "institution_templates"
    WHERE "templateId" = ${templateId}
  `

  if (assignments.length > 0) {
    throw new Error(`Cannot delete template: It is assigned to ${assignments.length} institution(s)`)
  }

  const predictions = await prisma.$queryRaw<Array<{
    templateId: string;
    institutionId: string;
    studentEmail: string;
  }>>`
    SELECT "templateId", "institutionId", "studentEmail"
    FROM predictions
    WHERE "templateId" = ${templateId}
  `

  if (predictions.length > 0) {
    console.log(`⚠️ Template has ${predictions.length} predictions`)
  }

  if (existingTemplate.examCode) {
    try {
      console.log(`🔍 Looking for exams linked to template: ${existingTemplate.id}`)

      const exams = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        examCode: string;
        templateId: string;
      }>>`
        SELECT id, name, "examCode", "templateId"
        FROM exams
        WHERE "templateId" = ${templateId}
      `

      if (exams.length > 0) {
        const exam = exams[0]
        console.log(`🗑️ Found related exam: ${exam.name} (${exam.id})`)

        try {
          await prisma.$queryRaw`
            DELETE FROM "exam_conditions"
            WHERE "examId" = ${exam.id}
          `
          console.log(`🗑️ Deleted exam conditions for exam: ${exam.name}`)
        } catch (conditionError) {
          console.log(`ℹ️ No conditions to delete: ${conditionError instanceof Error ? conditionError.message : 'Unknown error'}`)
        }

        await prisma.$queryRaw`
          DELETE FROM exams
          WHERE id = ${exam.id}
        `
        console.log(`🗑️ Deleted related exam: ${exam.name}`)
      } else {
        console.log(`ℹ️ No exam found linked to template: ${existingTemplate.id}`)
      }
    } catch (examError) {
      console.error('⚠️ Error deleting related exam:', examError)
      throw new Error(`Failed to delete related exam: ${examError instanceof Error ? examError.message : 'Unknown error'}`)
    }
  }

  await prisma.$queryRaw`
    DELETE FROM templates
    WHERE id = ${templateId}
  `


  return NextResponse.json({
    success: true,
    message: 'Template deleted successfully',
    deletedTemplate: {
      id: existingTemplate.id,
      name: existingTemplate.name,
      examCode: existingTemplate.examCode,
      type: getTemplateType(existingTemplate.examCode, existingTemplate.name)
    }
  })
}