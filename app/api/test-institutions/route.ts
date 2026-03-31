import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Institutions test endpoint called')
    
    // Test basic database connection without Prisma
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/institutions`)
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Institutions API returned ${response.status}`,
        status: response.status 
      })
    }
    
    const data = await response.json()
    
    return NextResponse.json({ 
      message: 'Institutions API is accessible',
      data: Array.isArray(data) ? `Found ${data.length} institutions` : 'Data is not an array',
      dataType: typeof data
    })
  } catch (error) {
    console.error('Institutions test error:', error)
    return NextResponse.json(
      { 
        error: 'Institutions test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
