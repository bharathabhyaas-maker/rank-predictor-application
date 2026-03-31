import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Fetching institutions with assigned templates...')
    
    // Count institutions that have at least one assigned template
    const institutionsWithTemplates = await prisma.institution.count({
      where: {
        assignedTemplates: {
          some: {}
        }
      }
    })

    console.log(`✅ Found ${institutionsWithTemplates} institutions with assigned templates`)

    return NextResponse.json({ total: institutionsWithTemplates }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Failed to fetch institutions with templates:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch institutions with templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
