import type { UserRole } from '@/types/auth'

export interface RecoveryPermissions {
  viewOnly: boolean
  canCreate: boolean
  canSubmit: boolean
  canApprove: boolean
  canConfigureInstallments: boolean
  canRecordPayment: boolean
  canClose: boolean
}

export function getRecoveryPermissions(role: UserRole): RecoveryPermissions {
  switch (role) {
    case 'recovery':
      return {
        viewOnly: false,
        canCreate: true,
        canSubmit: true,
        canApprove: true,
        canConfigureInstallments: true,
        canRecordPayment: true,
        canClose: true,
      }
    case 'accounts':
      return {
        viewOnly: false,
        canCreate: false,
        canSubmit: false,
        canApprove: false,
        canConfigureInstallments: false,
        canRecordPayment: true,
        canClose: false,
      }
    case 'pension_admin':
      return {
        viewOnly: true,
        canCreate: false,
        canSubmit: false,
        canApprove: false,
        canConfigureInstallments: false,
        canRecordPayment: false,
        canClose: false,
      }
    default:
      return {
        viewOnly: true,
        canCreate: false,
        canSubmit: false,
        canApprove: false,
        canConfigureInstallments: false,
        canRecordPayment: false,
        canClose: false,
      }
  }
}

export function recoveryBasePath(role: UserRole): string {
  switch (role) {
    case 'recovery':
      return '/recovery'
    case 'accounts':
      return '/accounts/recovery'
    case 'pension_admin':
      return '/admin/recovery'
    default:
      return '/recovery'
  }
}

export const RECOVERY_PORTAL_ROLES = ['recovery', 'accounts', 'pension_admin'] as const
export type RecoveryPortalRole = (typeof RECOVERY_PORTAL_ROLES)[number]

export function isRecoveryPortalRole(role: UserRole): role is RecoveryPortalRole {
  return RECOVERY_PORTAL_ROLES.includes(role as RecoveryPortalRole)
}
