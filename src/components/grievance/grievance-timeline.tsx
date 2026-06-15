import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  RefreshCw,
  Send,
  UserCheck,
  XCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type { GrievanceTimelineEvent } from '@/types/grievance'

const ICONS: Record<string, typeof Clock> = {
  ticket_created: FileText,
  comment_added: MessageSquare,
  document_uploaded: FileText,
  status_changed: RefreshCw,
  resolution_added: CheckCircle2,
  escalation: AlertTriangle,
  ticket_assigned: UserCheck,
  ticket_closed: CheckCircle2,
  resolution_accepted: CheckCircle2,
  resolution_rejected: XCircle,
}

const TONES: Record<string, { dot: string; icon: string }> = {
  ticket_created: {
    dot: 'bg-sky-500 ring-sky-500/20',
    icon: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  },
  comment_added: {
    dot: 'bg-violet-500 ring-violet-500/20',
    icon: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  },
  document_uploaded: {
    dot: 'bg-blue-500 ring-blue-500/20',
    icon: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  },
  status_changed: {
    dot: 'bg-amber-500 ring-amber-500/20',
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
  resolution_added: {
    dot: 'bg-emerald-500 ring-emerald-500/20',
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  escalation: {
    dot: 'bg-red-500 ring-red-500/20',
    icon: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300',
  },
  ticket_assigned: {
    dot: 'bg-indigo-500 ring-indigo-500/20',
    icon: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
  },
  ticket_closed: {
    dot: 'bg-slate-500 ring-slate-500/20',
    icon: 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300',
  },
  resolution_accepted: {
    dot: 'bg-emerald-500 ring-emerald-500/20',
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  resolution_rejected: {
    dot: 'bg-orange-500 ring-orange-500/20',
    icon: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  },
}

interface GrievanceTimelineProps {
  events: GrievanceTimelineEvent[]
  className?: string
  variant?: 'default' | 'rich'
  animated?: boolean
}

function TimelineEvent({
  event,
  isLast,
  variant,
  index,
  animated,
}: {
  event: GrievanceTimelineEvent
  isLast: boolean
  variant: 'default' | 'rich'
  index: number
  animated: boolean
}) {
  const Icon = ICONS[event.type] ?? Clock
  const tone = TONES[event.type] ?? { dot: 'bg-muted ring-muted/20', icon: 'bg-muted text-muted-foreground' }
  const isRich = variant === 'rich'

  const content = (
    <div className={cn('relative flex gap-3.5', !isLast && 'pb-5')}>
      {!isLast && (
        <div
          className={cn(
            'absolute top-9 w-px bg-border',
            isRich ? 'left-[17px] h-[calc(100%-8px)]' : 'left-[19px] h-[calc(100%-1rem)]',
          )}
        />
      )}

      <div
        className={cn(
          'relative z-10 flex shrink-0 items-center justify-center rounded-full ring-4 ring-background',
          isRich ? cn('size-9', tone.dot) : cn('size-10', TONES[event.type]?.icon ?? 'bg-muted'),
        )}
      >
        <Icon className={cn('size-3.5', isRich ? 'text-white' : '')} />
      </div>

      <div
        className={cn(
          'min-w-0 flex-1',
          isRich &&
            'rounded-xl border border-border/60 bg-card/80 px-3.5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]',
        )}
      >
        <p className="text-sm font-semibold text-foreground">{event.title}</p>
        {event.description && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {event.actor && <span className="font-medium text-foreground/80">{event.actor}</span>}
          {event.actor && <span aria-hidden>·</span>}
          <span>{format(parseISO(event.timestamp), 'dd MMM yyyy, h:mm a')}</span>
        </div>
      </div>
    </div>
  )

  if (!animated) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.div>
  )
}

export function GrievanceTimeline({
  events,
  className,
  variant = 'default',
  animated = false,
}: GrievanceTimelineProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
        <Send className="size-4" />
        No timeline events yet
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {sorted.map((event, index) => (
        <TimelineEvent
          key={event.id}
          event={event}
          isLast={index === sorted.length - 1}
          variant={variant}
          index={index}
          animated={animated}
        />
      ))}
    </div>
  )
}
