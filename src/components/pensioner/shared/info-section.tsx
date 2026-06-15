import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Lock } from 'lucide-react'

import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface InfoRow {
  label: string
  value: ReactNode
}

type InfoSectionTone = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'teal' | 'slate'

const SECTION_TONES: Record<
  InfoSectionTone,
  { icon: string; header: string; row: string }
> = {
  blue: {
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    header: 'from-sky-500/5 via-transparent to-transparent',
    row: 'hover:border-sky-200/60 hover:bg-sky-50/40 dark:hover:border-sky-900/40 dark:hover:bg-sky-950/20',
  },
  green: {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    header: 'from-emerald-500/5 via-transparent to-transparent',
    row: 'hover:border-emerald-200/60 hover:bg-emerald-50/40 dark:hover:border-emerald-900/40 dark:hover:bg-emerald-950/20',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    header: 'from-amber-500/5 via-transparent to-transparent',
    row: 'hover:border-amber-200/60 hover:bg-amber-50/40 dark:hover:border-amber-900/40 dark:hover:bg-amber-950/20',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
    header: 'from-violet-500/5 via-transparent to-transparent',
    row: 'hover:border-violet-200/60 hover:bg-violet-50/40 dark:hover:border-violet-900/40 dark:hover:bg-violet-950/20',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    header: 'from-rose-500/5 via-transparent to-transparent',
    row: 'hover:border-rose-200/60 hover:bg-rose-50/40 dark:hover:border-rose-900/40 dark:hover:bg-rose-950/20',
  },
  teal: {
    icon: 'bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
    header: 'from-teal-500/5 via-transparent to-transparent',
    row: 'hover:border-teal-200/60 hover:bg-teal-50/40 dark:hover:border-teal-900/40 dark:hover:bg-teal-950/20',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
    header: 'from-slate-500/5 via-transparent to-transparent',
    row: 'hover:border-border hover:bg-muted/40',
  },
}

interface InfoSectionProps {
  title: string
  rows: InfoRow[]
  className?: string
  action?: ReactNode
  icon?: LucideIcon
  tone?: InfoSectionTone
  delay?: number
  animated?: boolean
  locked?: boolean
}

export function InfoSection({
  title,
  rows,
  className,
  action,
  icon: Icon,
  tone = 'slate',
  delay = 0,
  animated = false,
  locked = false,
}: InfoSectionProps) {
  const styles = SECTION_TONES[tone]

  const content = (
    <Card
      className={cn(
        'admin-card group overflow-hidden border-border/60 py-0 transition-shadow duration-300 hover:shadow-md',
        animated && 'hover:-translate-y-0.5',
        className,
      )}
    >
      <CardHeader
        className={cn(
          'relative flex flex-row items-center justify-between border-b border-border/40 bg-muted/15 px-5 py-4',
          Icon && `bg-gradient-to-r ${styles.header}`,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
                styles.icon,
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
            {locked && (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <Lock className="size-3" />
                Read-only — request update to change
              </p>
            )}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent className="grid gap-3 px-5 py-4 sm:grid-cols-2">
        {rows.map((row, index) => (
          <motion.div
            key={row.label}
            initial={animated ? { opacity: 0, y: 8 } : false}
            animate={animated ? { opacity: 1, y: 0 } : false}
            transition={
              animated
                ? { delay: delay + 0.04 + index * 0.03, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                : undefined
            }
            className={cn(
              'rounded-xl bg-muted/25 px-3.5 py-3 ring-1 ring-border/40 transition-all duration-200',
              animated && styles.row,
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {row.label}
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-foreground">{row.value}</p>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )

  if (!animated) return content

  return (
    <motion.div
      variants={adminStaggerItem}
      initial="hidden"
      animate="show"
      transition={{ delay }}
    >
      {content}
    </motion.div>
  )
}
