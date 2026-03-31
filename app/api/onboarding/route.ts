import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('Onboarding API: Fetching all institution onboarding records')
    
    const onboardings = await prisma.institutionOnboarding.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('Onboarding API: Retrieved', onboardings.length, 'onboarding records')

    return NextResponse.json(onboardings)
  } catch (error) {
    console.error('Error fetching onboarding records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding records' },
      { status: 500 }
    )
  }
}
