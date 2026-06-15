import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SUSPENSION_SOURCE_LABELS, TRIGGER_TYPE_LABELS } from '@/lib/suspension'
import type { SuspensionSource, SuspensionTriggerType } from '@/types/suspension'

const TRIGGER_TONES: Record<SuspensionTriggerType, string> = {
  no_verification: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20',
  fraud: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  duplicate: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
  invalid_documents: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  deceased: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
  administrative_hold: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20',
  other: 'bg-muted text-muted-foreground border-border',
}

interface TriggerTypeBadgeProps {
  triggerType: SuspensionTriggerType
  className?: string
}

export function TriggerTypeBadge({ triggerType, className }: TriggerTypeBadgeProps) {
  return (
    <Badge variant="outline" className={cn('rounded-full font-medium', TRIGGER_TONES[triggerType], className)}>
      {TRIGGER_TYPE_LABELS[triggerType]}
    </Badge>
  )
}

interface SuspensionSourceBadgeProps {
  source: SuspensionSource
  className?: string
}

export function SuspensionSourceBadge({ source, className }: SuspensionSourceBadgeProps) {
  return (
    <Badge variant="secondary" className={cn('rounded-full text-xs', className)}>
      {SUSPENSION_SOURCE_LABELS[source]}
    </Badge>
  )
}
