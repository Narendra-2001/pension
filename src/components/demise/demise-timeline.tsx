import { format, parseISO } from 'date-fns'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Heart,
  IndianRupee,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { DemiseTimelineEvent } from '@/types/demise'

const ICONS: Record<string, typeof Clock> = {
  submitted: Send,
  under_verification: Clock,
  needs_clarification: AlertCircle,
  approved: CheckCircle2,
  rejected: XCircle,
  reversed: RotateCcw,
  recovery: IndianRupee,
  family_pension: Heart,
  activated: CheckCircle2,
  draft: FileText,
}

const TONES: Record<string, string> = {
  submitted: 'bg-blue-500/10 text-blue-600',
  under_verification: 'bg-amber-500/10 text-amber-600',
  needs_clarification: 'bg-orange-500/10 text-orange-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
  reversed: 'bg-violet-500/10 text-violet-600',
  recovery: 'bg-rose-500/10 text-rose-600',
  family_pension: 'bg-pink-500/10 text-pink-600',
  activated: 'bg-emerald-500/10 text-emerald-600',
  draft: 'bg-slate-500/10 text-slate-600',
}

interface DemiseTimelineProps {
  events: DemiseTimelineEvent[]
  className?: string
}

export function DemiseTimeline({ events, className }: DemiseTimelineProps) {
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
