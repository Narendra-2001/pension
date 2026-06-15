import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface StatusPillProps {
  label: string
  variant?: StatusVariant
  className?: string
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300',
  info: 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  neutral: 'bg-muted text-muted-foreground ring-border',
}

export function StatusPill({ label, variant = 'neutral', className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        variantStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  )
}

export function getVerificationStatusVariant(status: string): StatusVariant {
  if (status === 'approved' || status === 'paid' || status === 'Active') return 'success'
  if (status === 'pending' || status === 'in_progress' || status === 'submitted') return 'warning'
  if (status === 'rejected' || status === 'failed' || status === 'overdue') return 'danger'
  return 'neutral'
}
