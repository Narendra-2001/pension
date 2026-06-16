import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { UserAvatar } from '@/components/admin/shared/user-avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { UserRole } from '@/types/auth'
import { useAuth } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'

const ADMIN_BREADCRUMB_MAP: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Dashboard',
  pensioners: 'Pensioners',
  add: 'Add pensioner',
  'bulk-import': 'Bulk import',
  disbursements: 'Disbursements',
  bulk: 'Bulk monthly payment',
  manual: 'Manual payment entry',
  'pending-activations': 'Pending activations',
  recovery: 'Recovery',
  'profile-updates': 'Profile updates',
  tasks: 'Work Queue',
  'life-certificate': 'Life certificate',
  activation: 'Activation',
  grievance: 'Grievance',
  verification: 'Verification',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspensions: 'Suspensions',
  restoration: 'Restoration',
  demise: 'Demise',
  deceased: 'Deceased',
  'family-pension': 'Family pension',
  documents: 'Documents',
  reports: 'Reports',
  pension: 'Pension reports',
  settings: 'Settings',
}

const SUPERADMIN_BREADCRUMB_MAP: Record<string, string> = {
  superadmin: 'Super Admin',
  dashboard: 'Dashboard',
  'admin-users': 'Admin users',
  departments: 'Departments',
  roles: 'Team access',
  settings: 'Settings',
  'audit-logs': 'Activity log',
  security: 'Security',
}

const AUDIT_BREADCRUMB_MAP: Record<string, string> = {
  audit: 'Audit',
  dashboard: 'Dashboard',
  logs: 'Audit Logs',
  compliance: 'Compliance',
  modules: 'Modules',
  recovery: 'Recovery',
  communication: 'Communication',
  documents: 'Documents',
}

const RECOVERY_BREADCRUMB_MAP: Record<string, string> = {
  recovery: 'Recovery',
  accounts: 'Accounts',
  admin: 'Admin',
  dashboard: 'Dashboard',
  cases: 'Recovery Cases',
  create: 'Create Case',
  installments: 'Installments',
  payments: 'Payments',
}

const PENSIONER_BREADCRUMB_MAP: Record<string, string> = {
  pensioner: 'Portal',
  dashboard: 'Dashboard',
  profile: 'My Profile',
  request: 'Request Update',
  requests: 'My Requests',
  pension: 'Pension Details',
  statements: 'Pension Statements',
  recovery: 'Recovery Status',
  verification: 'Life Certificate',
  documents: 'Documents',
  notifications: 'Notifications',
  grievance: 'Grievance',
  demise: 'Demise Reporting',
  settings: 'Settings',
  login: 'Login',
  activate: 'Activate Account',
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  pension_admin: 'Pension Admin',
  accounts: 'Accounts Officer',
  recovery: 'Recovery Officer',
  audit: 'Audit Officer',
  helpdesk: 'Helpdesk',
  pensioner: 'Pensioner',
}

const ADMIN_NOTIFICATIONS = [
  { id: '1', title: 'New pensioner pending activation', time: '2m ago', unread: true },
  { id: '2', title: 'Life certificate submitted for review', time: '15m ago', unread: true },
  { id: '3', title: 'Suspension request — PEN-00008', time: '1h ago', unread: false },
  { id: '4', title: 'Bulk import completed — 24 records', time: '2h ago', unread: false },
]

const SUPERADMIN_NOTIFICATIONS = [
  { id: '1', title: 'New admin user provisioned', time: '30m ago', unread: true },
  { id: '2', title: 'Security policy updated', time: '2h ago', unread: true },
  { id: '3', title: 'Department config changed', time: 'Yesterday', unread: false },
]

interface AppAdminTopBarProps {
  portal?: 'admin' | 'superadmin' | 'pensioner' | 'recovery' | 'audit' | 'helpdesk'
  onSignOut: () => void
  onMenuClick?: () => void
}

export function AppAdminTopBar({ portal = 'admin', onSignOut, onMenuClick }: AppAdminTopBarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  const isSuperAdmin = portal === 'superadmin'
  const isPensioner = portal === 'pensioner'
  const isRecovery = portal === 'recovery'
  const isAudit = portal === 'audit'
  const displayName = user?.name ?? (isSuperAdmin ? 'Super Admin' : isPensioner ? 'Pensioner' : isRecovery ? 'Recovery Officer' : isAudit ? 'Audit Officer' : 'Admin')
  const displayEmail = isPensioner
    ? (user?.username ?? 'PPO Number')
    : user?.username
      ? `${user.username}@gov.in`
      : 'admin@gov.in'
  const roleLabel = user ? ROLE_LABELS[user.role] : isSuperAdmin ? 'Super Admin' : isPensioner ? 'Pensioner' : 'Pension Admin'
  const breadcrumbMap = isPensioner
    ? PENSIONER_BREADCRUMB_MAP
    : isAudit
      ? AUDIT_BREADCRUMB_MAP
      : isRecovery
        ? RECOVERY_BREADCRUMB_MAP
        : isSuperAdmin
          ? SUPERADMIN_BREADCRUMB_MAP
          : ADMIN_BREADCRUMB_MAP
  const notifications = isSuperAdmin ? SUPERADMIN_NOTIFICATIONS : ADMIN_NOTIFICATIONS
  const unread = notifications.filter((n) => n.unread).length

  const segments = pathname.split('/').filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] ?? seg.replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  const currentPageLabel =
    crumbs[crumbs.length - 1]?.label ??
    (isPensioner ? 'Portal' : isSuperAdmin ? 'Today' : 'Today')

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 w-full min-w-0 items-center gap-2 px-4 sm:gap-3 md:px-6 lg:px-8">
        {onMenuClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0 rounded-full lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </Button>
        )}

        <p className="min-w-0 truncate text-sm font-normal text-foreground/90 md:hidden">
          {currentPageLabel}
        </p>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 text-xs lg:flex" aria-label="Breadcrumb">
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {crumb.href !== crumbs[0].href && (
                <ChevronRight className="size-3 text-muted-foreground/50" />
              )}
              {crumb.isLast ? (
                <span className="truncate font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        {(portal === 'admin' || portal === 'superadmin') && (
          <div className="hidden flex-1 justify-center px-4 md:flex lg:max-w-md lg:flex-none xl:max-w-lg xl:flex-1">
            <label className="admin-topbar-search group relative flex w-full max-w-md items-center">
              <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground transition-colors group-focus-within:text-foreground" />
              <input
                type="search"
                placeholder="Search pensioners, PPO, departments..."
                className="h-9 w-full rounded-lg border border-border/80 bg-muted/40 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/20 focus:bg-card focus:ring-1 focus:ring-ring/30"
              />
            </label>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative size-10 rounded-full">
                <Bell className="size-[18px]" />
                {unread > 0 && (
                  <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 rounded-xl border border-border p-0 shadow-sm">
              <div className="border-b border-border/60 px-4 py-4">
                <p className="font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">{unread} unread</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'border-b border-border/40 px-4 py-3 last:border-0',
                      n.unread && 'bg-muted/50',
                    )}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex max-w-[12.5rem] items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:bg-muted/60 sm:max-w-none sm:pr-3"
              >
                <UserAvatar
                  user={user}
                  name={displayName}
                  className="size-8 shrink-0 ring-1 ring-border/80"
                  fallbackClassName="bg-muted text-xs font-medium text-foreground"
                />
                <div className="hidden min-w-0 flex-1 text-left sm:block">
                  <p className="truncate text-sm font-medium leading-tight text-foreground">{displayName}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{roleLabel}</p>
                </div>
                <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 overflow-hidden rounded-xl border border-border p-0 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-4">
                <UserAvatar
                  user={user}
                  name={displayName}
                  className="size-11 shrink-0 ring-1 ring-border/80"
                  fallbackClassName="bg-muted font-medium text-foreground"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
                  <span className="mt-1.5 inline-flex rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {roleLabel}
                  </span>
                </div>
              </div>
              <div className="p-1.5">
                {isSuperAdmin ? (
                  <>
                    <DropdownMenuItem
                      className="gap-2.5 rounded-xl px-3 py-2.5"
                      onClick={() => navigate({ to: '/superadmin/settings' })}
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      System settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2.5 rounded-xl px-3 py-2.5"
                      onClick={() => navigate({ to: '/superadmin/roles' })}
                    >
                      <Users className="size-4 text-muted-foreground" />
                      Team & permissions
                    </DropdownMenuItem>
                  </>
                ) : isPensioner ? (
                  <DropdownMenuItem
                    className="gap-2.5 rounded-xl px-3 py-2.5"
                    onClick={() => navigate({ to: '/pensioner/settings' })}
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    Account settings
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="gap-2.5 rounded-xl px-3 py-2.5"
                    onClick={() => navigate({ to: '/admin/settings' })}
                  >
                    <Settings className="size-4 text-muted-foreground" />
                    Account settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="gap-2.5 rounded-xl px-3 py-2.5 text-destructive focus:text-destructive"
                  onClick={onSignOut}
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
