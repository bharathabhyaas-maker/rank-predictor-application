import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: NextRequest) {
  console.log('🔗 Assigning template to institution...')
  
  try {
    const { templateId, institutionId } = await request.json()
    
    console.log('📋 Assignment data:', { templateId, institutionId })
    
    if (!templateId || !institutionId) {
      console.error('❌ Missing required fields:', { templateId: !!templateId, institutionId: !!institutionId })
      return NextResponse.json(
        { error: 'Missing required fields: templateId and institutionId are required' },
        { status: 400 }
      )
    }
    
    // Check if assignment already exists
    const existingAssignment = await prisma.institutionTemplate.findUnique({
      where: {
        institutionId_templateId: {
          institutionId,
          templateId
        }
      }
    })
    
    if (existingAssignment) {
      console.log('⚠️ Assignment already exists, updating status to ACTIVE')
      
      // Update existing assignment to ACTIVE
      const assignment = await prisma.institutionTemplate.update({
        where: {
          institutionId_templateId: {
            institutionId,
            templateId
          }
        },
        data: {
          status: 'ACTIVE',
          assignedAt: new Date()
        }
      })
      
      console.log('✅ Assignment updated successfully:', assignment.id)
      return NextResponse.json(assignment)
    }
    
    console.log('💾 Creating new assignment...')
    
    // Create new assignment
    const assignment = await prisma.institutionTemplate.create({
      data: {
        templateId,
        institutionId,
        assignedAt: new Date(),
        status: 'ACTIVE'
      }
    })

    console.log('✅ Assignment created successfully:', assignment.id)
    return NextResponse.json(assignment)
  } catch (error) {
    console.error('❌ Failed to assign template to institution:', error)
    
    let errorMessage = 'Failed to assign template to institution'
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'This template is already assigned to this institution'
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid template ID or institution ID'
      } else {
        errorMessage = `Error: ${error.message}`
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  console.log('🗑️ Removing template assignment...')
  
  try {
    const { templateId, institutionId } = await request.json()
    
    console.log('📋 Removal data:', { templateId, institutionId })
    
    if (!templateId || !institutionId) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId and institutionId are required' },
        { status: 400 }
      )
    }
    
    // Delete the assignment
    const assignment = await prisma.institutionTemplate.delete({
      where: {
        institutionId_templateId: {
          institutionId,
          templateId
        }
      }
    })

    console.log('✅ Assignment removed successfully:', assignment.id)
    return NextResponse.json({ message: 'Assignment removed successfully' })
  } catch (error) {
    console.error('❌ Failed to remove template assignment:', error)
    return NextResponse.json(
      { 
        error: 'Failed to remove template assignment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
