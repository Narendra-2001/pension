import { useMemo } from 'react'

import { AppShellLayout } from '@/components/admin/layout/app-shell-layout'
import {
  communicationMobilePriority,
  getCommunicationNavGroups,
} from '@/components/communication/layout/communication-nav'
import {
  CommunicationPortalProvider,
  useCommunicationPortal,
} from '@/components/communication/communication-portal-context'

function CommunicationShell() {
  const { basePath, permissions } = useCommunicationPortal()
  const navGroups = useMemo(
    () => getCommunicationNavGroups(basePath, permissions),
    [basePath, permissions],
  )
  const mobilePriority = useMemo(() => communicationMobilePriority(basePath), [basePath])

  return (
    <AppShellLayout
      portal="recovery"
      navGroups={navGroups}
      title="Communication"
      subtitle="Notices & Notifications"
      homeHref={`${basePath}/notices/dashboard`}
      markLabel="Comms"
      mobileNavPriority={mobilePriority}
    />
  )
}

export function CommunicationLayout() {
  return (
    <CommunicationPortalProvider>
      <CommunicationShell />
    </CommunicationPortalProvider>
  )
}
