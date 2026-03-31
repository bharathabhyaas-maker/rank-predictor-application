// Permission middleware for API routes
import { NextRequest } from 'next/server'
import { getPermissions } from '@/lib/permissions'

export function checkApiPermission(userRole: string, requiredPermission: string): boolean {
  const permissions = getPermissions(userRole)
  return permissions[requiredPermission as keyof typeof permissions] || false
}

export function createPermissionMiddleware(requiredPermission: string) {
  return async (request: NextRequest) => {
    // Get user from session/token (implement based on your auth system)
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!checkApiPermission(user.role, requiredPermission)) {
      return Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return null // Continue to the actual handler
  }
}

// Helper to get user from request (implement based on your auth system)
async function getUserFromRequest(request: NextRequest): Promise<{ role: string } | null> {
  // This would typically get user from session, JWT token, etc.
  // For now, return a mock user - replace with your actual implementation
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader) {
    return null
  }
  
  // Parse token/session and get user
  // This is a placeholder - implement your actual auth logic
  try {
    // Example: Parse JWT or session cookie
    const token = authHeader.replace('Bearer ', '')
    // const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // return decoded.user
    
    // For now, return null to force proper implementation
    return null
  } catch (error) {
    return null
  }
}
