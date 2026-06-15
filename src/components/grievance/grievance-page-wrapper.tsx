import type { ReactNode } from 'react'

import { GrievancePortalProvider } from '@/components/grievance/grievance-portal-context'

export function GrievancePageWrapper({ children }: { children: ReactNode }) {
  return <GrievancePortalProvider>{children}</GrievancePortalProvider>
}
