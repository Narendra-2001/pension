import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SUSPENSION_STATUS_LABELS } from '@/lib/suspension'
import type { SuspensionCaseStatus } from '@/types/suspension'

const TONES: Record<SuspensionCaseStatus, string> = {
  suspended: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  restoration_pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  restored: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
}

interface SuspensionStatusBadgeProps {
  status: SuspensionCaseStatus
  className?: string
}

export function SuspensionStatusBadge({ status, className }: SuspensionStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium', TONES[status], className)}>
      {SUSPENSION_STATUS_LABELS[status]}
    </Badge>
  )
}
