// Example: How to use permissions in API routes
import { NextRequest, NextResponse } from 'next/server'
import { getPermissions } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    // Get user from your auth system (session, JWT, etc.)
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const userPermissions = getPermissions(user.role)
    
    // Check specific permission
    if (!userPermissions.canCreateTemplates) {
      return NextResponse.json(
        { error: 'Insufficient permissions to create templates' },
        { status: 403 }
      )
    }
    
    // Proceed with the operation
    const body = await request.json()
    // ... create template logic
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function - implement based on your auth system
async function getUserFromRequest(request: NextRequest) {
  // Get user from session, JWT token, or other auth mechanism
  // This is just an example - implement your actual auth logic
  return null // Replace with actual user retrieval
}
