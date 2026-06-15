import { useMemo } from 'react'

import { AppShellLayout } from '@/components/admin/layout/app-shell-layout'
import {
  getGrievanceNavGroups,
  grievanceMobilePriority,
} from '@/components/grievance/layout/grievance-nav'
import { GrievancePortalProvider, useGrievancePortal } from '@/components/grievance/grievance-portal-context'

function GrievanceShell() {
  const { basePath, permissions } = useGrievancePortal()
  const navGroups = useMemo(
    () => getGrievanceNavGroups(basePath, permissions.viewOnly),
    [basePath, permissions.viewOnly],
  )
  const mobilePriority = useMemo(() => grievanceMobilePriority(basePath), [basePath])

  return (
    <AppShellLayout
      portal="helpdesk"
      navGroups={navGroups}
      title="PensionFlow"
      subtitle="Helpdesk Portal"
      homeHref={`${basePath}/dashboard`}
      markLabel="PF"
      mobileNavPriority={mobilePriority}
    />
  )
}

export function GrievanceLayout() {
  return (
    <GrievancePortalProvider>
      <GrievanceShell />
    </GrievancePortalProvider>
  )
}
