import { cn } from '@/lib/utils'
import { NOTICE_STATUS_LABELS, noticeStatusTone } from '@/lib/communication'
import type { NoticeStatus } from '@/types/communication'

const toneClasses = {
  default: 'bg-muted text-muted-foreground',
  blue: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
}

export function NoticeStatusBadge({ status, className }: { status: NoticeStatus; className?: string }) {
  const tone = noticeStatusTone(status)
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {NOTICE_STATUS_LABELS[status]}
    </span>
  )
}
