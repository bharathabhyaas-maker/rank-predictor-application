import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const activeInstitutions = await prisma.institution.count({
      where: {
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json({ count: activeInstitutions })
  } catch (error) {
    console.error('Failed to count active institutions:', error)
    return NextResponse.json(
      { error: 'Failed to count active institutions' },
      { status: 500 }
    )
  }
}
