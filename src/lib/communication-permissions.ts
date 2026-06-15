import type { UserRole } from '@/types/auth'

export interface CommunicationPermissions {
  canCreateNotice: boolean
  canSendNotice: boolean
  canManageTemplates: boolean
  canViewAudit: boolean
  viewOnly: boolean
}

export function getCommunicationBasePath(role: UserRole): string {
  switch (role) {
    case 'recovery':
      return '/recovery/communication'
    case 'accounts':
      return '/accounts/communication'
    default:
      return '/admin/communication'
  }
}

export function getCommunicationPermissions(role: UserRole): CommunicationPermissions {
  switch (role) {
    case 'pension_admin':
      return {
        canCreateNotice: true,
        canSendNotice: true,
        canManageTemplates: true,
        canViewAudit: true,
        viewOnly: false,
      }
    case 'recovery':
      return {
        canCreateNotice: true,
        canSendNotice: true,
        canManageTemplates: false,
        canViewAudit: true,
        viewOnly: false,
      }
    case 'accounts':
      return {
        canCreateNotice: true,
        canSendNotice: true,
        canManageTemplates: false,
        canViewAudit: true,
        viewOnly: false,
      }
    default:
      return {
        canCreateNotice: false,
        canSendNotice: false,
        canManageTemplates: false,
        canViewAudit: false,
        viewOnly: true,
      }
  }
}
