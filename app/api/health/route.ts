import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Server health check - API endpoints are working')
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Next.js server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      apiVersion: '1.0.0'
    })
  } catch (error) {
    console.error('Server health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
