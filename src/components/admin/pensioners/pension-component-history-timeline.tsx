import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Clock, History, User } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  getComponentKindVisual,
  getHistoryDeltaTone,
  groupHistoryByMonth,
} from '@/lib/pension-component-history-ui'
import { formatPensionCurrency } from '@/lib/pension-structure'
import type { PensionComponentHistoryEntry } from '@/types/pension-structure'
import { cn } from '@/lib/utils'

interface PensionComponentHistoryTimelineProps {
  entries: PensionComponentHistoryEntry[]
  className?: string
  animated?: boolean
  variant?: 'default' | 'rich'
  groupByMonth?: boolean
}

function HistoryEntryCard({
  entry,
  animated,
  index,
  variant,
  isLast,
}: {
  entry: PensionComponentHistoryEntry
  animated: boolean
  index: number
  variant: 'default' | 'rich'
  isLast: boolean
}) {
  const delta = entry.newValue - entry.oldValue
  const visual = getComponentKindVisual(entry.componentKind)
  const tone = getHistoryDeltaTone(delta, visual.isCredit)
  const Icon = visual.icon
  const isRich = variant === 'rich'

  const card = (
    <div className={cn('relative flex gap-4', !isLast && 'pb-5')}>
      {!isLast && (
        <motion.div
          initial={animated ? { scaleY: 0 } : false}
          animate={animated ? { scaleY: 1 } : false}
          transition={{ delay: index * 0.06 + 0.15, duration: 0.35 }}
          className={cn(
            'absolute top-10 w-px origin-top bg-border',
            isRich ? 'left-[19px] h-[calc(100%-12px)]' : 'left-[15px] h-[calc(100%-8px)]',
          )}
        />
      )}

      <motion.div
        initial={animated ? { scale: 0 } : false}
        animate={animated ? { scale: 1 } : false}
        transition={{ delay: index * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
        className={cn(
          'relative z-10 flex shrink-0 items-center justify-center rounded-full ring-4 ring-background',
          isRich ? 'size-10' : 'size-8 border-2 border-primary bg-background text-primary',
          isRich && visual.dot,
        )}
      >
        {isRich ? (
          <Icon className="size-4 text-white" strokeWidth={2} />
        ) : (
          <History className="size-3.5" />
        )}
      </motion.div>

      <motion.div
        whileHover={isRich ? { y: -1, transition: { duration: 0.18 } } : undefined}
        className={cn(
          'min-w-0 flex-1 border bg-card transition-shadow',
          isRich
            ? 'rounded-2xl border-border/60 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] hover:border-primary/15 hover:shadow-[0_4px_16px_rgba(15,23,42,0.07)]'
            : 'rounded-xl border-border/60 p-4 shadow-sm hover:shadow-md',
        )}
      >
        {isRich ? (
          <>
            <div className="border-b border-border/50 px-4 py-3.5 sm:px-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{entry.componentName}</p>
                    <Badge
                      variant="outline"
                      className={cn('rounded-md border-0 px-2 py-0 text-[10px] font-semibold', visual.badge)}
                    >
                      {visual.categoryLabel}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      Effective {format(parseISO(entry.effectiveDate), 'dd MMM yyyy')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {format(parseISO(entry.timestamp), 'dd MMM yyyy, h:mm a')}
                    </span>
                  </div>
                </div>
                <Badge className={cn('rounded-full border-0 px-2.5 py-0.5 text-[10px] font-bold', tone.badge)}>
                  {tone.label}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:px-5">
              <div className="rounded-xl bg-muted/35 px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Previous
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-muted-foreground line-through decoration-muted-foreground/40">
                  {formatPensionCurrency(entry.oldValue)}
                </p>
              </div>

              <div className="hidden justify-center sm:flex">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ArrowRight className="size-4" />
                </div>
              </div>

              <div className="rounded-xl bg-primary/[0.06] px-3.5 py-3 ring-1 ring-primary/10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/70">
                  Revised
                </p>
                <p className={cn('mt-1 text-lg font-bold tabular-nums', tone.value)}>
                  {formatPensionCurrency(entry.newValue)}
                </p>
              </div>
            </div>

            <div className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-xl bg-muted/30 px-3.5 py-2.5 sm:mx-5">
              <span className="text-xs text-muted-foreground">Net change</span>
              <span className={cn('text-sm font-bold tabular-nums', tone.value)}>
                {delta > 0 ? '+' : ''}
                {formatPensionCurrency(delta)}
              </span>
            </div>

            {entry.reason && (
              <div className="border-t border-border/50 px-4 py-3.5 sm:px-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Reason
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{entry.reason}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/50 px-4 py-3 text-xs text-muted-foreground sm:px-5">
              <span className="inline-flex items-center gap-1.5">
                <User className="size-3.5 shrink-0" />
                {entry.changedBy}
                <span className="text-muted-foreground/60">·</span>
                {entry.changedByRole}
              </span>
              <span>PPO {entry.ppoNumber}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{entry.componentName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Effective {format(parseISO(entry.effectiveDate), 'dd MMM yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-1.5 text-sm">
                <span className="text-muted-foreground line-through decoration-muted-foreground/50">
                  {formatPensionCurrency(entry.oldValue)}
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
                <span className="font-bold text-primary">{formatPensionCurrency(entry.newValue)}</span>
                <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold', tone.badge)}>
                  {delta > 0 ? '+' : ''}
                  {formatPensionCurrency(delta)}
                </span>
              </div>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{entry.reason}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: 'Changed by', value: entry.changedBy },
                { label: 'Role', value: entry.changedByRole },
                { label: 'PPO', value: entry.ppoNumber },
                {
                  label: 'Recorded',
                  value: format(parseISO(entry.timestamp), 'dd MMM yyyy, HH:mm'),
                },
              ].map((meta) => (
                <span
                  key={meta.label}
                  className="rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  <span className="font-semibold text-foreground">{meta.label}:</span> {meta.value}
                </span>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )

  if (!animated) return card

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {card}
    </motion.div>
  )
}

export function PensionComponentHistoryTimeline({
  entries,
  className,
  animated = false,
  variant = 'default',
  groupByMonth = false,
}: PensionComponentHistoryTimelineProps) {
  if (entries.length === 0) {
    return (
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.98 } : false}
        animate={animated ? { opacity: 1, scale: 1 } : false}
        className={cn(
          'rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center',
          className,
        )}
      >
        <motion.div
          animate={animated ? { y: [0, -4, 0] } : false}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <History className="mx-auto mb-3 size-10 text-muted-foreground/60" />
        </motion.div>
        <p className="font-medium text-foreground">No changes recorded yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pension component revisions will appear here when updated by the administrator
        </p>
      </motion.div>
    )
  }

  if (groupByMonth && variant === 'rich') {
    const groups = groupHistoryByMonth(entries)
    let runningIndex = 0

    return (
      <div className={cn('space-y-8', className)}>
        {groups.map((group) => (
          <section key={group.label}>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {group.label}
              </h3>
              <div className="h-px flex-1 bg-border/70" />
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {group.entries.length} {group.entries.length === 1 ? 'change' : 'changes'}
              </span>
            </div>
            <div className="space-y-0">
              {group.entries.map((entry, index) => {
                const item = (
                  <HistoryEntryCard
                    key={entry.id}
                    entry={entry}
                    animated={animated}
                    index={runningIndex}
                    variant={variant}
                    isLast={index === group.entries.length - 1}
                  />
                )
                runningIndex += 1
                return item
              })}
            </div>
          </section>
        ))}
      </div>
    )
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  return (
    <div className={cn('space-y-0', className)}>
      {sorted.map((entry, index) => (
        <HistoryEntryCard
          key={entry.id}
          entry={entry}
          animated={animated}
          index={index}
          variant={variant}
          isLast={index === sorted.length - 1}
        />
      ))}
    </div>
  )
}
