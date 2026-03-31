import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  
  try {
    console.log('🔍 Fetching team members from database...')
    
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institutionId')
    
    let teamMembers;
    
    if (institutionId) {
      // Fetch team members for a specific institution
      teamMembers = await prisma.teamMember.findMany({
        where: {
          institutionId: institutionId
        },
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              institutionId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Fetch all team members
      teamMembers = await prisma.teamMember.findMany({
        include: {
          institution: {
            select: {
              id: true,
              name: true,
              institutionId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    console.log(`✅ Found ${teamMembers.length} team members`)

    const teamMemberStats = teamMembers.map((member: any) => ({
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      phone: member.phone,
      status: member.status.toLowerCase(),
      joinedDate: member.joinedDate.toISOString().split('T')[0],
      institution: member.institution,
      createdAt: member.createdAt.toISOString().split('T')[0],
      adminId: member.adminId // Include admin ID in response
    }))

    return NextResponse.json(teamMemberStats)
  } catch (error) {
    console.error('❌ Failed to fetch team members:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch team members',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  
  console.log('📝 Creating team member in database...')
  
  try {
    const body = await request.json()
    console.log('📋 Creating team member with data:', body)
    
    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      console.error('❌ Missing required fields:', { name: !!body.name, email: !!body.email, password: !!body.password })
      return NextResponse.json(
        { error: 'Missing required fields: name, email, and password are required' },
        { status: 400 }
      )
    }
    
    // Check if team member with this email already exists
    const existingMember = await prisma.teamMember.findFirst({
      where: { 
        email: body.email
      }
    })
    
    if (existingMember) {
      console.error('❌ Team member with this email already exists:', body.email)
      return NextResponse.json(
        { error: `A team member with email "${body.email}" already exists. Please use a different email or delete the existing team member first.` },
        { status: 409 }
      )
    }

    // Check if user account already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: body.email }
    })

    if (existingUser) {
      console.error('❌ User account with this email already exists:', body.email)
      return NextResponse.json(
        { error: `A user account with email "${body.email}" already exists. Please use a different email.` },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Map role from TeamMember to User
    let userRole = 'STUDENT'
    if (body.role === 'ADMIN') {
      userRole = 'ADMIN'
    } else if (body.role === 'MANAGER') {
      userRole = 'INSTITUTION'
    }

    // Get or create a default institution for team members
    let defaultInstitution = await prisma.institution.findFirst({
      where: { institutionId: 'TEAM-MEMBERS' }
    })

    if (!defaultInstitution) {
      defaultInstitution = await prisma.institution.create({
        data: {
          institutionId: 'TEAM-MEMBERS',
          name: 'Team Members',
          email: 'team@rankpredict.com',
          location: 'System',
          contactPerson: 'System',
          password: hashedPassword, // Use the same password for simplicity
          status: 'ACTIVE',
          currentStudents: 0
        }
      })
    }

    // Create user account
    const userAccount = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        role: userRole as any, // Fix type issue
        institutionId: defaultInstitution.id
      }
    })

    console.log('✅ User account created successfully:', userAccount.id)
    
    console.log('💾 Creating team member in database...')
    
    // Use manual adminId if provided, otherwise leave it null
    const adminId = body.adminId || null
    console.log('🆔 Using admin ID:', adminId || 'Not provided')
    
    // Create team member with manual admin ID
    const teamMember = await prisma.teamMember.create({
      data: {
        name: body.name,
        email: body.email,
        role: body.role || 'MEMBER',
        status: body.status || 'ACTIVE',
        institutionId: defaultInstitution.id
        // Note: adminId field temporarily removed due to Prisma type issues
        // Will be added back after server restart
      }
    })

    console.log('✅ Team member created successfully in database:', teamMember.id)

    const response = {
      id: teamMember.id,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      status: teamMember.status.toLowerCase(),
      joinedDate: teamMember.joinedDate.toISOString().split('T')[0],
      department: teamMember.department,
      phone: teamMember.phone,
      adminId: teamMember.adminId,
      institution: {
        id: defaultInstitution.id,
        name: defaultInstitution.name,
        institutionId: defaultInstitution.institutionId
      },
      createdAt: teamMember.createdAt.toISOString().split('T')[0],
      userAccountId: userAccount.id
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('❌ Failed to create team member:', error)
    
    let errorMessage = 'Failed to create team member'
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'A team member with this email already exists'
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid institution reference'
      } else if (error.message.includes('Database')) {
        errorMessage = 'Database connection error'
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

export async function PATCH(request: NextRequest) {
  
  try {
    const body = await request.json()
    console.log('🔧 Updating team member with data:', body)
    
    // Prepare update data - only include fields that are provided
    const updateData: any = {}
    
    if (body.name) updateData.name = body.name
    if (body.email) updateData.email = body.email
    if (body.role) updateData.role = body.role
    if (body.department !== undefined) updateData.department = body.department
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.status) updateData.status = body.status?.toUpperCase()
    
    console.log('🔧 Update data prepared:', updateData)
    
    // First, find the current team member to get associated user info
    const currentTeamMember = await prisma.teamMember.findUnique({
      where: { id: body.id },
      include: {
        institution: true
      }
    })
    
    if (!currentTeamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }
    
    // Update team member
    const teamMember = await prisma.teamMember.update({
      where: {
        id: body.id
      },
      data: updateData,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            institutionId: true
          }
        }
      }
    })

    // Also update the associated user account if name or email changed
    if (body.name || body.email) {
      const userUpdateData: any = {}
      if (body.name) userUpdateData.name = body.name
      if (body.email) userUpdateData.email = body.email
      
      // Find and update the user account
      await prisma.user.updateMany({
        where: {
          email: currentTeamMember.email // Use original email to find the user
        },
        data: userUpdateData
      })
      
      console.log('🔧 Associated user account updated')
    }

    console.log('✅ Team member updated successfully:', teamMember.id)

    return NextResponse.json({
      id: teamMember.id,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      department: teamMember.department,
      phone: teamMember.phone,
      status: teamMember.status.toLowerCase(),
      joinedDate: teamMember.joinedDate.toISOString().split('T')[0],
      institution: teamMember.institution,
      createdAt: teamMember.createdAt.toISOString().split('T')[0]
    })
  } catch (error) {
    console.error('❌ Failed to update team member:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update team member',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }
    
    await prisma.teamMember.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully'
    })
  } catch (error) {
    console.error('❌ Failed to delete team member:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete team member',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
