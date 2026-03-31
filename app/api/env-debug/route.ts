import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== ENVIRONMENT DEBUG ===')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
  console.log('DATABASE_URL starts with postgresql:', process.env.DATABASE_URL?.startsWith('postgresql'))
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
  console.log('====================')

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    databaseUrlExists: !!process.env.DATABASE_URL,
    databaseUrlLength: process.env.DATABASE_URL?.length || 0,
    databaseUrlStartsWithPostgresql: process.env.DATABASE_URL?.startsWith('postgresql'),
    databaseEnvVars: Object.keys(process.env).filter(key => key.includes('DATABASE')),
    timestamp: new Date().toISOString()
  })
}
