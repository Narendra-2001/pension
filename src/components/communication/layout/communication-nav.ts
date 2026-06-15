import {
  Bell,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  Plus,
  Settings,
} from 'lucide-react'

import type { NavGroup } from '@/components/admin/layout/app-admin-sidebar'
import type { CommunicationPermissions } from '@/lib/communication-permissions'

export function getCommunicationNavGroups(
  basePath: string,
  permissions: CommunicationPermissions,
): NavGroup[] {
  const noticeItems = [
    { label: 'Notice Dashboard', href: `${basePath}/notices/dashboard`, icon: LayoutDashboard },
    { label: 'Notice History', href: `${basePath}/notices`, icon: History },
    ...(permissions.canCreateNotice
      ? [{ label: 'Generate Notice', href: `${basePath}/notices/create`, icon: Plus }]
      : []),
  ]

  const notificationItems = [
    { label: 'Notification Dashboard', href: `${basePath}/notifications/dashboard`, icon: Bell },
    { label: 'Notification History', href: `${basePath}/notifications`, icon: ClipboardList },
  ]

  const templateItems = permissions.canManageTemplates
    ? [
        { label: 'Notice Templates', href: `${basePath}/templates/notices`, icon: FileText },
        { label: 'Notification Templates', href: `${basePath}/templates/notifications`, icon: Settings },
      ]
    : []

  const groups: NavGroup[] = [
    {
      id: 'notices',
      label: 'Notices',
      icon: FileText,
      items: noticeItems,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      items: notificationItems,
    },
  ]

  if (templateItems.length) {
    groups.push({
      id: 'templates',
      label: 'Templates',
      icon: Settings,
      items: templateItems,
    })
  }

  if (permissions.canViewAudit) {
    groups.push({
      id: 'audit',
      label: 'Audit',
      icon: ClipboardList,
      items: [{ label: 'Audit Trail', href: `${basePath}/audit`, icon: History }],
    })
  }

  return groups
}

export function communicationMobilePriority(basePath: string) {
  return [
    `${basePath}/notices/dashboard`,
    `${basePath}/notices`,
    `${basePath}/notifications/dashboard`,
  ]
}
