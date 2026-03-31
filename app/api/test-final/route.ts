import { NextResponse } from 'next/server'

// Simple test to check if final solution works
export async function GET() {
  try {
    console.log('🧪 Testing final database solution...')
    
    // Test the final institutions endpoint
    const response = await fetch('http://localhost:3000/api/institutions-final')
    const data = await response.json()
    
    console.log('📊 Final endpoint response:', response.status)
    console.log('📋 Final endpoint data:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Final database test completed',
      endpointTest: {
        status: response.status,
        statusText: response.statusText,
        dataLength: Array.isArray(data) ? data.length : 'not array',
        hasData: Array.isArray(data) && data.length > 0
      }
    })
    
  } catch (error) {
    console.error('❌ Final database test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Final database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
