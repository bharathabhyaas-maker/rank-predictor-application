#!/usr/bin/env node

import fs from 'fs'
import path from 'path'

// Debug: Read and display .env.local content
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

console.log('🔍 Debug: Checking environment files...')

if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local found')
  const content = fs.readFileSync(envLocalPath, 'utf8')
  console.log('📄 .env.local content:')
  console.log(content)
  console.log('---')
} else {
  console.log('❌ .env.local not found')
}

if (fs.existsSync(envPath)) {
  console.log('✅ .env found')
  const content = fs.readFileSync(envPath, 'utf8')
  console.log('📄 .env content:')
  console.log(content)
  console.log('---')
} else {
  console.log('❌ .env not found')
}

// Try to parse DATABASE_URL
console.log('🔍 Parsing for DATABASE_URL...')
const files = [envLocalPath, envPath]

for (const filePath of files) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    
    for (const line of lines) {
      if (line.includes('DATABASE_URL')) {
        console.log(`🎯 Found in ${path.basename(filePath)}: ${line}`)
      }
    }
  }
}
