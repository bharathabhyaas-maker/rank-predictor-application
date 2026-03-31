import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET() {
  try {
    console.log('Debug API: Testing database connection')
    
    // Test basic connection
    await prisma.$connect()
    console.log('Debug API: Database connection successful')
    
    // Test notification table access
    const notificationCount = await prisma.notification.count()
    console.log('Debug API: Notification count:', notificationCount)
    
    // Test creating a notification
    const testNotification = await prisma.notification.create({
      data: {
        title: 'Debug Test',
        message: 'This is a debug test notification',
        type: 'DEBUG_TEST',
        read: false,
        metadata: { 
          test: true, 
          timestamp: new Date().toISOString(),
          debugInfo: 'Database connection test'
        }
      }
    })
    
    console.log('Debug API: Test notification created:', testNotification.id)
    
    return NextResponse.json({
      success: true,
      message: 'Database test successful',
      notificationId: testNotification.id,
      notificationCount: notificationCount
    })
    
  } catch (error) {
    console.error('Debug API: Error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any).code
    })
    
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect().catch(console.error)
  }
}
