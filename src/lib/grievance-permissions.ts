import type { UserRole } from '@/types/auth'

export interface GrievancePermissions {
  viewOnly: boolean
  canAssign: boolean
  canUpdateStatus: boolean
  canResolve: boolean
  canEscalate: boolean
  canAddInternalComment: boolean
  canViewReports: boolean
  canViewAudit: boolean
  maxEscalationLevel: 1 | 2 | 3
}

export function getGrievancePermissions(role: UserRole): GrievancePermissions {
  switch (role) {
    case 'helpdesk':
      return {
        viewOnly: false,
        canAssign: true,
        canUpdateStatus: true,
        canResolve: true,
        canEscalate: true,
        canAddInternalComment: true,
        canViewReports: true,
        canViewAudit: false,
        maxEscalationLevel: 2,
      }
    case 'pension_admin':
      return {
        viewOnly: false,
        canAssign: true,
        canUpdateStatus: true,
        canResolve: true,
        canEscalate: true,
        canAddInternalComment: true,
        canViewReports: true,
        canViewAudit: true,
        maxEscalationLevel: 3,
      }
    case 'super_admin':
      return {
        viewOnly: false,
        canAssign: true,
        canUpdateStatus: true,
        canResolve: true,
        canEscalate: true,
        canAddInternalComment: true,
        canViewReports: true,
        canViewAudit: true,
        maxEscalationLevel: 3,
      }
    default:
      return {
        viewOnly: true,
        canAssign: false,
        canUpdateStatus: false,
        canResolve: false,
        canEscalate: false,
        canAddInternalComment: false,
        canViewReports: false,
        canViewAudit: false,
        maxEscalationLevel: 1,
      }
  }
}

export function grievanceBasePath(role: UserRole): string {
  switch (role) {
    case 'helpdesk':
      return '/helpdesk'
    case 'pension_admin':
      return '/admin/grievance'
    case 'super_admin':
      return '/superadmin/grievance'
    default:
      return '/helpdesk'
  }
}

export const GRIEVANCE_PORTAL_ROLES = ['helpdesk', 'pension_admin', 'super_admin'] as const
export type GrievancePortalRole = (typeof GRIEVANCE_PORTAL_ROLES)[number]

export function isGrievancePortalRole(role: UserRole): role is GrievancePortalRole {
  return GRIEVANCE_PORTAL_ROLES.includes(role as GrievancePortalRole)
}
