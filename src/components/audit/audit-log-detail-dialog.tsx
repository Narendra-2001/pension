import { format } from 'date-fns'
import { ArrowRight, Clock, Fingerprint, Hash } from 'lucide-react'

import { AuditModuleBadge } from '@/components/audit/audit-module-badge'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { AUDIT_ACTION_LABELS } from '@/lib/audit'
import { AUDIT_ACTION_ICONS, getAuditActionToneClasses } from '@/lib/audit-ui'
import type { SystemAuditEntry } from '@/types/audit'

interface AuditLogDetailDialogProps {
  entry: SystemAuditEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogDetailDialog({ entry, open, onOpenChange }: AuditLogDetailDialogProps) {
  if (!entry) return null

  const ActionIcon = AUDIT_ACTION_ICONS[entry.action]
  const toneClasses = getAuditActionToneClasses(entry.action)
  const hasChange = entry.oldValue || entry.newValue

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 overflow-hidden rounded-2xl p-0">
        <div className="border-b bg-muted/30 px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className={cnIconBox(toneClasses)}>
                <ActionIcon className="size-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-semibold">
                  {AUDIT_ACTION_LABELS[entry.action]}
                </DialogTitle>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {entry.entityLabel ?? entry.entityType}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AuditModuleBadge module={entry.module} />
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {entry.id}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-5">
          {hasChange && (
            <section>
              <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Value change
              </h4>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-muted/20 p-3">
                {entry.oldValue ? (
                  <span className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 line-through dark:bg-red-950/30 dark:text-red-400">
                    {entry.oldValue}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                {entry.newValue ? (
                  <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    {entry.newValue}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </section>
          )}

          <section>
            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Entity details
            </h4>
            <dl className="grid gap-2.5 text-sm">
              <DetailRow label="Entity ID" value={entry.entityId} mono icon={Hash} />
              <DetailRow label="Entity type" value={entry.entityType} />
            </dl>
          </section>

          <Separator />

          <section>
            <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Fingerprint className="size-3.5" />
              Actor
            </h4>
            <dl className="grid gap-2.5 text-sm">
              <DetailRow label="User" value={entry.user} />
              <DetailRow label="Role" value={entry.userRole} />
              {entry.department && <DetailRow label="Department" value={entry.department} />}
              {entry.ipAddress && <DetailRow label="IP address" value={entry.ipAddress} mono />}
            </dl>
          </section>

          <Separator />

          <section>
            <h4 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3.5" />
              Timestamp
            </h4>
            <p className="text-sm font-medium">
              {format(new Date(entry.timestamp), 'EEEE, dd MMMM yyyy')}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(entry.timestamp), 'hh:mm:ss a')}
            </p>
          </section>

          {entry.remarks && (
            <>
              <Separator />
              <section>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Remarks
                </h4>
                <p className="rounded-lg bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                  {entry.remarks}
                </p>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function cnIconBox(toneClasses: string) {
  return `flex size-11 shrink-0 items-center justify-center rounded-xl ${toneClasses}`
}

function DetailRow({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string
  value: string
  mono?: boolean
  icon?: typeof Hash
}) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-baseline gap-2">
      <dt className="flex items-center gap-1 text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </dt>
      <dd className={mono ? 'font-mono text-xs break-all' : 'font-medium'}>{value}</dd>
    </div>
  )
}
