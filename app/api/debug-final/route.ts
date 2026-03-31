import { NextRequest, NextResponse } from 'next/server'

// Simple test to check final endpoint directly
export async function GET() {
  try {
    console.log('🧪 Testing final institutions endpoint directly...')
    
    // Test if we can import and use the final endpoint
    const fs = require('fs')
    const path = require('path')
    
    // Check if .env exists and has DATABASE_URL
    const envPath = path.join(process.cwd(), '.env')
    let envExists = false
    let databaseUrl = ''
    
    if (fs.existsSync(envPath)) {
      envExists = true
      const envContent = fs.readFileSync(envPath, 'utf8')
      const lines = envContent.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('DATABASE_URL=')) {
          databaseUrl = line.split('=')[1].trim()
          databaseUrl = databaseUrl.replace(/^"|"$/g, '')
          break
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Environment check completed',
      results: {
        envFileExists: envExists,
        databaseUrlFound: databaseUrl.length > 0,
        databaseUrl: databaseUrl ? databaseUrl.substring(0, 30) + '...' : 'NOT FOUND',
        databaseUrlLength: databaseUrl.length,
        isPostgres: databaseUrl.startsWith('postgresql'),
        envPath: envPath
      }
    })
    
  } catch (error) {
    console.error('❌ Environment test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Environment test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing final institutions POST endpoint...')
    
    const body = await request.json()
    console.log('📋 Test data:', body)
    
    // Test the final endpoint by calling it internally
    const response = await fetch('http://localhost:3000/api/institutions-final', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    
    console.log('📊 Final endpoint response:', response.status)
    console.log('📋 Final endpoint data:', data)
    
    return NextResponse.json({
      success: response.ok,
      message: response.ok ? 'POST test successful' : 'POST test failed',
      results: {
        status: response.status,
        statusText: response.statusText,
        data: data
      }
    })
    
  } catch (error) {
    console.error('❌ POST test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'POST test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
