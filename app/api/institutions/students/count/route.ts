import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const totalStudents = await prisma.institution.aggregate({
      _sum: {
        currentStudents: true
      }
    })
    
    return NextResponse.json({ count: totalStudents._sum.currentStudents || 0 })
  } catch (error) {
    console.error('Failed to count students:', error)
    return NextResponse.json(
      { error: 'Failed to count students' },
      { status: 500 }
    )
  }
}
