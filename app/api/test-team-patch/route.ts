import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    console.log('🧪 Test PATCH endpoint called')
    const body = await request.json()
    console.log('🧪 Test PATCH body:', body)
    
    return NextResponse.json({ 
      message: 'PATCH test successful',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('🧪 Test PATCH error:', error)
    return NextResponse.json(
      { error: 'Test PATCH failed' },
      { status: 500 }
    )
  }
}
