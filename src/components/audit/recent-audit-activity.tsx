import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'
import { ArrowRight, ChevronRight, Radio, User } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AuditLogDetailDialog } from '@/components/audit/audit-log-detail-dialog'
import { AuditModuleBadge } from '@/components/audit/audit-module-badge'
import { Button } from '@/components/ui/button'
import { AUDIT_MODULE_COLORS, AUDIT_MODULE_LABELS, AUDIT_ACTION_LABELS } from '@/lib/audit'
import { AUDIT_ACTION_ICONS, getAuditActionToneClasses } from '@/lib/audit-ui'
import type { AuditModule, SystemAuditEntry } from '@/types/audit'
import { cn } from '@/lib/utils'

interface RecentAuditActivityProps {
  entries: SystemAuditEntry[]
  maxItems?: number
  onViewAll?: () => void
  className?: string
}

function groupLabel(timestamp: string): string {
  const date = parseISO(timestamp)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd MMM yyyy')
}

function relativeTime(timestamp: string): string {
  return formatDistanceToNow(parseISO(timestamp), { addSuffix: true })
}

export function RecentAuditActivity({
  entries,
  maxItems = 8,
  onViewAll,
  className,
}: RecentAuditActivityProps) {
  const [moduleFilter, setModuleFilter] = useState<AuditModule | 'all'>('all')
  const [selectedEntry, setSelectedEntry] = useState<SystemAuditEntry | null>(null)

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [entries],
  )

  const filtered = useMemo(
    () =>
      moduleFilter === 'all'
        ? sorted
        : sorted.filter((e) => e.module === moduleFilter),
    [sorted, moduleFilter],
  )

  const visible = filtered.slice(0, maxItems)

  const grouped = useMemo(() => {
    const map = new Map<string, SystemAuditEntry[]>()
    for (const entry of visible) {
      const label = groupLabel(entry.timestamp)
      const list = map.get(label) ?? []
      list.push(entry)
      map.set(label, list)
    }
    return Array.from(map.entries())
  }, [visible])

  const moduleCounts = useMemo(() => {
    const counts = new Map<AuditModule, number>()
    for (const entry of sorted.slice(0, maxItems)) {
      counts.set(entry.module, (counts.get(entry.module) ?? 0) + 1)
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  }, [sorted, maxItems])

  const uniqueModules = useMemo(
    () => Array.from(new Set(sorted.map((e) => e.module))),
    [sorted],
  )

  if (!entries.length) {
    return (
      <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center', className)}>
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Radio className="size-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium">No recent activity</p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          System events will appear here as officers and users perform actions
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-5 lg:grid-cols-[1fr_17rem]', className)}>
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Live feed
          </span>

          <div className="flex flex-wrap gap-1.5">
            <FilterChip
              active={moduleFilter === 'all'}
              onClick={() => setModuleFilter('all')}
              label="All"
            />
            {uniqueModules.slice(0, 4).map((mod) => (
              <FilterChip
                key={mod}
                active={moduleFilter === mod}
                onClick={() => setModuleFilter(mod)}
                label={AUDIT_MODULE_LABELS[mod]}
                color={AUDIT_MODULE_COLORS[mod]}
              />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {grouped.map(([label, groupEntries]) => (
            <section key={label}>
              <div className="mb-2 flex items-center gap-2">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </h4>
                <div className="h-px flex-1 bg-border/60" />
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {groupEntries.length} {groupEntries.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              <div className="relative space-y-0">
                {groupEntries.map((entry, i) => (
                  <ActivityFeedRow
                    key={entry.id}
                    entry={entry}
                    isLast={i === groupEntries.length - 1}
                    onSelect={() => setSelectedEntry(entry)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {filtered.length > maxItems && onViewAll && (
          <div className="mt-4 flex justify-center border-t border-border/40 pt-4">
            <Button variant="ghost" size="sm" className="rounded-lg text-primary" onClick={onViewAll}>
              View {filtered.length - maxItems} more events
              <ChevronRight className="ml-0.5 size-4" />
            </Button>
          </div>
        )}
      </div>

      <aside className="space-y-3">
        <SummaryCard
          label="Showing"
          value={visible.length}
          sub={`of ${filtered.length} recent events`}
        />

        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            By module
          </p>
          <ul className="mt-3 space-y-2.5">
            {moduleCounts.map(([mod, count]) => {
              const pct = Math.round((count / Math.max(visible.length, 1)) * 100)
              const color = AUDIT_MODULE_COLORS[mod]
              return (
                <li key={mod}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate font-medium">{AUDIT_MODULE_LABELS[mod]}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {sorted[0] && (
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Latest event
            </p>
            <p className="mt-2 text-sm font-semibold leading-snug">
              {AUDIT_ACTION_LABELS[sorted[0].action]}
            </p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {sorted[0].entityLabel ?? sorted[0].entityType}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {relativeTime(sorted[0].timestamp)}
            </p>
          </div>
        )}

        {onViewAll && (
          <Button variant="outline" className="w-full rounded-lg" onClick={onViewAll}>
            Open full audit log
            <ChevronRight className="ml-1 size-4" />
          </Button>
        )}
      </aside>

      <AuditLogDetailDialog
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </div>
  )
}

function ActivityFeedRow({
  entry,
  isLast,
  onSelect,
}: {
  entry: SystemAuditEntry
  isLast: boolean
  onSelect: () => void
}) {
  const ActionIcon = AUDIT_ACTION_ICONS[entry.action]
  const toneClasses = getAuditActionToneClasses(entry.action)
  const moduleColor = AUDIT_MODULE_COLORS[entry.module]
  const hasChange = entry.oldValue || entry.newValue

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative flex w-full gap-0 text-left"
    >
      <div className="relative flex w-10 shrink-0 flex-col items-center">
        {!isLast && (
          <div
            className="absolute left-1/2 top-10 h-[calc(100%-8px)] w-px -translate-x-1/2 bg-border/70"
            aria-hidden
          />
        )}
        <div
          className={cn(
            'relative z-10 flex size-8 items-center justify-center rounded-full border-2 border-background shadow-sm transition-transform group-hover:scale-105',
            toneClasses,
          )}
        >
          <ActionIcon className="size-3.5" strokeWidth={2} />
        </div>
      </div>

      <div
        className={cn(
          'mb-3 min-w-0 flex-1 overflow-hidden rounded-xl border border-border/50 bg-card transition-all',
          'group-hover:border-border group-hover:shadow-sm',
        )}
      >
        <div className="flex">
          <div
            className="w-1 shrink-0 rounded-l-xl"
            style={{ backgroundColor: moduleColor }}
            aria-hidden
          />

          <div className="min-w-0 flex-1 p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{AUDIT_ACTION_LABELS[entry.action]}</p>
                  <AuditModuleBadge module={entry.module} />
                </div>
                {entry.entityLabel && (
                  <p className="mt-1 line-clamp-1 text-sm text-foreground">{entry.entityLabel}</p>
                )}
              </div>
              <time
                dateTime={entry.timestamp}
                className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
                title={format(parseISO(entry.timestamp), 'dd MMM yyyy, hh:mm a')}
              >
                {relativeTime(entry.timestamp)}
              </time>
            </div>

            {hasChange && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {entry.oldValue && (
                  <span className="max-w-[8rem] truncate rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 line-through dark:bg-red-950/30 dark:text-red-400">
                    {entry.oldValue}
                  </span>
                )}
                {entry.oldValue && entry.newValue && (
                  <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                )}
                {entry.newValue && (
                  <span className="max-w-[8rem] truncate rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    {entry.newValue}
                  </span>
                )}
              </div>
            )}

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-medium uppercase">
                {entry.user.charAt(0)}
              </span>
              <span className="truncate">{entry.user}</span>
              {entry.userRole && (
                <>
                  <span aria-hidden>·</span>
                  <span className="truncate">{entry.userRole}</span>
                </>
              )}
              <User className="ml-auto size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string
  active: boolean
  onClick: () => void
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
        active
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground',
      )}
      style={
        active && color
          ? {
              borderColor: `${color}40`,
              backgroundColor: `${color}14`,
              color,
            }
          : undefined
      }
    >
      {label}
    </button>
  )
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string
  value: number
  sub: string
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}
