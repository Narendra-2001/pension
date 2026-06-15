import { format, parseISO } from 'date-fns'
import { Lock, MessageSquare } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { GrievanceComment } from '@/types/grievance'

interface GrievanceCommentThreadProps {
  comments: GrievanceComment[]
  showInternal?: boolean
  className?: string
  variant?: 'default' | 'chat'
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function GrievanceCommentThread({
  comments,
  showInternal = false,
  className,
  variant = 'default',
}: GrievanceCommentThreadProps) {
  const visible = showInternal ? comments : comments.filter((c) => !c.isInternal)
  const sorted = [...visible].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        <MessageSquare className="size-8 text-muted-foreground/60" />
        <p className="font-medium text-foreground">No comments yet</p>
        <p className="max-w-xs text-xs">Updates from you or the support team will appear here.</p>
      </div>
    )
  }

  if (variant === 'chat') {
    return (
      <div className={cn('space-y-4', className)}>
        {sorted.map((comment) => {
          const isPensioner = comment.authorRole.toLowerCase().includes('pensioner')
          return (
            <div
              key={comment.id}
              className={cn('flex gap-3', isPensioner ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  isPensioner
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {getInitials(comment.author)}
              </div>
              <div className={cn('min-w-0 max-w-[85%] space-y-1', isPensioner ? 'items-end text-right' : '')}>
                <div className={cn('flex flex-wrap items-center gap-2', isPensioner && 'justify-end')}>
                  <span className="text-xs font-semibold text-foreground">{comment.author}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(parseISO(comment.timestamp), 'dd MMM, h:mm a')}
                  </span>
                </div>
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    comment.isInternal
                      ? 'border border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100'
                      : isPensioner
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border/60 bg-card text-foreground',
                  )}
                >
                  {comment.message}
                </div>
                {comment.isInternal && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300">
                    <Lock className="size-2.5" /> Internal note
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {sorted.map((comment) => (
        <div
          key={comment.id}
          className={cn(
            'rounded-xl border p-4',
            comment.isInternal
              ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
              : 'bg-card',
          )}
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{comment.author}</span>
            <span className="text-xs text-muted-foreground">{comment.authorRole}</span>
            {comment.isInternal && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <Lock className="size-2.5" /> Internal
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {format(parseISO(comment.timestamp), 'dd MMM yyyy, hh:mm a')}
            </span>
          </div>
          <p className="text-sm leading-relaxed">{comment.message}</p>
        </div>
      ))}
    </div>
  )
}
