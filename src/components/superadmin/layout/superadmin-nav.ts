import {
  Building2,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  Users,
} from 'lucide-react'

import type { NavItem } from '@/components/admin/layout/app-admin-sidebar'

export const superAdminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard },
  { label: 'Admin Users', href: '/superadmin/admin-users', icon: Users },
  { label: 'Departments', href: '/superadmin/departments', icon: Building2 },
  { label: 'Roles & Permissions', href: '/superadmin/roles', icon: KeyRound },
  { label: 'System Settings', href: '/superadmin/settings', icon: Settings },
  { label: 'Audit Logs', href: '/superadmin/audit-logs', icon: ScrollText },
  { label: 'Security', href: '/superadmin/security', icon: Shield },
]

export const superAdminBrand = {
  title: 'PensionFlow',
  subtitle: 'Super Admin Portal',
  markLabel: 'PF',
}
