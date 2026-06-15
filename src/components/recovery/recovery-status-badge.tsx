import { Badge } from '@/components/ui/badge'
import { RECOVERY_STATUS_LABELS } from '@/lib/recovery'
import { cn } from '@/lib/utils'
import type { RecoveryCaseStatus } from '@/types/recovery'

const STATUS_STYLES: Record<RecoveryCaseStatus, string> = {
  draft: 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300',
  pending_approval: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  approved: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  active_recovery: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  recovery_completed: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  closed: 'border-slate-300 bg-muted text-muted-foreground',
  cancelled: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300',
}

interface RecoveryStatusBadgeProps {
  status: RecoveryCaseStatus
  className?: string
}

export function RecoveryStatusBadge({ status, className }: RecoveryStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium', STATUS_STYLES[status], className)}>
      {RECOVERY_STATUS_LABELS[status]}
    </Badge>
  )
}
