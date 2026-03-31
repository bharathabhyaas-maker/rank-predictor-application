import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 20) || 'undefined')
    
    return NextResponse.json({
      databaseUrlExists: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length || 0,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) || 'undefined',
      envKeys: Object.keys(process.env).filter(key => key.includes('DATABASE')),
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
