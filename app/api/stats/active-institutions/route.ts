import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Fetching active institutions from database...')
    
    const activeInstitutions = await prisma.institution.count({
      where: {
        status: 'ACTIVE'
      }
    })

    console.log(`✅ Found ${activeInstitutions} active institutions in database`)

    return NextResponse.json({ total: activeInstitutions })
  } catch (error) {
    console.error('❌ Failed to fetch active institutions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch active institutions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
