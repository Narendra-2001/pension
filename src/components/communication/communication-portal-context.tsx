import { createContext, useContext, type ReactNode } from 'react'

import {
  getCommunicationBasePath,
  getCommunicationPermissions,
  type CommunicationPermissions,
} from '@/lib/communication-permissions'
import { useAuth } from '@/providers/auth-provider'
import type { UserRole } from '@/types/auth'

interface CommunicationPortalContextValue {
  basePath: string
  permissions: CommunicationPermissions
  role: UserRole
}

const CommunicationPortalContext = createContext<CommunicationPortalContextValue | null>(null)

export function CommunicationPortalProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const role = user?.role ?? 'pension_admin'
  const value: CommunicationPortalContextValue = {
    basePath: getCommunicationBasePath(role),
    permissions: getCommunicationPermissions(role),
    role,
  }
  return (
    <CommunicationPortalContext.Provider value={value}>
      {children}
    </CommunicationPortalContext.Provider>
  )
}

export function useCommunicationPortal() {
  const ctx = useContext(CommunicationPortalContext)
  if (!ctx) throw new Error('useCommunicationPortal must be used within CommunicationPortalProvider')
  return ctx
}
