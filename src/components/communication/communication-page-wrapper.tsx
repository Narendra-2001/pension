import type { ReactNode } from 'react'

import { CommunicationPortalProvider } from '@/components/communication/communication-portal-context'

export function CommunicationPageWrapper({ children }: { children: ReactNode }) {
  return <CommunicationPortalProvider>{children}</CommunicationPortalProvider>
}
