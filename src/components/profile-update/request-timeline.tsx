import { format, parseISO } from 'date-fns'
import { CheckCircle2, Clock, FileSearch, Info, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { ProfileUpdateTimelineEvent } from '@/types/profile-update-request'

const ICONS: Record<string, typeof Clock> = {
  submitted: Clock,
  pending_review: Clock,
  under_verification: FileSearch,
  document_verified: FileSearch,
  approved: CheckCircle2,
  rejected: XCircle,
  more_info_required: Info,
}

const TONES: Record<string, string> = {
  submitted: 'bg-muted text-muted-foreground',
  pending_review: 'bg-amber-500/10 text-amber-600',
  under_verification: 'bg-blue-500/10 text-blue-600',
  document_verified: 'bg-blue-500/10 text-blue-600',
  approved: 'bg-emerald-500/10 text-emerald-600',
  rejected: 'bg-red-500/10 text-red-600',
  more_info_required: 'bg-violet-500/10 text-violet-600',
}

interface RequestTimelineProps {
  events: ProfileUpdateTimelineEvent[]
  className?: string
}

export function RequestTimeline({ events, className }: RequestTimelineProps) {
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
