import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing dashboard metrics calculation...')
    
    // Use the same institution ID as the dashboard
    const institutionId = 'cmmk5bcww0006lglhjpl3h3gv' // Anwar Instituiton ID
    
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
            status: true,
            accuracy: true
          }
        }
      }
    })
    
    console.log(`✅ Found ${assignedTemplates.length} assigned templates`)
    
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
    
    // Format templates like the API does
    const formattedTemplates = assignedTemplates.map((at: any) => {
      const predictionCount = predictionCounts.find((pc: any) => pc.templateId === at.template.id)?._count || 0
      const studentCount = studentCounts.find((sc: any) => sc.templateId === at.template.id)?._count.studentEmail || 0
      
      return {
        id: at.template.id,
        name: at.template.name,
        examCode: at.template.examCode,
        status: at.template.status.toLowerCase(),
        accuracy: at.template.accuracy ? `${at.template.accuracy}%` : 'N/A',
        predictions: predictionCount,
        students: studentCount
      }
    })
    
    // Calculate metrics like the dashboard does
    const totalPreds = formattedTemplates.reduce((sum: number, t: any) => sum + (t.predictions || 0), 0)
    const activeTemps = formattedTemplates.filter((t: any) => t.status === 'active' || t.status === 'ACTIVE').length
    const avgAcc = formattedTemplates.length > 0 
      ? (formattedTemplates.reduce((sum: number, t: any) => sum + parseFloat(t.accuracy?.replace('%', '') || '0'), 0) / formattedTemplates.length).toFixed(1) + '%'
      : '0%'
    
    const totalStudents = formattedTemplates.reduce((sum: number, t: any) => sum + (t.students || 0), 0)
    
    console.log('🔍 Debug metrics calculation:', {
      templates: formattedTemplates.length,
      totalPreds,
      activeTemps,
      totalStudents,
      avgAcc
    })
    
    return NextResponse.json({
      success: true,
      institutionId,
      templates: formattedTemplates,
      metrics: {
        totalPredictions: totalPreds,
        activeStudents: totalStudents,
        activeTemplates: activeTemps,
        avgAccuracy: avgAcc
      },
      raw: {
        assignedTemplates: assignedTemplates.length,
        predictionCounts,
        studentCounts
      }
    })
    
  } catch (error) {
    console.error('❌ Debug metrics test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}
