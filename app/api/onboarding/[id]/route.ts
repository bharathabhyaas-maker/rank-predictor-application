import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    console.log('Onboarding API: Updating status for', id, 'to', status)
    
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('Database connection: OK')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    const updatedOnboarding = await prisma.institutionOnboarding.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    console.log('Onboarding API: Status updated successfully:', updatedOnboarding.id)

    return NextResponse.json({
      success: true,
      message: 'Onboarding status updated successfully',
      onboarding: updatedOnboarding
    })
  } catch (error) {
    console.error('Error updating onboarding status:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        error: 'Failed to update onboarding status',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
