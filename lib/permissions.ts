// Permission levels for admin roles
export const PERMISSIONS = {
  // Super Admin - Full access
  SUPER_ADMIN: {
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: true,
    canManageInstitutions: true,
    canCreateInstitutions: true,
    canManageUsers: true,
    canCreateUsers: true,
    canManageDatasets: true,
    canUploadDatasets: true,
    canViewAnalytics: true,
    canAssignTemplates: true,
    canViewAllPredictions: true,
    canManageSystem: true
  },
  
  // Admin - Can manage templates and institutions
  ADMIN: {
    canCreateTemplates: true,
    canEditTemplates: true,
    canDeleteTemplates: false, // Cannot delete, only deactivate
    canManageInstitutions: true,
    canCreateInstitutions: true,
    canManageUsers: false, // Cannot manage other admins
    canCreateUsers: false,
    canManageDatasets: true,
    canUploadDatasets: true,
    canViewAnalytics: false, // Analytics removed
    canAssignTemplates: true,
    canViewAllPredictions: true,
    canManageSystem: false
  },
  
  // Analyst - Can view and analyze data
  ANALYST: {
    canCreateTemplates: false, // Cannot create templates
    canEditTemplates: false,
    canDeleteTemplates: false,
    canManageInstitutions: false, // Cannot manage institutions
    canCreateInstitutions: false,
    canManageUsers: false,
    canCreateUsers: false,
    canManageDatasets: true, // Can view datasets
    canUploadDatasets: false, // Cannot upload
    canViewAnalytics: false, // Analytics removed
    canAssignTemplates: false,
    canViewAllPredictions: true,
    canManageSystem: false
  },
  
  // Manager - Can manage team and view reports
  MANAGER: {
    canCreateTemplates: false,
    canEditTemplates: false,
    canDeleteTemplates: false,
    canManageInstitutions: false,
    canCreateInstitutions: false,
    canManageUsers: true, // Can manage team members
    canCreateUsers: false,
    canManageDatasets: false,
    canUploadDatasets: false,
    canViewAnalytics: false, // Analytics removed
    canAssignTemplates: false,
    canViewAllPredictions: true,
    canManageSystem: false
  }
};

// Get permissions for a role
export function getPermissions(role: string) {
  switch (role?.toLowerCase()) {
    case 'super-admin':
      return PERMISSIONS.SUPER_ADMIN;
    case 'admin':
      return PERMISSIONS.ADMIN;
    case 'analyst':
      return PERMISSIONS.ANALYST;
    case 'manager':
      return PERMISSIONS.MANAGER;
    default:
      return PERMISSIONS.ANALYST; // Default to most restrictive
  }
}

// Check if a user has permission for a specific action
export function hasPermission(userRole: string, permission: keyof typeof PERMISSIONS.SUPER_ADMIN): boolean {
  const permissions = getPermissions(userRole);
  return permissions[permission] || false;
}
