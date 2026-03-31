import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Debug: Fetching templates from database...')
    
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        examCode: true,
        type: true,
        status: true,
        placeholders: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log('📋 Found templates:', templates)
    
    // Find JEE-specific templates
    const jeeTemplates = templates.filter(t => 
      t.examCode.toLowerCase().includes('jee') || 
      t.name.toLowerCase().includes('jee')
    )
    
    console.log('🎯 JEE Templates found:', jeeTemplates)
    
    return NextResponse.json({
      success: true,
      totalTemplates: templates.length,
      jeeTemplates: jeeTemplates.map(t => ({
        id: t.id,
        name: t.name,
        examCode: t.examCode,
        type: t.type,
        status: t.status,
        hasConditions: !!(t.placeholders as any)?.conditions,
        conditionsCount: (t.placeholders as any)?.conditions?.length || 0,
        placeholders: t.placeholders,
        shareLink: t.examCode.toLowerCase().replace(/[^a-z0-9]/g, '-')
      })),
      allTemplates: templates.map(t => ({
        id: t.id,
        name: t.name,
        examCode: t.examCode,
        type: t.type,
        status: t.status,
        hasConditions: !!(t.placeholders as any)?.conditions,
        conditionsCount: (t.placeholders as any)?.conditions?.length || 0,
        shareLink: t.examCode.toLowerCase().replace(/[^a-z0-9]/g, '-')
      }))
    })
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
