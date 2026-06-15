import {
  ClipboardList,
  FileSearch,
  LayoutDashboard,
  ScrollText,
  Shield,
} from 'lucide-react'

import type { NavGroup } from '@/components/admin/layout/app-admin-sidebar'

export const auditNavGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [{ label: 'Dashboard', href: '/audit/dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'audit',
    label: 'Audit Trail',
    icon: ScrollText,
    items: [
      { label: 'System Audit Logs', href: '/audit/logs', icon: ClipboardList },
      { label: 'Compliance Review', href: '/audit/compliance', icon: Shield },
    ],
  },
  {
    id: 'modules',
    label: 'Module Trails',
    icon: FileSearch,
    items: [
      { label: 'Recovery Audit', href: '/audit/modules/recovery', icon: FileSearch },
      { label: 'Communication Audit', href: '/audit/modules/communication', icon: FileSearch },
      { label: 'Document Audit', href: '/audit/modules/documents', icon: FileSearch },
    ],
  },
]

export const auditMobilePriority = [
  '/audit/dashboard',
  '/audit/logs',
  '/audit/compliance',
]
