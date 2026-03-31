import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Test API endpoint called')
    return NextResponse.json({ 
      message: 'API is working',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Test API failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('Test POST API endpoint called')
    const body = await request.json()
    console.log('Test POST body:', body)
    return NextResponse.json({ 
      message: 'POST API is working',
      received: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test POST API error:', error)
    return NextResponse.json(
      { error: 'Test POST API failed' },
      { status: 500 }
    )
  }
}
