# Permission-Based Access Control System

## Overview
The admin dashboard now shows the same features to all admin roles, but access is controlled by permissions based on the user's role.

## Permission Levels

### Super Admin (Full Access)
- ✅ Create, Edit, Delete templates
- ✅ Create and manage institutions
- ✅ Manage other admin users
- ✅ Upload and manage datasets
- ✅ View analytics (if enabled)
- ✅ Assign templates to institutions
- ✅ View all predictions
- ✅ System administration

### Admin (Template & Institution Management)
- ✅ Create and Edit templates
- ❌ Cannot delete templates (only deactivate)
- ✅ Create and manage institutions
- ❌ Cannot manage other admin users
- ✅ Upload and manage datasets
- ❌ Cannot view analytics
- ✅ Assign templates to institutions
- ✅ View all predictions

### Analyst (Data Analysis Only)
- ❌ Cannot create/edit/delete templates
- ❌ Cannot manage institutions
- ❌ Cannot manage users
- ✅ Can view datasets (read-only)
- ❌ Cannot upload datasets
- ❌ Cannot view analytics
- ❌ Cannot assign templates
- ✅ View all predictions (for analysis)

### Manager (Team Management)
- ❌ Cannot create/edit/delete templates
- ❌ Cannot manage institutions
- ✅ Can manage team members
- ❌ Cannot create users
- ❌ Cannot manage datasets
- ❌ Cannot view analytics
- ❌ Cannot assign templates
- ✅ View all predictions

## Dashboard Features by Role

### What Each Role Sees:

**Super Admin & Admin:**
- Create Template button
- Manage Institutions button  
- Manage Datasets button

**Analyst:**
- View Reports button (alternative)
- Team Management button (alternative)

**Manager:**
- View Reports button (alternative)
- Team Management button (alternative)

## Template Actions by Role

**Edit Button:** Only Super Admin & Admin
**Assign Button:** Only Super Admin & Admin  
**Toggle Status:** Only Super Admin & Admin

## API Permission Implementation

Add to any API route:

```typescript
import { getPermissions } from '@/lib/permissions'

// Get user from auth system
const user = await getUserFromRequest(request)
const userPermissions = getPermissions(user.role)

// Check permission
if (!userPermissions.canCreateTemplates) {
  return NextResponse.json(
    { error: 'Insufficient permissions' },
    { status: 403 }
  )
}
```

## Files Modified

1. `/lib/permissions.ts` - Permission definitions
2. `/lib/api-permissions.ts` - API permission helpers
3. `/app/admin/dashboard/page.tsx` - Dashboard with permission checks
4. `/examples/api-permissions-example.ts` - API implementation example

## Benefits

- ✅ Consistent UI - All admins see the same dashboard layout
- ✅ Secure Access - Actions controlled by permissions
- ✅ Scalable - Easy to add new permissions or roles
- ✅ Clear Separation - Each role has appropriate access level
- ✅ No Analytics - Removed as requested
