import { NextResponse } from 'next/server'
import { getInstitutions } from '@/lib/api/exams'

export async function GET() {
  try {
    const institutions = await getInstitutions()
    return NextResponse.json(institutions)
  } catch (error) {
    console.error('Failed to fetch institutions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    )
  }
}
