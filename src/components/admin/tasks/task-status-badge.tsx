import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TaskStatusBadgeProps {
  label: string
  isPending?: boolean
}

export function TaskStatusBadge({ label, isPending = true }: TaskStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium whitespace-nowrap',
        isPending
          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400'
          : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400',
      )}
    >
      {label}
    </Badge>
  )
}
