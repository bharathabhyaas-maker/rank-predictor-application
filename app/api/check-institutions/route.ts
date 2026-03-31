import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  
  try {
    console.log('🔍 Checking existing institutions in database...')
    
    // Get all institutions
    const allInstitutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        institutionId: true,
        status: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Found ${allInstitutions.length} institutions in database`)
    
    // Log each institution
    allInstitutions.forEach((inst: any) => {
      console.log(`📋 Institution: ${inst.name} (${inst.email}) - ID: ${inst.institutionId}`)
    })
    
    return NextResponse.json({
      totalInstitutions: allInstitutions.length,
      institutions: allInstitutions,
      message: 'Database institution check completed'
    })
    
  } catch (error) {
    console.error('❌ Failed to check institutions:', error)
    return NextResponse.json({
      error: 'Failed to check institutions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  
  try {
    const body = await request.json()
    const { email } = body
    
    console.log(`🔍 Checking if email exists: ${email}`)
    
    // Check if institution exists
    const existingInstitution = await prisma.institution.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        email: true,
        institutionId: true,
        status: true,
        createdAt: true
      }
    })
    
    if (existingInstitution) {
      console.log(`❌ Email already exists: ${existingInstitution.name} (${existingInstitution.email})`)
      return NextResponse.json({
        exists: true,
        institution: existingInstitution,
        message: 'Email already exists in database'
      })
    } else {
      console.log(`✅ Email is available: ${email}`)
      return NextResponse.json({
        exists: false,
        message: 'Email is available'
      })
    }
    
  } catch (error) {
    console.error('❌ Failed to check email:', error)
    return NextResponse.json({
      error: 'Failed to check email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
