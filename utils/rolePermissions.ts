import { UserRole, RolePermissions } from '@/types';

/**
 * Role-Based Access Control (RBAC) Permissions
 * 
 * Three user roles with different permissions:
 * - Contractor: Full edit access (edit, add, delete projects)
 * - Sub-contractor: Full edit access (can review and modify timecharts)
 * - Observer: View-only access (can only view timechart, cannot edit)
 */

export const rolePermissions: Record<string, RolePermissions> = {
  contractor: {
    canEdit: true,
    canDelete: true,
    canAddActivity: true,
    canEditActivity: true,
    canDeleteActivity: true,
    canAddHoliday: true,
    canDeleteHoliday: true,
    canAddSubcontractor: true,
    canDeleteSubcontractor: true,
    canViewTimechart: true,
    canLogDailyActivity: true,
    canMarkActivityStarted: true,
    canMarkActivityComplete: true,
  },
  'sub-contractor': {
    canEdit: true,
    canDelete: true,
    canAddActivity: true,
    canEditActivity: true,
    canDeleteActivity: true,
    canAddHoliday: true,
    canDeleteHoliday: true,
    canAddSubcontractor: true,
    canDeleteSubcontractor: true,
    canViewTimechart: true,
    canLogDailyActivity: true,
    canMarkActivityStarted: true,
    canMarkActivityComplete: true,
  },
  observer: {
    canEdit: false,
    canDelete: false,
    canAddActivity: false,
    canEditActivity: false,
    canDeleteActivity: false,
    canAddHoliday: false,
    canDeleteHoliday: false,
    canAddSubcontractor: false,
    canDeleteSubcontractor: false,
    canViewTimechart: true,
    canLogDailyActivity: true,
    canMarkActivityStarted: false,
    canMarkActivityComplete: false,
  },
};

/**
 * Get permissions for a specific user role
 */
export function getPermissions(role: string): RolePermissions {
  return rolePermissions[role] ?? rolePermissions['observer'];
}

/**
 * Check if a user can perform a specific action.
 * Safely accepts a full User object, a role string, or null/undefined.
 */
export function canPerformAction(
  userOrRole: { role?: string } | string | null | undefined,
  action: string
): boolean {
  if (!userOrRole) return false;
  const role = typeof userOrRole === 'string' ? userOrRole : (userOrRole as any).role;
  if (!role) return false;
  const perms = rolePermissions[role as string];
  if (!perms) {
    // Unknown legacy role — grant full access rather than crashing
    return true;
  }
  return (perms as any)[action] === true;
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<string, string> = {
    contractor: 'Contractor',
    'sub-contractor': 'Sub-contractor',
    observer: 'Observer',
    project_manager: 'Project Manager',
    owner: 'Owner',
    admin: 'Admin',
    viewer: 'Viewer',
  };
  return roleNames[role] ?? role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<string, string> = {
    contractor: 'Full access to create, edit, and delete projects',
    'sub-contractor': 'Full access to manage project timecharts',
    observer: 'View-only access to view project timecharts',
    project_manager: 'Full access to manage project timecharts',
    owner: 'Full access to manage all aspects of the project',
    admin: 'Administrative access to manage users and settings',
    viewer: 'View-only access to the project',
  };
  return descriptions[role] ?? '';
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return ['contractor', 'sub-contractor', 'observer'];
}
