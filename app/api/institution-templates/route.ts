import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest) {
  
  try {
    console.log('🔍 Fetching institution templates from database...')
    
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    
    console.log('🔍 Institution Templates API - Received institutionId:', institutionId)
    
    if (!institutionId) {
      console.log('❌ No institutionId provided')
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      )
    }
    
    // First, check if the institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    })
    
    console.log('🔍 Institution Templates API - Found institution:', institution?.name || 'Not found')
    
    if (!institution) {
      console.log('❌ Institution not found:', institutionId)
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      )
    }
    
    // Fetch templates assigned to this institution
    const assignedTemplates = await prisma.institutionTemplate.findMany({
      where: {
        institutionId: institutionId,
        status: 'ACTIVE'
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            examCode: true,
            description: true,
            status: true,
            accuracy: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })

    console.log(`🔍 Institution Templates API - Found ${assignedTemplates.length} assigned templates`)
    console.log('🔍 Institution Templates API - Template assignments:', assignedTemplates.map((at: any) => ({
      institutionId: at.institutionId,
      templateId: at.templateId,
      templateName: at.template.name,
      status: at.status
    })))

    // Get prediction counts for each template
    const templateIds = assignedTemplates.map((at: any) => at.template.id)
    const predictionCounts = templateIds.length > 0 ? await prisma.prediction.groupBy({
      by: ['templateId'],
      where: { templateId: { in: templateIds } },
      _count: true
    }) : []

    // Get unique student count for each template
    const studentCounts = templateIds.length > 0 ? await prisma.prediction.groupBy({
      by: ['templateId'],
      where: { templateId: { in: templateIds } },
      _count: {
        studentEmail: true
      }
    }) : []

    // Format the response
    const formattedTemplates = assignedTemplates.map((at: any) => {
      const predictionCount = predictionCounts.find((pc: any) => pc.templateId === at.template.id)?._count || 0
      const studentCount = studentCounts.find((sc: any) => sc.templateId === at.template.id)?._count.studentEmail || 0
      
      return {
        id: at.template.id,
        name: at.template.name,
        examCode: at.template.examCode,
        description: at.template.description,
        type: 'ai', // Default type since predictionType doesn't exist
        status: at.template.status.toLowerCase(),
        shareLink: at.template.examCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        accuracy: at.template.accuracy ? `${at.template.accuracy}%` : 'N/A',
        predictions: predictionCount,
        students: studentCount,
        assignedAt: at.assignedAt.toISOString().split('T')[0]
      }
    })

    console.log('🔍 Institution Templates API - Formatted templates:', formattedTemplates)

    return NextResponse.json(formattedTemplates, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Failed to fetch institution templates:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch institution templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST method to assign template to institution
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Assigning template to institution...')
    
    const body = await request.json()
    const { institutionId, templateId } = body
    
    if (!institutionId || !templateId) {
      return NextResponse.json(
        { error: 'Institution ID and Template ID are required' },
        { status: 400 }
      )
    }
    
    // Check if institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId }
    })
    
    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      )
    }
    
    // Check if template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    })
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    // Check if assignment already exists
    const existingAssignment = await prisma.institutionTemplate.findFirst({
      where: {
        institutionId: institutionId,
        templateId: templateId
      }
    })
    
    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Template is already assigned to this institution' },
        { status: 409 }
      )
    }
    
    // Create new assignment
    const assignment = await prisma.institutionTemplate.create({
      data: {
        institutionId: institutionId,
        templateId: templateId,
        status: 'ACTIVE'
      }
    })
    
    console.log(`✅ Template assigned successfully: ${template.name} to ${institution.name}`)
    
    return NextResponse.json({
      success: true,
      message: 'Template assigned successfully',
      assignment: {
        id: assignment.id,
        institutionId: assignment.institutionId,
        templateId: assignment.templateId,
        institutionName: institution.name,
        templateName: template.name,
        assignedAt: assignment.assignedAt.toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to assign template:', error)
    return NextResponse.json(
      { 
        error: 'Failed to assign template',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE method to remove template assignment from institution
export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Removing template assignment from institution...')
    
    // Get parameters from URL or request body
    const url = new URL(request.url)
    const institutionId = url.searchParams.get('institutionId')
    const templateId = url.searchParams.get('templateId')
    
    if (!institutionId || !templateId) {
      // Try to get from request body
      const body = await request.json().catch(() => ({}))
      const bodyInstitutionId = body.institutionId
      const bodyTemplateId = body.templateId
      
      if (!bodyInstitutionId || !bodyTemplateId) {
        return NextResponse.json(
          { error: 'Institution ID and Template ID are required' },
          { status: 400 }
        )
      }
      
      return await removeAssignment(bodyInstitutionId, bodyTemplateId)
    }
    
    return await removeAssignment(institutionId, templateId)
    
  } catch (error) {
    console.error('❌ Failed to remove template assignment:', error)
    return NextResponse.json(
      { 
        error: 'Failed to remove template assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function removeAssignment(institutionId: string, templateId: string) {
  console.log(`🗑️ Removing assignment: Institution ${institutionId} ← Template ${templateId}`)
  
  // Check if institution exists
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId }
  })
  
  if (!institution) {
    return NextResponse.json(
      { error: 'Institution not found' },
      { status: 404 }
    )
  }
  
  // Check if template exists
  const template = await prisma.template.findUnique({
    where: { id: templateId }
  })
  
  if (!template) {
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    )
  }
  
  // Find the assignment
  const existingAssignment = await prisma.institutionTemplate.findFirst({
    where: {
      institutionId: institutionId,
      templateId: templateId
    }
  })
  
  if (!existingAssignment) {
    return NextResponse.json(
      { error: 'Template is not assigned to this institution' },
      { status: 404 }
    )
  }
  
  // Delete the assignment
  const deletedAssignment = await prisma.institutionTemplate.delete({
    where: {
      id: existingAssignment.id
    }
  })
  
  console.log(`✅ Assignment removed successfully: ${template.name} from ${institution.name}`)
  
  return NextResponse.json({
    success: true,
    message: 'Template unassigned successfully',
    removedAssignment: {
      id: deletedAssignment.id,
      institutionId: deletedAssignment.institutionId,
      templateId: deletedAssignment.templateId,
      institutionName: institution.name,
      templateName: template.name,
      removedAt: new Date().toISOString()
    }
  })
}
