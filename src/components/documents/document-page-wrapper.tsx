import type { ReactNode } from 'react'

import { DocumentPortalProvider } from '@/components/documents/document-portal-context'

export function DocumentPageWrapper({ children }: { children: ReactNode }) {
  return <DocumentPortalProvider>{children}</DocumentPortalProvider>
}
