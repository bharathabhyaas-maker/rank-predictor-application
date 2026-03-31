import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== SIMPLE ENV CHECK ===')
    
    // Try to read the env file directly
    const fs = require('fs')
    const path = require('path')
    
    const envLocalPath = path.join(process.cwd(), '.env.local')
    const envPath = path.join(process.cwd(), '.env')
    
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
        error: 'No environment file found',
        filesChecked: [envLocalPath, envPath]
      })
    }
    
    console.log(`Reading from: ${fileName}`)
    console.log(`File size: ${envContent.length} characters`)
    console.log(`First 200 chars: ${envContent.substring(0, 200)}`)
    
    // Check for BOM
    const hasBOM = envContent.charCodeAt(0) === 0xFEFF
    console.log(`Has BOM: ${hasBOM}`)
    
    if (hasBOM) {
      envContent = envContent.replace(/^\uFEFF/, '')
      console.log('BOM removed')
    }
    
    // Look for DATABASE_URL
    const lines = envContent.split('\n')
    let databaseUrlLine = null
    
    for (const line of lines) {
      if (line.trim().startsWith('DATABASE_URL')) {
        databaseUrlLine = line
        break
      }
    }
    
    if (databaseUrlLine) {
      console.log(`Found DATABASE_URL line: ${databaseUrlLine}`)
      
      const equalIndex = databaseUrlLine.indexOf('=')
      if (equalIndex > 0) {
        const key = databaseUrlLine.substring(0, equalIndex).trim()
        const value = databaseUrlLine.substring(equalIndex + 1).trim()
        
        console.log(`Key: "${key}"`)
        console.log(`Raw value: "${value}"`)
        
        // Remove quotes
        const cleanValue = value.replace(/^"|"$/g, '').replace(/^'|'$/g, '')
        console.log(`Clean value: "${cleanValue.substring(0, 50)}..."`)
        console.log(`Clean value length: ${cleanValue.length}`)
        
        return NextResponse.json({
          success: true,
          fileName,
          fileSize: envContent.length,
          hasBOM,
          databaseUrlLine,
          cleanValue,
          cleanValueLength: cleanValue.length,
          startsWith: cleanValue.substring(0, 20)
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found in environment file',
        lines: lines.map(l => l.trim()).filter(l => l.length > 0)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
