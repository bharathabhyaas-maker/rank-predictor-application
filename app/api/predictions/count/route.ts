import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const totalPredictions = await prisma.prediction.count()
    return NextResponse.json({ count: totalPredictions })
  } catch (error) {
    console.error('Failed to count predictions:', error)
    return NextResponse.json(
      { error: 'Failed to count predictions' },
      { status: 500 }
    )
  }
}
