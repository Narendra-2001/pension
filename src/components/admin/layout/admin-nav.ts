import {
  Bell,
  ClipboardList,
  FileText,
  Heart,
  LayoutDashboard,
  MessageSquare,
  RotateCcw,
  Settings,
  Shield,
  ShieldAlert,
  Upload,
  UserPen,
  Users,
  Wallet,
  PenLine,
} from 'lucide-react'

import type { NavGroup } from '@/components/admin/layout/app-admin-sidebar'

export const adminNavGroups: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Work Queue', href: '/admin/tasks', icon: ClipboardList, badgeKey: 'work-queue' },
    ],
  },
  {
    id: 'pensioners',
    label: 'Pensioners',
    icon: Users,
    items: [
      { label: 'All Pensioners', href: '/admin/pensioners', icon: Users },
      { label: 'Add Pensioner', href: '/admin/pensioners/add', icon: Users },
      { label: 'Bulk Import', href: '/admin/pensioners/bulk-import', icon: Upload },
      { label: 'Pending Activations', href: '/admin/pensioners/pending-activations', icon: Users },
      { label: 'Profile Update Requests', href: '/admin/profile-updates', icon: UserPen },
    ],
  },
  {
    id: 'disbursements',
    label: 'Disbursements',
    icon: Wallet,
    items: [
      { label: 'Manual Payment Entry', href: '/admin/disbursements/manual', icon: PenLine },
      { label: 'Bulk Monthly Payment', href: '/admin/disbursements/bulk', icon: Upload },
    ],
  },
  {
    id: 'verification',
    label: 'Verification',
    icon: Shield,
    items: [
      { label: 'Approved', href: '/admin/verification/approved', icon: Shield },
      { label: 'Rejected', href: '/admin/verification/rejected', icon: Shield },
    ],
  },
  {
    id: 'suspensions',
    label: 'Suspensions',
    icon: ShieldAlert,
    items: [
      { label: 'Suspended Pensioners', href: '/admin/suspensions', icon: ShieldAlert },
      { label: 'Restoration Requests', href: '/admin/suspensions/restoration', icon: ShieldAlert },
    ],
  },
  {
    id: 'recovery',
    label: 'Recovery',
    icon: RotateCcw,
    items: [
      { label: 'Recovery Dashboard', href: '/admin/recovery/dashboard', icon: LayoutDashboard },
      { label: 'Recovery Cases', href: '/admin/recovery/cases', icon: RotateCcw },
    ],
  },
  {
    id: 'communication',
    label: 'Communication',
    icon: Bell,
    items: [
      { label: 'Notice Dashboard', href: '/admin/communication/notices/dashboard', icon: LayoutDashboard },
      { label: 'Notice History', href: '/admin/communication/notices', icon: FileText },
      { label: 'Generate Notice', href: '/admin/communication/notices/create', icon: FileText },
      { label: 'Notification Dashboard', href: '/admin/communication/notifications/dashboard', icon: Bell },
      { label: 'Notification History', href: '/admin/communication/notifications', icon: Bell },
      { label: 'Notice Templates', href: '/admin/communication/templates/notices', icon: FileText },
      { label: 'Notification Templates', href: '/admin/communication/templates/notifications', icon: Settings },
      { label: 'Audit Trail', href: '/admin/communication/audit', icon: FileText },
    ],
  },
  {
    id: 'grievance',
    label: 'Grievances',
    icon: MessageSquare,
    items: [
      { label: 'Ticket Queue', href: '/admin/grievance/tickets', icon: ClipboardList },
      { label: 'Reports', href: '/admin/grievance/reports', icon: FileText },
      { label: 'Audit Trail', href: '/admin/grievance/audit', icon: FileText },
    ],
  },
  {
    id: 'demise',
    label: 'Demise Management',
    icon: Heart,
    items: [
      { label: 'Demise Dashboard', href: '/admin/demise/dashboard', icon: LayoutDashboard },
      { label: 'Demise Requests', href: '/admin/demise/requests', icon: ClipboardList },
      { label: 'Deceased Pensioners', href: '/admin/demise/deceased', icon: Heart },
      { label: 'Family Pension Cases', href: '/admin/demise/family-pension', icon: Heart },
    ],
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    items: [
      { label: 'Document Dashboard', href: '/admin/documents/dashboard', icon: LayoutDashboard },
      { label: 'Document Repository', href: '/admin/documents/repository', icon: FileText },
      { label: 'Verification Queue', href: '/admin/documents/verification', icon: Shield },
      { label: 'Upload Document', href: '/admin/documents/upload', icon: Upload },
      { label: 'Audit Trail', href: '/admin/documents/audit', icon: FileText },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: Upload,
    items: [
      { label: 'Pension Reports', href: '/admin/reports/pension', icon: Upload },
      { label: 'Verification Reports', href: '/admin/reports/verification', icon: Upload },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Settings,
    items: [{ label: 'Settings', href: '/admin/settings', icon: Settings }],
  },
]
