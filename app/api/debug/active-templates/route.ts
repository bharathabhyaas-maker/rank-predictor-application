import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Debug: Checking active templates...')
    
    // Use the same institution ID as the dashboard
    const institutionId = 'cmmk5bcww0006lglhjpl3h3gv' // Anwar Instituiton ID
    
    console.log('🔍 Checking institution:', institutionId)
    
    // Check if institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, name: true }
    })
    
    console.log('✅ Institution found:', institution?.name || 'Not found')
    
    // Check all templates in the database
    const allTemplates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        examCode: true,
        status: true,
        accuracy: true
      }
    })
    
    console.log('📋 All templates in database:', allTemplates.map(t => ({
      id: t.id,
      name: t.name,
      status: t.status
    })))
    
    // Check institution template assignments
    const assignments = await prisma.institutionTemplate.findMany({
      where: { institutionId },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            examCode: true,
            status: true,
            accuracy: true
          }
        }
      }
    })
    
    console.log('📋 Institution template assignments:', assignments.map(a => ({
      templateId: a.templateId,
      templateName: a.template.name,
      templateStatus: a.template.status,
      assignmentStatus: a.status
    })))
    
    // Filter active assignments
    const activeAssignments = assignments.filter(a => 
      a.status === 'ACTIVE' && 
      (a.template.status === 'active' || a.template.status === 'ACTIVE')
    )
    
    console.log('✅ Active assignments:', activeAssignments.length)
    
    // Check predictions for each template
    const templateIds = assignments.map(a => a.templateId)
    const predictions = await prisma.prediction.findMany({
      where: { templateId: { in: templateIds } },
      select: {
        templateId: true,
        studentEmail: true,
        createdAt: true
      }
    })
    
    console.log('📊 Predictions found:', predictions.length)
    
    return NextResponse.json({
      success: true,
      institution,
      allTemplates: allTemplates.length,
      assignments: assignments.length,
      activeAssignments: activeAssignments.length,
      predictions: predictions.length,
      details: {
        institution: {
          id: institution?.id,
          name: institution?.name
        },
        templates: allTemplates.map(t => ({
          id: t.id,
          name: t.name,
          status: t.status
        })),
        assignments: assignments.map(a => ({
          templateId: a.templateId,
          templateName: a.template.name,
          templateStatus: a.template.status,
          assignmentStatus: a.status
        })),
        activeAssignments: activeAssignments.map(a => ({
          templateId: a.templateId,
          templateName: a.template.name,
          templateStatus: a.template.status,
          assignmentStatus: a.status
        })),
        predictions: predictions.length
      }
    })
    
  } catch (error) {
    console.error('❌ Debug active templates failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}
