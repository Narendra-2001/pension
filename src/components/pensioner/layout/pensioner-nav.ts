import {
  AlertTriangle,
  Bell,
  ClipboardList,
  FileText,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Plus,
  RotateCcw,
  Settings,
  Shield,
  ShieldAlert,
  Upload,
  User,
  Wallet,
  History,
} from 'lucide-react'

import type { NavGroup } from '@/components/admin/layout/app-admin-sidebar'

export const pensionerNavGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', href: '/pensioner/dashboard', icon: LayoutDashboard },
      { label: 'My Profile', href: '/pensioner/profile', icon: User },
      { label: 'Notifications', href: '/pensioner/notifications', icon: Bell },
    ],
  },
  {
    id: 'pension',
    label: 'Pension',
    icon: Wallet,
    items: [
      { label: 'Pension Details', href: '/pensioner/pension', icon: Wallet },
      { label: 'Pension History', href: '/pensioner/pension/history', icon: History },
      { label: 'Pension Statements', href: '/pensioner/statements', icon: FileText },
      { label: 'Recovery Status', href: '/pensioner/recovery', icon: AlertTriangle },
      { label: 'Suspension Status', href: '/pensioner/suspension', icon: ShieldAlert },
      { label: 'Restoration Requests', href: '/pensioner/suspension/requests', icon: RotateCcw },
    ],
  },
  {
    id: 'grievance',
    label: 'Grievances',
    icon: MessageSquare,
    items: [
      { label: 'Raise Ticket', href: '/pensioner/grievance/raise', icon: Plus },
      { label: 'My Tickets', href: '/pensioner/grievance/tickets', icon: ClipboardList },
      { label: 'Ticket History', href: '/pensioner/grievance/history', icon: FileText },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    icon: Shield,
    items: [
      { label: 'Life Certificate', href: '/pensioner/verification', icon: Shield },
      { label: 'Documents', href: '/pensioner/documents', icon: Upload },
      { label: 'Demise Reporting', href: '/nominee/login', icon: Heart },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    icon: Settings,
    items: [{ label: 'Settings', href: '/pensioner/settings', icon: Settings }],
  },
]

export const pensionerMobilePriority = [
  '/pensioner/dashboard',
  '/pensioner/verification',
  '/pensioner/verification/start',
  '/pensioner/pension',
  '/pensioner/notifications',
  '/pensioner/settings',
]
