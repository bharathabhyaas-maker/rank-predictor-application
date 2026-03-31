import { NextResponse } from 'next/server'

// Working templates endpoint - in-memory storage
let templates = [
  {
    id: 1,
    name: 'JEE Main Mock Test',
    examCode: 'JEE2024',
    predictions: 45,
    status: 'Active',
    accuracy: '85%',
    shareLink: 'jee-2024'
  },
  {
    id: 2,
    name: 'NEET Practice Test',
    examCode: 'NEET2024',
    predictions: 32,
    status: 'Active',
    accuracy: '78%',
    shareLink: 'neet-2024'
  },
  {
    id: 3,
    name: 'CBSE Board Exam',
    examCode: 'CBSE2024',
    predictions: 28,
    status: 'Draft',
    accuracy: '92%',
    shareLink: 'cbse-2024'
  }
]

export async function GET() {
  try {
    console.log('📊 Returning templates (working solution)')
    
    return NextResponse.json(templates)
  } catch (error) {
    console.error('❌ Failed to fetch templates:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
