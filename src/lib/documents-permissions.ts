import type { UserRole } from '@/types/auth'

export interface DocumentPermissions {
  viewOnly: boolean
  canUpload: boolean
  canVerify: boolean
  canReject: boolean
  canRequestReupload: boolean
  canViewAudit: boolean
  canViewAll: boolean
}

export function getDocumentPermissions(role: UserRole): DocumentPermissions {
  switch (role) {
    case 'pension_admin':
      return {
        viewOnly: false,
        canUpload: true,
        canVerify: true,
        canReject: true,
        canRequestReupload: true,
        canViewAudit: true,
        canViewAll: true,
      }
    case 'recovery':
      return {
        viewOnly: false,
        canUpload: true,
        canVerify: false,
        canReject: false,
        canRequestReupload: false,
        canViewAudit: false,
        canViewAll: false,
      }
    case 'pensioner':
      return {
        viewOnly: false,
        canUpload: true,
        canVerify: false,
        canReject: false,
        canRequestReupload: false,
        canViewAudit: false,
        canViewAll: false,
      }
    default:
      return {
        viewOnly: true,
        canUpload: false,
        canVerify: false,
        canReject: false,
        canRequestReupload: false,
        canViewAudit: false,
        canViewAll: true,
      }
  }
}

export function documentsBasePath(role: UserRole): string {
  switch (role) {
    case 'pension_admin':
      return '/admin/documents'
    case 'recovery':
      return '/recovery/documents'
    case 'pensioner':
      return '/pensioner/documents'
    default:
      return '/admin/documents'
  }
}

export const DOCUMENT_PORTAL_ROLES = ['pension_admin', 'recovery', 'pensioner'] as const
export type DocumentPortalRole = (typeof DOCUMENT_PORTAL_ROLES)[number]

export function isDocumentPortalRole(role: UserRole): role is DocumentPortalRole {
  return DOCUMENT_PORTAL_ROLES.includes(role as DocumentPortalRole)
}
