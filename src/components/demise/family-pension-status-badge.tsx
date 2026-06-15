import { Badge } from '@/components/ui/badge'
import { FAMILY_PENSION_STATUS_LABELS } from '@/lib/demise'
import { cn } from '@/lib/utils'
import type { FamilyPensionStatus } from '@/types/demise'

const STATUS_STYLES: Record<FamilyPensionStatus, string> = {
  draft: 'border-slate-300 bg-slate-50 text-slate-700',
  submitted: 'border-blue-300 bg-blue-50 text-blue-700',
  under_review: 'border-amber-300 bg-amber-50 text-amber-700',
  eligibility_check: 'border-orange-300 bg-orange-50 text-orange-700',
  approved: 'border-sky-300 bg-sky-50 text-sky-700',
  rejected: 'border-red-300 bg-red-50 text-red-700',
  activated: 'border-emerald-300 bg-emerald-50 text-emerald-700',
}

interface FamilyPensionStatusBadgeProps {
  status: FamilyPensionStatus
  className?: string
}

export function FamilyPensionStatusBadge({ status, className }: FamilyPensionStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium', STATUS_STYLES[status], className)}>
      {FAMILY_PENSION_STATUS_LABELS[status]}
    </Badge>
  )
}
