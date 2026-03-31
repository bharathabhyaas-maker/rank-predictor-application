import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('Database connection test started')
    
    // Test 1: Check if we can import Prisma
    console.log('✓ Prisma imported successfully')
    
    // Test 2: Check environment variables
    const dbUrl = process.env.DATABASE_URL
    console.log('DATABASE_URL exists:', !!dbUrl)
    console.log('DATABASE_URL length:', dbUrl?.length || 0)
    console.log('DATABASE_URL starts with postgresql:', dbUrl?.startsWith('postgresql'))
    
    // Test 3: Try to connect to database with a simple query
    console.log('Testing database connection...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✓ Database connection successful:', result)
    
    // Test 4: Check if institutions table exists
    console.log('Checking institutions table...')
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'institutions'
        )
      `
      console.log('✓ Institutions table exists:', (tableCheck as any[])[0]?.exists)
    } catch (error) {
      console.log('✗ Error checking institutions table:', error)
    }
    
    // Test 5: Try to count institutions
    console.log('Counting institutions...')
    try {
      const count = await prisma.institution.count()
      console.log('✓ Institutions count:', count)
    } catch (error) {
      console.log('✗ Error counting institutions:', error)
    }return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      databaseUrl: dbUrl ? 'configured' : 'missing',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
