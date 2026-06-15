import { Progress } from '@/components/ui/progress'
import { formatRecoveryCurrency } from '@/lib/recovery'
import { cn } from '@/lib/utils'

interface RecoveryProgressBarProps {
  recoveredAmount: number
  totalAmount: number
  className?: string
  showLabels?: boolean
}

export function RecoveryProgressBar({
  recoveredAmount,
  totalAmount,
  className,
  showLabels = true,
}: RecoveryProgressBarProps) {
  const percent = totalAmount > 0 ? Math.min(100, Math.round((recoveredAmount / totalAmount) * 100)) : 0
  const outstanding = Math.max(0, totalAmount - recoveredAmount)

  return (
    <div className={cn('space-y-2', className)}>
      {showLabels && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Recovery Progress</span>
          <span className="font-bold text-primary">{percent}%</span>
        </div>
      )}
      <Progress value={percent} className="h-2.5" />
      {showLabels && (
        <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
          <span>Recovered: <strong className="text-foreground">{formatRecoveryCurrency(recoveredAmount)}</strong></span>
          <span>Outstanding: <strong className="text-foreground">{formatRecoveryCurrency(outstanding)}</strong></span>
        </div>
      )}
    </div>
  )
}
