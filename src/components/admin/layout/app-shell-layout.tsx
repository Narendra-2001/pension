import { useMemo, useState } from 'react'
import { Outlet } from '@tanstack/react-router'

import {
  AppAdminSidebar,
  MobileNav,
  type NavGroup,
  type NavItem,
} from '@/components/admin/layout/app-admin-sidebar'
import { AppAdminTopBar } from '@/components/admin/layout/app-admin-top-bar'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { pensionerMobilePriority } from '@/components/pensioner/layout/pensioner-nav'
import { useAuth } from '@/providers/auth-provider'

interface AppShellLayoutProps {
  portal: 'admin' | 'superadmin' | 'pensioner' | 'recovery' | 'audit' | 'helpdesk'
  navItems?: NavItem[]
  navGroups?: NavGroup[]
  title: string
  subtitle?: string
  homeHref: string
  markLabel?: string
  mobileNavPriority?: string[]
}

function flattenNavGroups(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((g) => g.items)
}

export function AppShellLayout({
  portal,
  navItems,
  navGroups,
  title,
  subtitle,
  homeHref,
  markLabel,
  mobileNavPriority,
}: AppShellLayoutProps) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const mobileNavItems = useMemo(() => {
    if (navGroups) {
      const flat = flattenNavGroups(navGroups)
      const priority =
        portal === 'admin'
          ? [
              '/admin/dashboard',
              '/admin/tasks',
              '/admin/pensioners',
              '/admin/pensioners/add',
              '/admin/reports/pension',
            ]
          : portal === 'pensioner'
            ? pensionerMobilePriority
            : portal === 'recovery'
              ? (mobileNavPriority ?? ['/recovery/dashboard', '/recovery/cases'])
              : portal === 'audit'
                ? (mobileNavPriority ?? ['/audit/dashboard', '/audit/logs'])
                : portal === 'helpdesk'
                  ? (mobileNavPriority ?? ['/helpdesk/dashboard', '/helpdesk/tickets'])
                  : [
                  '/superadmin/dashboard',
                  '/superadmin/admin-users',
                  '/superadmin/departments',
                  '/superadmin/roles',
                  '/superadmin/security',
                ]
      const picked = priority
        .map((href) => flat.find((item) => item.href === href))
        .filter((item): item is NavItem => !!item)
      if (picked.length >= 5) return picked.slice(0, 5)
      const rest = flat.filter((item) => !priority.includes(item.href))
      return [...picked, ...rest].slice(0, 5)
    }
    return navItems?.slice(0, 5) ?? []
  }, [navGroups, navItems, portal, mobileNavPriority])

  const handleSignOut = () => {
    logout()
  }

  const sidebarProps = {
    title,
    subtitle,
    homeHref,
    markLabel,
    user,
    onSignOut: handleSignOut,
    ...(navGroups ? { groups: navGroups } : { items: navItems ?? [] }),
  }

  return (
    <div className="admin-shell flex h-svh min-h-0 overflow-hidden bg-background">
      <aside
        className="app-sidebar-rail hidden shrink-0 lg:flex"
        aria-label="Navigation"
      >
        <AppAdminSidebar {...sidebarProps} />
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <AppAdminTopBar
          portal={portal}
          onSignOut={handleSignOut}
          onMenuClick={() => setMobileOpen(true)}
        />

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="app-sidebar-rail w-[min(100%,260px)] border-r-0 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{title} navigation</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col pt-10">
              <AppAdminSidebar
                {...sidebarProps}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0">
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav items={mobileNavItems} />
    </div>
  )
}
