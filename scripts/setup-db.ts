#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Load environment variables manually
function loadEnvironmentVariables() {
  const envLocalPath = path.join(process.cwd(), '.env.local')
  const envPath = path.join(process.cwd(), '.env')
  
  // Try .env.local first, then .env
  let envContent = ''
  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8')
    console.log('✅ Loading from .env.local')
  } else if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
    console.log('✅ Loading from .env')
  } else {
    console.log('❌ No .env.local or .env file found')
    process.exit(1)
  }
  
  // Parse .env file and set environment variables
  // Remove BOM from the entire content
  envContent = envContent.replace(/^\uFEFF/, '')
  
  envContent.split('\n').forEach((line: string) => {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...values] = trimmedLine.split('=')
      if (key && values.length > 0) {
        let value = values.join('=').trim()
        value = value.replace(/^"|"$/g, '') // Remove quotes
        // Remove BOM from key if present
        const cleanKey = key.replace(/^\uFEFF/, '').trim()
        process.env[cleanKey] = value
        console.log(`🔧 Set ${cleanKey} = ${value ? '✅' : '❌'}`)
      }
    }
  })
  
  console.log('📡 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Found' : '❌ Not found')
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in environment files')
    process.exit(1)
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database...')
    
    // Load environment variables
    loadEnvironmentVariables()
    
    // Create Prisma client
    const prisma = new PrismaClient()
    
    // Test database connection
    console.log('🔗 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Push schema to database
    console.log('📋 Creating database schema...')
    // Note: We'll use a raw SQL approach since prisma db push isn't working
    console.log('⚠️  Please run "npx prisma db push" manually after this script completes')
    
    // Disconnect
    await prisma.$disconnect()
    
    console.log('🎉 Database setup completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Run: npx prisma db push')
    console.log('2. Run: npx prisma generate')
    console.log('3. Run: npm run db:init')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()
