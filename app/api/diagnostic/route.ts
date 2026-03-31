import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 COMPREHENSIVE DATABASE DIAGNOSTIC')
    
    // Step 1: Check environment files
    const fs = require('fs')
    const path = require('path')
    
    const envLocalPath = path.join(process.cwd(), '.env.local')
    const envPath = path.join(process.cwd(), '.env')
    
    console.log('=== ENVIRONMENT FILE CHECK ===')
    console.log('Current working directory:', process.cwd())
    console.log('.env.local exists:', fs.existsSync(envLocalPath))
    console.log('.env exists:', fs.existsSync(envPath))
    
    let envContent = ''
    let fileName = ''
    
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, 'utf8')
      fileName = '.env.local'
    } else if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
      fileName = '.env'
    } else {
      return NextResponse.json({
        success: false,
        error: 'No .env or .env.local file found',
        checkedPaths: [envLocalPath, envPath],
        cwd: process.cwd()
      })
    }
    
    console.log(`Reading from: ${fileName}`)
    console.log(`File size: ${envContent.length} characters`)
    
    // Step 2: Check for BOM
    const hasBOM = envContent.charCodeAt(0) === 0xFEFF
    console.log('Has BOM:', hasBOM)
    
    if (hasBOM) {
      envContent = envContent.replace(/^\uFEFF/, '')
      console.log('BOM removed')
    }
    
    // Step 3: Parse and check DATABASE_URL
    console.log('=== DATABASE_URL PARSING ===')
    let databaseUrl = null
    
    envContent.split('\n').forEach((line, index) => {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('DATABASE_URL')) {
        console.log(`Line ${index + 1}: ${trimmedLine}`)
        
        const equalIndex = trimmedLine.indexOf('=')
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim()
          let value = trimmedLine.substring(equalIndex + 1).trim()
          
          console.log(`Key: "${key}"`)
          console.log(`Raw value: "${value}"`)
          
          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
            console.log('Quotes removed')
          }
          
          databaseUrl = value
          console.log(`Final DATABASE_URL: "${databaseUrl.substring(0, 50)}..."`)
          console.log(`DATABASE_URL length: ${databaseUrl.length}`)
        }
      }
    })
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found in environment file',
        fileName,
        fileContent: envContent.substring(0, 200) + '...',
        lines: envContent.split('\n').map((l, i) => ({ line: i + 1, content: l }))
      })
    }
    
    // Step 4: Test database connection
    console.log('=== DATABASE CONNECTION TEST ===')
    
    try {
      // Set the environment variable
      process.env.DATABASE_URL = databaseUrl
      
      // Import and test Prisma
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
      })
      
      console.log('Prisma client created')
      
      await prisma.$connect()
      console.log('✅ Database connection successful')
      
      // Test a simple query
      const institutionCount = await prisma.institution.count()
      console.log(`✅ Institution count: ${institutionCount}`)
      
      const templateCount = await prisma.template.count()
      console.log(`✅ Template count: ${templateCount}`)
      console.log('✅ Database disconnected')
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        diagnostic: {
          fileName,
          fileSize: envContent.length,
          hasBOM,
          databaseUrlFound: true,
          databaseUrlLength: databaseUrl.length,
          databaseUrlPrefix: databaseUrl.substring(0, 30),
          institutionCount,
          templateCount
        }
      })
      
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError)
      
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        diagnostic: {
          fileName,
          databaseUrlFound: true,
          databaseUrlLength: databaseUrl.length,
          databaseUrlPrefix: databaseUrl.substring(0, 30),
          dbError: dbError instanceof Error ? dbError.message : 'Unknown error',
          dbStack: dbError instanceof Error ? dbError.stack : undefined
        }
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error)
    return NextResponse.json({
      success: false,
      error: 'Diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
