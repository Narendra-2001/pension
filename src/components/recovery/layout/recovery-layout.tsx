import { useMemo } from 'react'

import { AppShellLayout } from '@/components/admin/layout/app-shell-layout'
import {
  getRecoveryNavGroups,
  recoveryMobilePriority,
} from '@/components/recovery/layout/recovery-nav'
import { RecoveryPortalProvider, useRecoveryPortal } from '@/components/recovery/recovery-portal-context'

function RecoveryShell() {
  const { basePath, permissions, role } = useRecoveryPortal()
  const navGroups = useMemo(
    () => getRecoveryNavGroups(basePath, permissions.viewOnly),
    [basePath, permissions.viewOnly],
  )
  const mobilePriority = useMemo(() => recoveryMobilePriority(basePath), [basePath])
  const subtitle = role === 'accounts' ? 'Accounts Portal' : 'Recovery Portal'

  return (
    <AppShellLayout
      portal="recovery"
      navGroups={navGroups}
      title="PensionFlow"
      subtitle={subtitle}
      homeHref={`${basePath}/dashboard`}
      markLabel="PF"
      mobileNavPriority={mobilePriority}
    />
  )
}

export function RecoveryLayout() {
  return (
    <RecoveryPortalProvider>
      <RecoveryShell />
    </RecoveryPortalProvider>
  )
}
