import {
  BarChart3,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
} from 'lucide-react'

import type { NavGroup } from '@/components/admin/layout/app-admin-sidebar'

export function getGrievanceNavGroups(basePath: string, viewOnly: boolean): NavGroup[] {
  return [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      items: [{ label: 'Dashboard', href: `${basePath}/dashboard`, icon: LayoutDashboard }],
    },
    {
      id: 'tickets',
      label: 'Ticket Management',
      icon: MessageSquare,
      items: [
        { label: 'Ticket Queue', href: `${basePath}/tickets`, icon: ClipboardList },
      ],
    },
    {
      id: 'reports',
      label: 'Reports & Audit',
      icon: BarChart3,
      items: [
        { label: 'Reports', href: `${basePath}/reports`, icon: BarChart3 },
        ...(!viewOnly ? [{ label: 'Audit Trail', href: `${basePath}/audit`, icon: FileText }] : []),
      ],
    },
  ]
}

export const grievanceMobilePriority = (basePath: string) => [
  `${basePath}/dashboard`,
  `${basePath}/tickets`,
  `${basePath}/reports`,
]
