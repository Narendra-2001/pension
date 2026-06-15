import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LifeCertificateReviewStatus } from '@/types/life-certificate-review'

const STATUS_STYLES: Record<LifeCertificateReviewStatus, string> = {
  submitted: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400',
  under_verification: 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-400',
  approved: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
  rejected: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
}

function formatStatus(status: LifeCertificateReviewStatus) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface LifeCertificateStatusBadgeProps {
  status: LifeCertificateReviewStatus
}

export function LifeCertificateStatusBadge({ status }: LifeCertificateStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium whitespace-nowrap', STATUS_STYLES[status])}>
      {formatStatus(status)}
    </Badge>
  )
}
