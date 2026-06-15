import { createContext, useContext, type ReactNode } from 'react'

import type { DocumentPermissions } from '@/lib/documents-permissions'
import { documentsBasePath, getDocumentPermissions } from '@/lib/documents-permissions'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/types/auth'

interface DocumentPortalContextValue {
  basePath: string
  permissions: DocumentPermissions
  role: UserRole
}

const DocumentPortalContext = createContext<DocumentPortalContextValue | null>(null)

export function DocumentPortalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role = user?.role ?? 'pension_admin'
  const value: DocumentPortalContextValue = {
    basePath: documentsBasePath(role),
    permissions: getDocumentPermissions(role),
    role,
  }
  return (
    <DocumentPortalContext.Provider value={value}>{children}</DocumentPortalContext.Provider>
  )
}

export function useDocumentPortal() {
  const ctx = useContext(DocumentPortalContext)
  if (!ctx) throw new Error('useDocumentPortal must be used within DocumentPortalProvider')
  return ctx
}

export function documentPath(basePath: string, documentId: string) {
  return `${basePath}/${documentId}`
}

export function documentHistoryPath(basePath: string, documentId: string) {
  return `${basePath}/${documentId}/history`
}

export function documentUploadPath(basePath: string) {
  return `${basePath}/upload`
}

export function documentRepositoryPath(basePath: string) {
  return `${basePath}/repository`
}

export function documentVerificationPath(basePath: string) {
  return `${basePath}/verification`
}

export function documentDashboardPath(basePath: string) {
  return `${basePath}/dashboard`
}

export function documentAuditPath(basePath: string) {
  return `${basePath}/audit`
}
