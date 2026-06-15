import { Badge } from '@/components/ui/badge'
import { INSTALLMENT_STATUS_LABELS } from '@/lib/recovery'
import { cn } from '@/lib/utils'
import type { InstallmentStatus } from '@/types/recovery'

const STATUS_STYLES: Record<InstallmentStatus, string> = {
  pending: 'border-slate-300 bg-slate-50 text-slate-600',
  paid: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  partially_paid: 'border-blue-300 bg-blue-50 text-blue-700',
  missed: 'border-red-300 bg-red-50 text-red-700',
  overdue: 'border-amber-300 bg-amber-50 text-amber-700',
  completed: 'border-emerald-300 bg-emerald-50 text-emerald-700',
}

interface InstallmentStatusBadgeProps {
  status: InstallmentStatus
  className?: string
}

export function InstallmentStatusBadge({ status, className }: InstallmentStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full text-xs font-medium', STATUS_STYLES[status], className)}>
      {INSTALLMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
