import type { UserRole } from '@/types/auth'

export interface DemisePermissions {
  viewOnly: boolean
  canVerify: boolean
  canApprove: boolean
  canReject: boolean
  canRequestClarification: boolean
  canInitiateFamilyPension: boolean
  canReviewFamilyPension: boolean
  canCreateAdminEntry: boolean
  canReverse: boolean
}

export function getDemisePermissions(role: UserRole): DemisePermissions {
  switch (role) {
    case 'pension_admin':
      return {
        viewOnly: false,
        canVerify: true,
        canApprove: true,
        canReject: true,
        canRequestClarification: true,
        canInitiateFamilyPension: true,
        canReviewFamilyPension: true,
        canCreateAdminEntry: true,
        canReverse: true,
      }
    case 'audit':
      return {
        viewOnly: true,
        canVerify: false,
        canApprove: false,
        canReject: false,
        canRequestClarification: false,
        canInitiateFamilyPension: false,
        canReviewFamilyPension: false,
        canCreateAdminEntry: false,
        canReverse: false,
      }
    case 'recovery':
      return {
        viewOnly: true,
        canVerify: false,
        canApprove: false,
        canReject: false,
        canRequestClarification: false,
        canInitiateFamilyPension: false,
        canReviewFamilyPension: false,
        canCreateAdminEntry: false,
        canReverse: false,
      }
    default:
      return {
        viewOnly: true,
        canVerify: false,
        canApprove: false,
        canReject: false,
        canRequestClarification: false,
        canInitiateFamilyPension: false,
        canReviewFamilyPension: false,
        canCreateAdminEntry: false,
        canReverse: false,
      }
  }
}

export function demiseBasePath(role: UserRole): string {
  switch (role) {
    case 'pension_admin':
      return '/admin/demise'
    case 'audit':
      return '/audit/demise'
    case 'recovery':
      return '/recovery/demise'
    default:
      return '/admin/demise'
  }
}

export const DEMISE_PORTAL_ROLES = ['pension_admin', 'audit', 'recovery'] as const
export type DemisePortalRole = (typeof DEMISE_PORTAL_ROLES)[number]

export function isDemisePortalRole(role: UserRole): role is DemisePortalRole {
  return DEMISE_PORTAL_ROLES.includes(role as DemisePortalRole)
}
