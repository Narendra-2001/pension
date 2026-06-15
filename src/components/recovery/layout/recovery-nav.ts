import {
  Bell,
  ClipboardList,
  IndianRupee,
  LayoutDashboard,
  Plus,
} from 'lucide-react'

import type { NavGroup } from '@/components/admin/layout/app-admin-sidebar'

export function getRecoveryNavGroups(basePath: string, viewOnly: boolean): NavGroup[] {
  const casesItems = viewOnly
    ? [{ label: 'Recovery Cases', href: `${basePath}/cases`, icon: ClipboardList }]
    : [
        { label: 'All Cases', href: `${basePath}/cases`, icon: ClipboardList },
        { label: 'Create Case', href: `${basePath}/cases/create`, icon: Plus },
      ]

  return [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      items: [{ label: 'Dashboard', href: `${basePath}/dashboard`, icon: LayoutDashboard }],
    },
    {
      id: 'recovery',
      label: 'Recovery Management',
      icon: IndianRupee,
      items: casesItems,
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: ClipboardList,
      items: [
        { label: 'Recovery Documents', href: `${basePath}/documents`, icon: ClipboardList },
        ...(!viewOnly ? [{ label: 'Upload Document', href: `${basePath}/documents/upload`, icon: Plus }] : []),
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: Bell,
      items: [
        { label: 'Notice Dashboard', href: '/recovery/communication/notices/dashboard', icon: LayoutDashboard },
        { label: 'Notices', href: '/recovery/communication/notices', icon: Bell },
        ...(!viewOnly ? [{ label: 'Generate Notice', href: '/recovery/communication/notices/create', icon: Plus }] : []),
        { label: 'Notifications', href: '/recovery/communication/notifications/dashboard', icon: Bell },
      ],
    },
  ]
}

export const recoveryMobilePriority = (basePath: string) => [
  `${basePath}/dashboard`,
  `${basePath}/cases`,
  `${basePath}/cases/create`,
]
