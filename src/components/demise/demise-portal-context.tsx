import { createContext, useContext, type ReactNode } from 'react'

import type { DemisePermissions } from '@/lib/demise-permissions'
import { demiseBasePath, getDemisePermissions } from '@/lib/demise-permissions'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/types/auth'

interface DemisePortalContextValue {
  basePath: string
  permissions: DemisePermissions
  role: UserRole
}

const DemisePortalContext = createContext<DemisePortalContextValue | null>(null)

export function DemisePortalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role = user?.role ?? 'pension_admin'
  const value: DemisePortalContextValue = {
    basePath: demiseBasePath(role),
    permissions: getDemisePermissions(role),
    role,
  }
  return <DemisePortalContext.Provider value={value}>{children}</DemisePortalContext.Provider>
}

export function useDemisePortal() {
  const ctx = useContext(DemisePortalContext)
  if (!ctx) throw new Error('useDemisePortal must be used within DemisePortalProvider')
  return ctx
}

export function demiseRequestPath(basePath: string, id: string) {
  return `${basePath}/requests/${id}`
}

export function demiseRequestsPath(basePath: string) {
  return `${basePath}/requests`
}

export function demiseDashboardPath(basePath: string) {
  return `${basePath}/dashboard`
}

export function deceasedProfilePath(basePath: string, id: string) {
  return `${basePath}/deceased/${id}`
}

export function familyPensionPath(basePath: string, id: string) {
  return `${basePath}/family-pension/${id}`
}
