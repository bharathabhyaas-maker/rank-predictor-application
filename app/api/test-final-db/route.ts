import { NextResponse } from 'next/server'

// Test the final database solution
export async function GET() {
  try {
    console.log('🧪 Testing final database solution...')
    
    // Test if we can load the environment
    const fs = require('fs')
    const path = require('path')
    const envPath = path.join(process.cwd(), '.env')
    
    let databaseUrl = ''
    let envFileFound = false
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach((line: string) => {
        if (line.startsWith('DATABASE_URL=')) {
          databaseUrl = line.split('=')[1].trim()
          // Remove quotes if present
          databaseUrl = databaseUrl.replace(/^"|"$/g, '')
          envFileFound = true
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database test completed',
      results: {
        envFileFound: envFileFound,
        databaseUrl: databaseUrl ? databaseUrl.substring(0, 20) + '...' : 'NOT FOUND',
        databaseUrlLength: databaseUrl.length,
        databaseUrlFormat: databaseUrl.startsWith('postgresql') ? 'CORRECT' : 'INCORRECT'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
