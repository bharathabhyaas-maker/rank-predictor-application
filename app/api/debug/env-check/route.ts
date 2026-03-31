import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Debug API: Checking environment variables')
    
    const databaseUrl = process.env.DATABASE_URL
    const nodeEnv = process.env.NODE_ENV
    
    console.log('Debug API: DATABASE_URL exists:', !!databaseUrl)
    console.log('Debug API: NODE_ENV:', nodeEnv)
    console.log('Debug API: DATABASE_URL length:', databaseUrl?.length || 0)
    
    // Don't log the actual URL for security reasons
    if (databaseUrl) {
      const urlParts = databaseUrl.split('@')
      console.log('Debug API: URL format valid:', urlParts.length > 1)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Environment check complete',
      databaseUrlExists: !!databaseUrl,
      nodeEnv: nodeEnv,
      databaseUrlLength: databaseUrl?.length || 0,
      urlFormatValid: databaseUrl ? databaseUrl.includes('@') : false
    })
    
  } catch (error) {
    console.error('Debug API: Error:', error)
    
    return NextResponse.json(
      { 
        error: 'Environment check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
