import { NextResponse } from 'next/server'

export async function GET() {
  let envContent = ''
  try {
    const fs = require('fs')
    const path = require('path')
    const envPath = path.join(process.cwd(), '.env')
    envContent = fs.readFileSync(envPath, 'utf8')
  } catch (error) {
    console.log('Could not read .env file:', error)
  }

  return NextResponse.json({
    message: 'Environment file check',
    currentWorkingDirectory: process.cwd(),
    envFileExists: envContent.length > 0,
    envFileContent: envContent.replace(/password=([^&\s]+)/, 'password=***HIDDEN***'),
    processEnvDatabaseUrl: process.env.DATABASE_URL ? 'EXISTS' : 'MISSING',
    processEnvDatabaseUrlLength: process.env.DATABASE_URL?.length || 0,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NODE_ENV')),
    timestamp: new Date().toISOString()
  })
}
