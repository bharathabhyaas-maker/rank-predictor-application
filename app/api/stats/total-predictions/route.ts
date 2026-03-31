import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Fetching total predictions from database...')
    
    const totalPredictions = await prisma.prediction.count()

    console.log(`✅ Found ${totalPredictions} total predictions in database`)

    return NextResponse.json({ total: totalPredictions })
  } catch (error) {
    console.error('❌ Failed to fetch total predictions:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch total predictions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
    
