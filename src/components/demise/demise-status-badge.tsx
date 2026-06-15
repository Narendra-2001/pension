import { Badge } from '@/components/ui/badge'
import { DEMISE_STATUS_LABELS } from '@/lib/demise'
import { cn } from '@/lib/utils'
import type { DemiseIntimationStatus } from '@/types/demise'

const STATUS_STYLES: Record<DemiseIntimationStatus, string> = {
  draft: 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300',
  submitted: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  under_verification: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  needs_clarification: 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  approved: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  rejected: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300',
  reversed: 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
}

interface DemiseStatusBadgeProps {
  status: DemiseIntimationStatus
  className?: string
}

export function DemiseStatusBadge({ status, className }: DemiseStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium', STATUS_STYLES[status], className)}>
      {DEMISE_STATUS_LABELS[status]}
    </Badge>
  )
}
