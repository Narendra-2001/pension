import { Badge } from '@/components/ui/badge'
import { GRIEVANCE_PRIORITY_LABELS } from '@/lib/grievance'
import { cn } from '@/lib/utils'
import type { GrievancePriority } from '@/types/grievance'

const PRIORITY_STYLES: Record<GrievancePriority, string> = {
  low: 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300',
  medium: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  high: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  critical: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300',
}

interface GrievancePriorityBadgeProps {
  priority: GrievancePriority
  className?: string
}

export function GrievancePriorityBadge({ priority, className }: GrievancePriorityBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium', PRIORITY_STYLES[priority], className)}>
      {GRIEVANCE_PRIORITY_LABELS[priority]}
    </Badge>
  )
}
