import { useEffect, useMemo, useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronDown, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { BrandLogo, BrandMark } from '@/components/admin/layout/brand-mark'
import { UserAvatar } from '@/components/admin/shared/user-avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { AppUser, UserRole } from '@/types/auth'
import { cn } from '@/lib/utils'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badgeKey?: string
  badge?: number
}

export interface NavGroup {
  id: string
  label: string
  icon?: LucideIcon
  items: NavItem[]
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

export function isNavActive(pathname: string, href: string) {
  if (
    href === '/admin/dashboard' ||
    href === '/superadmin/dashboard' ||
    href === '/pensioner/dashboard'
  ) {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function groupHasActiveItem(pathname: string, group: NavGroup) {
  return group.items.some((item) => isNavActive(pathname, item.href))
}

function NavLink({
  item,
  active,
  onNavigate,
  nested = false,
}: {
  item: NavItem
  active: boolean
  onNavigate?: () => void
  nested?: boolean
}) {
  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-lg py-2.5 text-sm font-medium leading-snug transition-colors duration-150',
        nested ? 'px-3' : 'px-3.5',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <item.icon
        className={cn(
          'size-[18px] shrink-0 transition-colors',
          active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
        )}
      />
      <span className="truncate">{item.label}</span>
      {typeof item.badge === 'number' && item.badge > 0 ? (
        <span
          className={cn(
            'ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
            active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary text-primary-foreground',
          )}
        >
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      ) : null}
    </Link>
  )
}

function SidebarNavGroups({
  groups,
  onNavigate,
}: {
  groups: NavGroup[]
  onNavigate?: () => void
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const activeGroupId = useMemo(
    () => groups.find((g) => groupHasActiveItem(pathname, g))?.id ?? null,
    [groups, pathname],
  )

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of groups) {
      initial[group.id] = groupHasActiveItem(pathname, group)
    }
    return initial
  })

  useEffect(() => {
    if (activeGroupId) {
      setOpenGroups((prev) => ({ ...prev, [activeGroupId]: true }))
    }
  }, [activeGroupId])

  return (
    <div className="flex flex-col gap-0.5">
      {groups.map((group) => {
        const isOpen = openGroups[group.id] ?? false
        const hasActive = groupHasActiveItem(pathname, group)

        return (
          <Collapsible
            key={group.id}
            open={isOpen}
            onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [group.id]: open }))}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-normal text-muted-foreground transition-colors',
                  hasActive ? 'text-foreground/90' : 'hover:text-foreground',
                )}
              >
                {group.icon && <group.icon className="size-3.5 shrink-0 opacity-60" />}
                <span className="flex-1 truncate">{group.label}</span>
                <ChevronDown
                  className={cn(
                    'size-3.5 shrink-0 opacity-60 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="ml-1 flex flex-col gap-0.5 py-1 pl-2">
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isNavActive(pathname, item.href)}
                    onNavigate={onNavigate}
                    nested
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}

interface AppAdminSidebarProps {
  items?: NavItem[]
  groups?: NavGroup[]
  title: string
  subtitle?: string
  homeHref: string
  markLabel?: string
  user?: AppUser | null
  onNavigate?: () => void
  onSignOut?: () => void
  className?: string
}

export function AppAdminSidebar({
  items,
  groups,
  title,
  subtitle,
  homeHref,
  markLabel = 'PF',
  user,
  onNavigate,
  onSignOut,
  className,
}: AppAdminSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const roleLabel = user ? ROLE_LABELS[user.role] : 'Admin'

  return (
    <div className={cn('flex h-full min-h-0 flex-1 flex-col', className)}>
      <div className="border-b border-border/60 p-4 pb-3">
        <Link
          to={homeHref}
          onClick={onNavigate}
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <BrandMark size="md" label={markLabel} />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium text-foreground/90">{title}</div>
            {subtitle && <div className="truncate text-xs font-normal text-muted-foreground">{subtitle}</div>}
          </div>
        </Link>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
        aria-label={`${title} navigation`}
      >
        {groups ? (
          <SidebarNavGroups groups={groups} onNavigate={onNavigate} />
        ) : (
          items?.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isNavActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))
        )}
      </nav>

      <div className="border-t border-border/60 p-3">
        {user && (
          <div className="flex items-center gap-3 rounded-xl px-1 py-1.5">
            <UserAvatar
              user={user}
              name={user.name}
              className="size-9 shrink-0 ring-1 ring-border"
              fallbackClassName="bg-muted text-xs font-semibold text-foreground"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-foreground">{user.name}</div>
              <div className="truncate text-xs font-normal text-muted-foreground">{roleLabel}</div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            onSignOut?.()
            onNavigate?.()
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card lg:hidden">
      <div className="flex justify-around px-1 py-2">
        {items.slice(0, 5).map((item) => {
          const active = isNavActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <item.icon className={cn('size-5', active && 'stroke-[2.5]')} />
              <span className="max-w-[4rem] truncate">{item.label.split(' ')[0]}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export { BrandLogo }
