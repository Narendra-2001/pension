import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { RESTORATION_STATUS_LABELS } from '@/lib/suspension'
import type { RestorationRequestStatus } from '@/types/suspension'

const TONES: Record<RestorationRequestStatus, string> = {
  submitted: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  under_review: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
}

interface RestorationStatusBadgeProps {
  status: RestorationRequestStatus
  className?: string
}

export function RestorationStatusBadge({ status, className }: RestorationStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium', TONES[status], className)}>
      {RESTORATION_STATUS_LABELS[status]}
    </Badge>
  )
}
