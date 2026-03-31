import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { Institution } from '@prisma/client'

export async function GET() {
  try {
    console.log('🔍 Fetching institutions from database...')
    
    const institutions = await prisma.institution.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ Found ${institutions.length} institutions`)

    // Get template assignments and predictions manually
    const institutionIds = institutions.map((inst: Institution) => inst.id)
    
    const templateAssignments = await prisma.$queryRaw`
      SELECT 
        "institutionId", 
        "templateId", 
        "assignedAt", 
        it.status as assignment_status,
        t.name as template_name,
        t."examCode" as template_examCode
      FROM "institution_templates" it
      LEFT JOIN templates t ON it."templateId" = t.id
      WHERE it."institutionId" = ANY(${institutionIds})
    `
    
    const predictions = await prisma.$queryRaw`
      SELECT "institutionId", "templateId", "studentEmail", "createdAt"
      FROM predictions
      WHERE "institutionId" = ANY(${institutionIds})
    `

    // Transform data to match the expected format
    const transformedInstitutions = institutions.map((inst: Institution) => {
      // Get template assignments for this institution
      const assignments = (templateAssignments as any[]).filter(
        (assignment: any) => assignment.institutionId === inst.id
      )
      
      // Get predictions for this institution
      const institutionPredictions = (predictions as any[]).filter(
        (prediction: any) => prediction.institutionId === inst.id
      )
      
      // Get assigned template IDs
      const assignedTemplateIds = assignments.map((assignment: any) => assignment.templateId)
      
      // Only count predictions for assigned templates
      const validPredictions = institutionPredictions.filter((prediction: any) => 
        assignedTemplateIds.includes(prediction.templateId)
      )
      
      // Count unique students from valid predictions
      const uniqueStudents = new Set(validPredictions.map((p: any) => p.studentEmail)).size
      
      return {
        id: inst.id,
        institutionId: inst.institutionId,
        name: inst.name,
        email: inst.email,
        location: inst.location,
        students: uniqueStudents,
        templatesAssigned: assignments.length,
        predictions: validPredictions.length,
        status: inst.status,
        joinedDate: inst.createdAt.toISOString().split('T')[0],
        plan: inst.plan,
        contactPerson: inst.contactPerson,
        phone: inst.phone,
        assignedTo: assignments.map((assignment: any) => ({
          id: assignment.id || `${assignment.institutionId}-${assignment.templateId}`,
          templateId: assignment.templateId,
          templateName: assignment.template_name,
          assignedAt: assignment.assignedAt,
          status: assignment.assignment_status
        }))
      }
    })

    return NextResponse.json(transformedInstitutions, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Failed to fetch institutions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch institutions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('📝 Creating institution in database...')
  
  try {
    const body = await request.json()
    console.log('📋 Creating institution with data:', body)
    
    console.log('Creating institution with data:', body)
    
    // Validate required fields
    if (!body.name || !body.email || !body.location) {
      console.error('Missing required fields:', { name: !!body.name, email: !!body.email, location: !!body.location })
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and location are required' },
        { status: 400 }
      )
    }
    
    // Generate credentials once and reuse
    const institutionId = body.institutionId || generateInstitutionId(body.email)
    const password = body.password || generatePassword()
    
    console.log('Generated credentials:', { institutionId, password: '***' })
    
    // Check if institution with this email already exists
    const existingInstitution = await prisma.institution.findUnique({
      where: { email: body.email }
    })
    
    if (existingInstitution) {
      console.error('Institution with this email already exists:', body.email)
      return NextResponse.json(
        { error: 'An institution with this email already exists' },
        { status: 409 }
      )
    }
    
    console.log('Creating institution in database...')
    
    const institution = await prisma.institution.create({
      data: {
        name: body.name,
        email: body.email,
        location: body.location,
        plan: (body.plan || 'standard').toUpperCase(),
        contactPerson: body.contactPerson,
        phone: body.phone,
        institutionId: institutionId,
        password: password,
      }
    })

    console.log('Institution created successfully:', institution.id)

    // Create a user account for the institution with the same password
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.contactPerson || body.name,
        password: password,
        role: 'INSTITUTION',
        institutionId: institution.id
      }
    })

    console.log('User created successfully:', user.id)

    return NextResponse.json({
      id: institution.id,
      institutionId: institution.institutionId,
      name: institution.name,
      email: institution.email,
      location: institution.location || '',
      students: 0,
      templatesAssigned: 0,
      predictions: 0,
      status: institution.status.toLowerCase(),
      joinedDate: institution.createdAt.toISOString().split('T')[0],
      plan: institution.plan,
      // Return the generated credentials for the admin to send to institution
      credentials: {
        email: institution.email,
        institutionId: institution.institutionId,
        password: password
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create institution:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to create institution'
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'An institution with this email already exists'
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid user reference'
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
    
    const institution = await prisma.institution.update({
      where: {
        id: body.id
      },
      data: {
        status: body.status.toUpperCase() as any
      }
    })

    return NextResponse.json({
      id: institution.id,
      institutionId: institution.institutionId,
      name: institution.name,
      email: institution.email,
      location: institution.location || '',
      students: institution.currentStudents,
      templatesAssigned: 0, // Would need to join with assignedTemplates
      predictions: 0, // Would need to join with predictions
      status: institution.status.toLowerCase(),
      joinedDate: institution.createdAt.toISOString().split('T')[0],
      plan: institution.plan
    })
  } catch (error) {
    console.error('Failed to update institution:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update institution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateInstitutionId(email: string): string {
  const emailPrefix = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${emailPrefix}${randomSuffix}`
}

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
