import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { adminNavGroups } from '@/components/admin/layout/admin-nav'
import { AppShellLayout } from '@/components/admin/layout/app-shell-layout'
import type { NavGroup } from '@/components/admin/layout/app-admin-sidebar'
import { fetchPendingAdminTaskCount } from '@/data/admin-tasks-api'

function withWorkQueueBadge(groups: NavGroup[], count: number): NavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) =>
      item.badgeKey === 'work-queue' ? { ...item, badge: count } : item,
    ),
  }))
}

export function AdminLayout() {
  const { data: pendingTaskCount = 0 } = useQuery({
    queryKey: ['pending-admin-task-count'],
    queryFn: fetchPendingAdminTaskCount,
    refetchOnMount: 'always',
  })

  const navGroups = useMemo(
    () => withWorkQueueBadge(adminNavGroups, pendingTaskCount),
    [pendingTaskCount],
  )

  return (
    <AppShellLayout
      portal="admin"
      navGroups={navGroups}
      title="PensionFlow"
      subtitle="Admin Portal"
      homeHref="/admin/dashboard"
      markLabel="PF"
    />
  )
}
