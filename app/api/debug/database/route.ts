import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    console.log('=== ENVIRONMENT DEBUG ===')
    console.log('process.cwd():', process.cwd())
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 30) || 'undefined')
    
    // Try to load environment file manually
    try {
      const fs = require('fs')
      const path = require('path')
      
      const envLocalPath = path.join(process.cwd(), '.env.local')
      const envPath = path.join(process.cwd(), '.env')
      
      console.log('Checking .env.local:', fs.existsSync(envLocalPath))
      console.log('Checking .env:', fs.existsSync(envPath))
      
      let envContent = ''
      if (fs.existsSync(envLocalPath)) {
        envContent = fs.readFileSync(envLocalPath, 'utf8')
        console.log('✅ Found .env.local, content length:', envContent.length)
        console.log('First 100 chars:', envContent.substring(0, 100))
      } else if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8')
        console.log('✅ Found .env, content length:', envContent.length)
        console.log('First 100 chars:', envContent.substring(0, 100))
      } else {
        console.log('❌ No .env.local or .env file found')
      }
      
      // Check for BOM
      const hasBOM = envContent.charCodeAt(0) === 0xFEFF
      console.log('Has BOM:', hasBOM)
      
      // Remove BOM if present
      if (hasBOM) {
        envContent = envContent.replace(/^\uFEFF/, '')
        console.log('✅ BOM removed')
      }
      
      // Parse DATABASE_URL
      const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*(.+)/i)
      if (dbUrlMatch) {
        const dbUrl = dbUrlMatch[1].trim().replace(/^"|"$/g, '')
        console.log('✅ Found DATABASE_URL in file:', dbUrl.substring(0, 30) + '...')
        process.env.DATABASE_URL = dbUrl
        console.log('✅ Set DATABASE_URL in process.env')
      } else {
        console.log('❌ DATABASE_URL not found in env file')
      }
      
    } catch (envError) {
      console.error('❌ Error reading env file:', envError)
    }
    
    console.log('=== AFTER MANUAL LOAD ===')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0)
    
    // Try to connect to database
    if (process.env.DATABASE_URL) {
      try {
        const prisma = new PrismaClient()
        await prisma.$connect()
        console.log('✅ Database connection successful')
        
        // Test a simple query
        const institutionCount = await prisma.institution.count()
        console.log('✅ Institution count:', institutionCount)
        return NextResponse.json({
          success: true,
          databaseConnected: true,
          institutionCount: institutionCount,
          message: 'Database connection successful'
        })
      } catch (dbError) {
        console.error('❌ Database connection error:', dbError)
        return NextResponse.json({
          success: false,
          databaseConnected: false,
          error: dbError instanceof Error ? dbError.message : 'Unknown database error',
          message: 'Failed to connect to database'
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        databaseConnected: false,
        error: 'DATABASE_URL not available',
        message: 'Environment variables not loaded properly'
      })
    }
    
  } catch (error) {
    console.error('❌ Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
