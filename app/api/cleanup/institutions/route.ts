import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('Cleanup API: Checking existing institutions')
    
    // Get all institutions
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        institutionId: true,
        name: true,
        email: true,
        createdAt: true
      }
    })

    console.log('Cleanup API: Found', institutions.length, 'institutions')

    return NextResponse.json({
      success: true,
      count: institutions.length,
      institutions: institutions
    })

  } catch (error) {
    console.error('Cleanup API: Error fetching institutions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    console.log('Cleanup API: Deleting all institutions')
    
    // Delete all institutions
    const result = await prisma.institution.deleteMany({})

    console.log('Cleanup API: Deleted', result.count, 'institutions')

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} institutions`,
      deletedCount: result.count
    })

  } catch (error) {
    console.error('Cleanup API: Error deleting institutions:', error)
    return NextResponse.json(
      { error: 'Failed to delete institutions' },
      { status: 500 }
    )
  }
}
