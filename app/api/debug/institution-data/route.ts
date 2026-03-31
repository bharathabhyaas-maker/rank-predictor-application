import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Debug: Testing institution data flow...')
    
    const institutionId = 'cmmk5bcww0006lglhjpl3h3gv' // Anwar Instituiton ID
    
    // Test the same flow as the dashboard
    console.log('🔍 Step 1: Fetching institution templates...')
    
    const templatesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/institution-templates?institutionId=${institutionId}`)
    const templates = templatesResponse.ok ? await templatesResponse.json() : []
    
    console.log('📋 Templates from API:', templates.length)
    templates.forEach((t: any, i: number) => {
      console.log(`  ${i + 1}. ${t.name} - status: ${t.status} - predictions: ${t.predictions}`)
    })
    
    console.log('🔍 Step 2: Fetching institution details...')
    
    const institutionResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/institutions/${institutionId}`)
    const institutionData = institutionResponse.ok ? await institutionResponse.json() : null
    
    console.log('📋 Institution data:', institutionData?.name || 'Not found')
    
    console.log('🔍 Step 3: Fetching predictions...')
    
    const predictionsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/predictions?institutionId=${institutionId}`)
    const predictions = predictionsResponse.ok ? await predictionsResponse.json() : []
    
    console.log('📊 Predictions from API:', predictions.length)
    
    // Calculate metrics like the dashboard does
    const totalPreds = templates.reduce((sum: number, t: any) => sum + (t.predictions || 0), 0)
    const activeTemps = templates.length
    const avgAcc = templates.length > 0 
      ? (templates.reduce((sum: number, t: any) => sum + parseFloat(t.accuracy?.replace('%', '') || '0'), 0) / templates.length).toFixed(1) + '%'
      : '0%'
    
    const uniqueStudents = new Set(predictions.map((p: any) => p.studentEmail || p.studentName).filter(Boolean)).size
    
    console.log('📊 Calculated metrics:', {
      totalPredictions: totalPreds,
      activeStudents: uniqueStudents,
      activeTemplates: activeTemps,
      avgAccuracy: avgAcc
    })
    
    return NextResponse.json({
      success: true,
      institutionId,
      apiResults: {
        templates: templates.length,
        institution: !!institutionData,
        predictions: predictions.length
      },
      calculatedMetrics: {
        totalPredictions: totalPreds,
        activeStudents: uniqueStudents,
        activeTemplates: activeTemps,
        avgAccuracy: avgAcc
      },
      details: {
        templates: templates.map(t => ({
          name: t.name,
          status: t.status,
          predictions: t.predictions,
          accuracy: t.accuracy
        })),
        institution: institutionData,
        predictionsCount: predictions.length
      }
    })
    
  } catch (error) {
    console.error('❌ Debug institution data failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack'
    }, { status: 500 })
  }
}
