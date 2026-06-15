import { createContext, useContext, type ReactNode } from 'react'

import type { GrievancePermissions } from '@/lib/grievance-permissions'
import { getGrievancePermissions, grievanceBasePath } from '@/lib/grievance-permissions'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/types/auth'

interface GrievancePortalContextValue {
  basePath: string
  permissions: GrievancePermissions
  role: UserRole
}

const GrievancePortalContext = createContext<GrievancePortalContextValue | null>(null)

export function GrievancePortalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role = user?.role ?? 'helpdesk'
  const value: GrievancePortalContextValue = {
    basePath: grievanceBasePath(role),
    permissions: getGrievancePermissions(role),
    role,
  }
  return (
    <GrievancePortalContext.Provider value={value}>{children}</GrievancePortalContext.Provider>
  )
}

export function useGrievancePortal() {
  const ctx = useContext(GrievancePortalContext)
  if (!ctx) throw new Error('useGrievancePortal must be used within GrievancePortalProvider')
  return ctx
}

export function grievanceTicketPath(basePath: string, ticketId: string) {
  return `${basePath}/tickets/${ticketId}`
}

export function grievanceTicketsPath(basePath: string) {
  return `${basePath}/tickets`
}

export function grievanceDashboardPath(basePath: string) {
  return `${basePath}/dashboard`
}

export function grievanceReportsPath(basePath: string) {
  return `${basePath}/reports`
}

export function grievanceAuditPath(basePath: string) {
  return `${basePath}/audit`
}
