import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Load environment variables
const loadEnv = () => {
  try {
    const fs = require('fs')
    const path = require('path')
    
    // Try .env.local first (highest priority)
    const envLocalPath = path.join(process.cwd(), '.env.local')
    const envPath = path.join(process.cwd(), '.env')
    
    let envLoaded = false
    let loadedFile = ''
    
    if (fs.existsSync(envLocalPath)) {
      const envContent = fs.readFileSync(envLocalPath, 'utf8')
      envContent.split('\n').forEach((line: string) => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...values] = trimmedLine.split('=')
          if (key && values.length > 0) {
            process.env[key.trim()] = values.join('=').trim()
          }
        }
      })
      envLoaded = true
      loadedFile = '.env.local'
      console.log('✅ Environment variables loaded from .env.local')
    } else if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach((line: string) => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...values] = trimmedLine.split('=')
          if (key && values.length > 0) {
            process.env[key.trim()] = values.join('=').trim()
          }
        }
      })
      envLoaded = true
      loadedFile = '.env'
      console.log('✅ Environment variables loaded from .env')
    } else {
      console.error('❌ No .env or .env.local file found')
    }
    
    if (envLoaded) {
      console.log(`✅ Environment variables loaded successfully from ${loadedFile}`)
    }
  } catch (error) {
    console.error('❌ Failed to load environment variables:', error)
  }
}

loadEnv()
const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('🔍 Testing database connection and tables...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test if tables exist by trying to count records
    try {
      const institutionCount = await prisma.institution.count()
      console.log(`✅ Institutions table exists, count: ${institutionCount}`)
    } catch (error) {
      console.error('❌ Institutions table issue:', error)
      return NextResponse.json({
        error: 'Institutions table issue',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Run database migrations: npx prisma migrate dev'
      }, { status: 500 })
    }
    
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Users table exists, count: ${userCount}`)
    } catch (error) {
      console.error('❌ Users table issue:', error)
      return NextResponse.json({
        error: 'Users table issue',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Run database migrations: npx prisma migrate dev'
      }, { status: 500 })
    }
    
    try {
      const templateCount = await prisma.template.count()
      console.log(`✅ Templates table exists, count: ${templateCount}`)
    } catch (error) {
      console.error('❌ Templates table issue:', error)
      return NextResponse.json({
        error: 'Templates table issue',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Run database migrations: npx prisma migrate dev'
      }, { status: 500 })
    }return NextResponse.json({
      success: true,
      message: 'Database connection and tables are working properly',
      tables: {
        institutions: '✅ OK',
        users: '✅ OK',
        templates: '✅ OK'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: [
        'Check if PostgreSQL is running',
        'Verify DATABASE_URL in .env file',
        'Run: npx prisma migrate dev',
        'Run: npx prisma generate'
      ]
    }, { status: 500 })
  }
}
