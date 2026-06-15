import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  CalendarDays,
  Filter,
  History,
  Layers3,
  Search,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { PensionComponentHistoryTimeline } from '@/components/admin/pensioners/pension-component-history-timeline'
import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { PensionerPageShell } from '@/components/pensioner/shared/pensioner-page-ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchPensionComponentHistory } from '@/data/pension-structure-api'
import { formatPensionCurrency } from '@/lib/pension-structure'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { PensionComponentHistoryEntry } from '@/types/pension-structure'
import { cn } from '@/lib/utils'

function HistorySummaryBanner({
  stats,
}: {
  stats: {
    latest: PensionComponentHistoryEntry
    totalChanges: number
    uniqueComponents: number
    totalDelta: number
  }
}) {
  const latestDelta = stats.latest.newValue - stats.latest.oldValue
  const deltaTone =
    latestDelta >= 0
      ? 'text-emerald-700 dark:text-emerald-300'
      : 'text-rose-700 dark:text-rose-300'

  return (
    <motion.div
      variants={adminStaggerItem}
      className="relative mb-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-violet-500/[0.07] via-card to-sky-500/[0.05] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] sm:p-6"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-violet-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-sky-500/10 blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
            <History className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Most recent revision
            </p>
            <p className="mt-1 truncate text-xl font-bold text-foreground sm:text-2xl">
              {stats.latest.componentName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Effective {format(parseISO(stats.latest.effectiveDate), 'dd MMM yyyy')}
              <span className="mx-2 text-border">·</span>
              Recorded {format(parseISO(stats.latest.timestamp), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <div className="rounded-xl bg-card/80 px-4 py-2.5 ring-1 ring-border/60 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Latest change
            </p>
            <p className={cn('mt-0.5 text-lg font-bold tabular-nums', deltaTone)}>
              {latestDelta >= 0 ? '+' : ''}
              {formatPensionCurrency(latestDelta)}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid gap-3 border-t border-border/50 pt-5 sm:grid-cols-3">
        {[
          {
            label: 'Total revisions',
            value: stats.totalChanges.toLocaleString('en-IN'),
            icon: Layers3,
          },
          {
            label: 'Components updated',
            value: stats.uniqueComponents.toLocaleString('en-IN'),
            icon: CalendarDays,
          },
          {
            label: 'Net value change',
            value: `${stats.totalDelta >= 0 ? '+' : ''}${formatPensionCurrency(stats.totalDelta)}`,
            icon: TrendingUp,
            tone: stats.totalDelta >= 0 ? 'positive' : 'negative',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-xl bg-card/70 px-3.5 py-3 ring-1 ring-border/50"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
              <item.icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {item.label}
              </p>
              <p
                className={cn(
                  'mt-0.5 truncate text-sm font-bold tabular-nums',
                  item.tone === 'positive' && 'text-emerald-700 dark:text-emerald-300',
                  item.tone === 'negative' && 'text-rose-700 dark:text-rose-300',
                )}
              >
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function PensionHistoryPage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const [search, setSearch] = useState('')
  const [componentFilter, setComponentFilter] = useState<string>('all')

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['pension-component-history', pensionerId],
    queryFn: () => fetchPensionComponentHistory(pensionerId),
    enabled: !!pensionerId,
  })

  const componentOptions = useMemo(() => {
    const names = [...new Set(history.map((entry) => entry.componentName))].sort()
    return names
  }, [history])

  const stats = useMemo(() => {
    if (!history.length) return null
    const sorted = [...history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    const totalDelta = history.reduce((sum, entry) => sum + (entry.newValue - entry.oldValue), 0)

    return {
      latest: sorted[0],
      totalChanges: history.length,
      uniqueComponents: new Set(history.map((entry) => entry.componentName)).size,
      totalDelta,
    }
  }, [history])

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      if (componentFilter !== 'all' && entry.componentName !== componentFilter) return false

      return matchesListSearch(search, [
        entry.componentName,
        entry.reason,
        entry.changedBy,
        entry.changedByRole,
        entry.ppoNumber,
        formatPensionCurrency(entry.oldValue),
        formatPensionCurrency(entry.newValue),
      ])
    })
  }, [history, search, componentFilter])

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <PensionerPageShell>
      <motion.div variants={adminStaggerItem}>
        <PageHeader
          variant="admin"
          title="Pension Change History"
          description="A clear record of every revision to your pension components, with before-and-after amounts and reasons"
        />
      </motion.div>

      {stats && <HistorySummaryBanner stats={stats} />}

      <motion.div variants={adminStaggerItem} className="mb-5 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by component, reason, or administrator..."
              className="h-11 rounded-xl border-border/60 bg-card pl-9 shadow-sm"
            />
          </div>
          <Badge variant="outline" className="h-11 w-fit shrink-0 rounded-xl px-3 text-xs font-medium">
            <Filter className="mr-1.5 size-3.5" />
            {filteredHistory.length} of {history.length} shown
          </Badge>
        </div>

        {componentOptions.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={componentFilter === 'all' ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setComponentFilter('all')}
            >
              All components
            </Button>
            {componentOptions.map((name) => (
              <Button
                key={name}
                type="button"
                size="sm"
                variant={componentFilter === name ? 'default' : 'outline'}
                className="rounded-full"
                onClick={() => setComponentFilter(name)}
              >
                {name}
              </Button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={adminStaggerItem}>
        {history.length === 0 ? (
          <EmptyState
            icon={<History className="size-7 text-muted-foreground" />}
            title="No pension changes yet"
            description="When an administrator updates your pension components, each revision will appear here with the old amount, new amount, and reason."
          />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon={<Search className="size-7 text-muted-foreground" />}
            title="No matching revisions"
            description="Try a different search term or clear the component filter to see all records."
            action={
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setSearch('')
                  setComponentFilter('all')
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">Revision timeline</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Grouped by month, newest changes first
                </p>
              </div>
              <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <ArrowUpRight className="size-3.5" />
                Scroll to review older entries
              </div>
            </div>
            <PensionComponentHistoryTimeline
              entries={filteredHistory}
              animated
              variant="rich"
              groupByMonth
            />
          </div>
        )}
      </motion.div>
    </PensionerPageShell>
  )
}
