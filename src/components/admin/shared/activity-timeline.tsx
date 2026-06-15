import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  UserCheck,
} from 'lucide-react'

import type { RecentActivity } from '@/types/pensioner'
import { cn } from '@/lib/utils'

const ICONS = {
  new_pensioner: Plus,
  pending_activation: UserCheck,
  verification_request: CheckCircle2,
  suspension_request: AlertTriangle,
}

const ACTIVITY_ICON_STYLES: Record<
  keyof typeof ICONS,
  { bg: string; icon: string }
> = {
  new_pensioner: {
    bg: 'bg-sky-100 dark:bg-sky-950/60',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  pending_activation: {
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  verification_request: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  suspension_request: {
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    icon: 'text-rose-600 dark:text-rose-400',
  },
}

interface ActivityTimelineProps {
  activities: RecentActivity[]
  className?: string
  compact?: boolean
}

export function ActivityTimeline({ activities, className, compact = false }: ActivityTimelineProps) {
  if (compact) {
    return (
      <div className={cn('divide-y divide-border/40', className)}>
        {activities.map((item) => {
          const Icon = ICONS[item.type]
          const styles = ACTIVITY_ICON_STYLES[item.type]
          return (
            <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full',
                  styles.bg,
                )}
              >
                <Icon className={cn('size-3.5', styles.icon)} strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-0', className)}>
      {activities.map((item, i) => {
        const Icon = ICONS[item.type]
        const styles = ACTIVITY_ICON_STYLES[item.type]
        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < activities.length - 1 && (
              <div className="absolute left-[19px] top-10 h-[calc(100%-1rem)] w-px bg-border" />
            )}
            <div
              className={cn(
                'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full',
                styles.bg,
              )}
            >
              <Icon className={cn('size-4', styles.icon)} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
