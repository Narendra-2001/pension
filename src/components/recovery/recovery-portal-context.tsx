import { createContext, useContext, type ReactNode } from 'react'

import type { RecoveryPermissions } from '@/lib/recovery-permissions'
import { getRecoveryPermissions, recoveryBasePath } from '@/lib/recovery-permissions'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/types/auth'

interface RecoveryPortalContextValue {
  basePath: string
  permissions: RecoveryPermissions
  role: UserRole
}

const RecoveryPortalContext = createContext<RecoveryPortalContextValue | null>(null)

export function RecoveryPortalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role = user?.role ?? 'recovery'
  const value: RecoveryPortalContextValue = {
    basePath: recoveryBasePath(role),
    permissions: getRecoveryPermissions(role),
    role,
  }
  return (
    <RecoveryPortalContext.Provider value={value}>{children}</RecoveryPortalContext.Provider>
  )
}

export function useRecoveryPortal() {
  const ctx = useContext(RecoveryPortalContext)
  if (!ctx) throw new Error('useRecoveryPortal must be used within RecoveryPortalProvider')
  return ctx
}

export function recoveryCasePath(basePath: string, caseId: string) {
  return `${basePath}/cases/${caseId}`
}

export function recoveryCasesPath(basePath: string) {
  return `${basePath}/cases`
}

export function recoveryCreatePath(basePath: string) {
  return `${basePath}/cases/create`
}

export function recoveryDashboardPath(basePath: string) {
  return `${basePath}/dashboard`
}
