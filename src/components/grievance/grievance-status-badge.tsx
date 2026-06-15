import { Badge } from '@/components/ui/badge'
import { GRIEVANCE_STATUS_LABELS } from '@/lib/grievance'
import { cn } from '@/lib/utils'
import type { GrievanceTicketStatus } from '@/types/grievance'

const STATUS_STYLES: Record<GrievanceTicketStatus, string> = {
  open: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  assigned: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  in_progress: 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  waiting_for_user: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  resolved: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  closed: 'border-slate-300 bg-muted text-muted-foreground',
  escalated: 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/40 dark:text-red-300',
  reopened: 'border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
}

interface GrievanceStatusBadgeProps {
  status: GrievanceTicketStatus
  className?: string
}

export function GrievanceStatusBadge({ status, className }: GrievanceStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium', STATUS_STYLES[status], className)}>
      {GRIEVANCE_STATUS_LABELS[status]}
    </Badge>
  )
}
