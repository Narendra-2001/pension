import { format } from 'date-fns'
import { ArrowRight, User } from 'lucide-react'

import { AuditModuleBadge } from '@/components/audit/audit-module-badge'
import { AUDIT_ACTION_LABELS, formatAuditChange } from '@/lib/audit'
import { AUDIT_ACTION_ICONS, getAuditActionToneClasses } from '@/lib/audit-ui'
import type { SystemAuditEntry } from '@/types/audit'
import { cn } from '@/lib/utils'

interface AuditLogTimelineProps {
  entries: SystemAuditEntry[]
  onSelect?: (entry: SystemAuditEntry) => void
  compact?: boolean
}

export function AuditLogTimeline({ entries, onSelect, compact }: AuditLogTimelineProps) {
  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
        <p className="text-sm font-medium text-foreground">No audit entries found</p>
        <p className="mt-1 text-xs text-muted-foreground">Activity will appear here as events are recorded</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const hasChange = entry.oldValue || entry.newValue
        const ActionIcon = AUDIT_ACTION_ICONS[entry.action]
        const toneClasses = getAuditActionToneClasses(entry.action)

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect?.(entry)}
            disabled={!onSelect}
            className={cn(
              'group relative flex w-full gap-4 rounded-xl border border-border/60 bg-card p-4 text-left transition-all',
              onSelect && 'cursor-pointer hover:border-border hover:shadow-sm',
              !onSelect && 'cursor-default',
              compact && 'p-3',
            )}
          >
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                toneClasses,
                compact && 'size-8 rounded-md',
              )}
            >
              <ActionIcon className={cn('size-4', compact && 'size-3.5')} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{AUDIT_ACTION_LABELS[entry.action]}</p>
                <AuditModuleBadge module={entry.module} />
              </div>

              {entry.entityLabel && (
                <p className="mt-1 text-sm text-foreground">{entry.entityLabel}</p>
              )}

              {hasChange && !compact && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  {entry.oldValue && (
                    <span className="rounded-md bg-red-50 px-2 py-1 font-medium text-red-700 line-through dark:bg-red-950/30 dark:text-red-400">
                      {entry.oldValue}
                    </span>
                  )}
                  {entry.oldValue && entry.newValue && (
                    <ArrowRight className="size-3.5 text-muted-foreground" />
                  )}
                  {entry.newValue && (
                    <span className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      {entry.newValue}
                    </span>
                  )}
                </div>
              )}

              {hasChange && compact && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatAuditChange(entry.oldValue, entry.newValue)}
                </p>
              )}

              {entry.remarks && !compact && (
                <p className="mt-2 rounded-md bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
                  {entry.remarks}
                </p>
              )}

              <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <User className="size-3" />
                  {entry.user}
                  {entry.userRole && (
                    <span className="text-muted-foreground/70">· {entry.userRole}</span>
                  )}
                </span>
                <span aria-hidden>·</span>
                <time dateTime={entry.timestamp}>
                  {format(new Date(entry.timestamp), 'dd MMM yyyy, hh:mm a')}
                </time>
                {entry.entityId && !compact && (
                  <>
                    <span aria-hidden>·</span>
                    <span className="font-mono text-[10px]">{entry.entityId}</span>
                  </>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
