import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ActivationStatus, PensionerStatus, VerificationStatus } from '@/types/pensioner'

const statusConfig: Record<PensionerStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  pending_activation: { label: 'Pending Activation', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  suspended: { label: 'Suspended', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
  deceased: { label: 'Deceased', className: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20' },
  draft: { label: 'Draft', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
}

const verificationConfig: Record<VerificationStatus, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' },
}

const activationConfig: Record<ActivationStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  sms_sent: { label: 'SMS Sent', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' },
  email_sent: { label: 'Email Sent', className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' },
  activated: { label: 'Activated', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
}

export function StatusBadge({ status }: { status: PensionerStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={cn('font-medium capitalize', config.className)}>
      {config.label}
    </Badge>
  )
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  const config = verificationConfig[status]
  return (
    <Badge variant="outline" className={cn('font-medium capitalize', config.className)}>
      {config.label}
    </Badge>
  )
}

export function ActivationBadge({ status }: { status: ActivationStatus }) {
  const config = activationConfig[status]
  return (
    <Badge variant="outline" className={cn('font-medium capitalize', config.className)}>
      {config.label}
    </Badge>
  )
}

export function PensionTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant="secondary" className="font-normal capitalize">
      {type.replace(/_/g, ' ')}
    </Badge>
  )
}
