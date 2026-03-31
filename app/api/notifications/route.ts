import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(request: Request) {
  try {
    console.log('Notification API: Starting POST request')
    console.log('Notification API: DATABASE_URL exists:', !!process.env.DATABASE_URL)
    
    const body = await request.json()
    console.log('Notification API: Request body:', body)
    
    const { institutionName, institutionType, fullName, email, phone, city, studentCount, examTypes } = body

    // Validate required fields
    if (!institutionName || !fullName || !email) {
      console.error('Missing required fields:', { institutionName, fullName, email })
      return NextResponse.json(
        { error: 'Missing required fields: institutionName, fullName, email' },
        { status: 400 }
      )
    }

    console.log('Notification API: Creating institution onboarding record')
    console.log('Notification API: Prisma models available:', Object.keys(prisma))
    console.log('Notification API: institutionOnboarding available:', !!prisma.institutionOnboarding)
    console.log('Notification API: notification available:', !!prisma.notification)
    
    // Test database connection first
    try {
      const testConnection = await prisma.$queryRaw`SELECT 1`
      console.log('Notification API: Database connection test successful')
    } catch (dbTestError) {
      console.error('Notification API: Database connection test failed:', dbTestError)
      return NextResponse.json(
        { 
          error: 'Database connection failed', 
          details: dbTestError instanceof Error ? dbTestError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
    
    // Store institution onboarding data
    let onboarding
    try {
      onboarding = await prisma.institutionOnboarding.create({
        data: {
          institutionName,
          contactPerson: fullName,
          email,
          mobile: phone,
          location: city,
          interestedCourses: examTypes || [],
          status: 'NEW'
        }
      })
      console.log('Notification API: Onboarding record created:', onboarding.id)
    } catch (onboardingError) {
      console.error('Notification API: Failed to create onboarding record:', onboardingError)
      console.error('Onboarding error details:', {
        name: onboardingError instanceof Error ? onboardingError.name : 'Unknown',
        message: onboardingError instanceof Error ? onboardingError.message : 'Unknown error',
        stack: onboardingError instanceof Error ? onboardingError.stack : 'No stack trace',
        code: (onboardingError as any).code,
        meta: (onboardingError as any).meta
      })
      return NextResponse.json(
        { 
          error: 'Failed to create onboarding record', 
          details: onboardingError instanceof Error ? onboardingError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    // Create notification for super admin
    let notification
    try {
      notification = await prisma.notification.create({
        data: {
          title: 'New Institution Registration',
          message: `A new institution has submitted registration:\n\nInstitution: ${institutionName}\nType: ${institutionType}\nContact: ${fullName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nCity: ${city || 'Not provided'}\nStudent Count: ${studentCount || 'Not provided'}\nExam Types: ${examTypes?.join(', ') || 'None selected'}`,
          type: 'INSTITUTION_REGISTRATION',
          read: false,
          metadata: {
            institutionName,
            institutionType,
            fullName,
            email,
            phone,
            city,
            studentCount,
            examTypes,
            onboardingId: onboarding.id,
            timestamp: new Date().toISOString()
          }
        }
      })
      console.log('Notification API: Notification created successfully:', notification.id)
    } catch (notificationError) {
      console.error('Notification API: Failed to create notification:', notificationError)
      console.error('Notification error details:', {
        name: notificationError instanceof Error ? notificationError.name : 'Unknown',
        message: notificationError instanceof Error ? notificationError.message : 'Unknown error',
        stack: notificationError instanceof Error ? notificationError.stack : 'No stack trace',
        code: (notificationError as any).code,
        meta: (notificationError as any).meta
      })
      return NextResponse.json(
        { 
          error: 'Failed to create notification', 
          details: notificationError instanceof Error ? notificationError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully',
      notificationId: notification.id,
      onboardingId: onboarding.id
    })

  } catch (error) {
    console.error('Notification API: General error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any).code,
      meta: (error as any).meta
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to process registration',
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    console.log('Notification API: Fetching notifications')
    
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log('Notification API: Retrieved', notifications.length, 'notifications')

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{}> }
) {
  try {
    const body = await request.json()
    const { id } = body // Get id from request body instead
    
    console.log('Notification API: Marking notification as read:', id)
    
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true, updatedAt: new Date() }
    })

    console.log('Notification API: Notification marked as read:', notification.id)

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
