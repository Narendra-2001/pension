import { format, parseISO } from 'date-fns'
import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  IndianRupee,
  Settings2,
  XCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { RecoveryTimelineEvent } from '@/types/recovery'

const ICONS: Record<string, typeof Clock> = {
  draft: FileText,
  pending_approval: Clock,
  approved: CheckCircle2,
  active_recovery: IndianRupee,
  recovery_completed: CheckCircle2,
  closed: FileText,
  cancelled: XCircle,
  payment: CreditCard,
  installment: Settings2,
}

const TONES: Record<string, string> = {
  draft: 'bg-slate-500/10 text-slate-600',
  pending_approval: 'bg-amber-500/10 text-amber-600',
  approved: 'bg-blue-500/10 text-blue-600',
  active_recovery: 'bg-sky-500/10 text-sky-600',
  recovery_completed: 'bg-emerald-500/10 text-emerald-600',
  closed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-500/10 text-red-600',
  payment: 'bg-emerald-500/10 text-emerald-600',
  installment: 'bg-violet-500/10 text-violet-600',
}

interface RecoveryTimelineProps {
  events: RecoveryTimelineEvent[]
  className?: string
}

export function RecoveryTimeline({ events, className }: RecoveryTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {events.map((event, i) => {
        const Icon = ICONS[event.status] ?? Clock
        return (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < events.length - 1 && (
              <div className="absolute left-[19px] top-10 h-[calc(100%-1rem)] w-px bg-border" />
            )}
            <div
              className={cn(
                'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full',
                TONES[event.status] ?? 'bg-muted',
              )}
            >
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm font-semibold">{event.title}</p>
              {event.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {event.actor && <span>{event.actor}</span>}
                <span>{format(parseISO(event.timestamp), 'dd MMM yyyy, hh:mm a')}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
