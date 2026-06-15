import type { ReactNode } from 'react'

import { DemisePortalProvider } from '@/components/demise/demise-portal-context'

export function DemisePageWrapper({ children }: { children: ReactNode }) {
  return <DemisePortalProvider>{children}</DemisePortalProvider>
}
