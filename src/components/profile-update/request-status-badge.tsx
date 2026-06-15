import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ProfileUpdateRequestStatus } from '@/types/profile-update-request'

const statusConfig: Record<
  ProfileUpdateRequestStatus,
  { label: string; className: string }
> = {
  pending_review: {
    label: 'Pending Review',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  },
  under_verification: {
    label: 'Under Verification',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  },
  more_info_required: {
    label: 'More Information Required',
    className: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  },
}

export function ProfileUpdateStatusBadge({ status }: { status: ProfileUpdateRequestStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn('font-medium whitespace-nowrap', config.className)}>
      {config.label}
    </Badge>
  )
}
