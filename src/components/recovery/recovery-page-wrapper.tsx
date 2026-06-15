import type { ReactNode } from 'react'

import { RecoveryPortalProvider } from '@/components/recovery/recovery-portal-context'

export function RecoveryPageWrapper({ children }: { children: ReactNode }) {
  return <RecoveryPortalProvider>{children}</RecoveryPortalProvider>
}
