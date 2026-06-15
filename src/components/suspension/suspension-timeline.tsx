import { format, parseISO } from 'date-fns'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSearch,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { SuspensionTimelineEvent } from '@/types/suspension'

const ICONS: Record<string, typeof Clock> = {
  reminder: Clock,
  suspended: ShieldAlert,
  restoration_pending: RotateCcw,
  restored: CheckCircle2,
  rejected: XCircle,
  submitted: Clock,
  under_review: FileSearch,
  approved: CheckCircle2,
  alert: AlertTriangle,
}

const TONES: Record<string, string> = {
  reminder: 'bg-amber-500/10 text-amber-600',
  suspended: 'bg-red-500/10 text-red-600',
  restoration_pending: 'bg-blue-500/10 text-blue-600',
  restored: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
  submitted: 'bg-muted text-muted-foreground',
  under_review: 'bg-violet-500/10 text-violet-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  alert: 'bg-amber-500/10 text-amber-600',
}

interface SuspensionTimelineProps {
  events: SuspensionTimelineEvent[]
  className?: string
}

export function SuspensionTimeline({ events, className }: SuspensionTimelineProps) {
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
