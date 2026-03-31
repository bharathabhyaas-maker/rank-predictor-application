import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('🔍 Fetching institution details for ID:', id)
    
    const institution = await prisma.institution.findUnique({
      where: {
        id: id
      },
      select: {
        id: true,
        institutionId: true,
        name: true,
        email: true,
        location: true,
        plan: true,
        status: true,
        contactPerson: true,
        phone: true,
        createdAt: true,
        currentStudents: true
      }
    })

    if (!institution) {
      console.log('❌ Institution not found:', id)
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      )
    }

    console.log('✅ Found institution:', institution.name)

    return NextResponse.json({
      id: institution.id,
      institutionId: institution.institutionId,
      name: institution.name,
      email: institution.email,
      location: institution.location || '',
      plan: institution.plan.toLowerCase(),
      status: institution.status.toLowerCase(),
      contactPerson: institution.contactPerson || '',
      phone: institution.phone || '',
      createdAt: institution.createdAt.toISOString().split('T')[0],
      currentStudents: institution.currentStudents
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Failed to fetch institution:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch institution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
