import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('🔔 Getting notification preferences for institution:', id)

    // Get institution with notification preferences
    const institution = await prisma.institution.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        notificationPreferences: true
      }
    })

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      )
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      emailNotifications: true,
      dailySummary: true,
      weeklyReport: false,
      templateAlerts: true
    }

    const preferences = institution.notificationPreferences || defaultPreferences

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error getting notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to get notification preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const preferences = await request.json()
    console.log('🔔 Updating notification preferences for institution:', id)
    console.log('📋 New preferences:', preferences)

    // Validate preferences
    const validPreferences = {
      emailNotifications: Boolean(preferences.emailNotifications),
      dailySummary: Boolean(preferences.dailySummary),
      weeklyReport: Boolean(preferences.weeklyReport),
      templateAlerts: Boolean(preferences.templateAlerts)
    }

    // Update institution notification preferences
    const updatedInstitution = await prisma.institution.update({
      where: { id },
      data: {
        notificationPreferences: validPreferences
      }
    })

    console.log('✅ Notification preferences updated successfully')

    return NextResponse.json({
      success: true,
      preferences: validPreferences
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}
