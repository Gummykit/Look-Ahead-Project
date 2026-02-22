import { UserRole, RolePermissions } from '@/types';

/**
 * Role-Based Access Control (RBAC) Permissions
 * 
 * Three user roles with different permissions:
 * - Contractor: Full edit access (edit, add, delete projects)
 * - Sub-contractor: Full edit access (can review and modify timecharts)
 * - Observer: View-only access (can only view timechart, cannot edit)
 */

export const rolePermissions: Record<UserRole, RolePermissions> = {
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
    canLogDailyActivity: true, // Observers can log daily progress
  },
};

/**
 * Get permissions for a specific user role
 */
export function getPermissions(role: UserRole): RolePermissions {
  return rolePermissions[role];
}

/**
 * Check if a user can perform a specific action
 */
export function canPerformAction(role: UserRole, action: keyof RolePermissions): boolean {
  const permissions = getPermissions(role);
  return permissions[action];
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    contractor: 'Contractor',
    'sub-contractor': 'Sub-contractor',
    observer: 'Observer',
  };
  return roleNames[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    contractor: 'Full access to create, edit, and delete projects',
    'sub-contractor': 'Full access to manage project timecharts',
    observer: 'View-only access to view project timecharts',
  };
  return descriptions[role];
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return ['contractor', 'sub-contractor', 'observer'];
}
