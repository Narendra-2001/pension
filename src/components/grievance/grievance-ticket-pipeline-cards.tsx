import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  TrendingUp,
  UserCheck,
} from 'lucide-react'

import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { cn } from '@/lib/utils'
import type { GrievanceDashboardStats } from '@/types/grievance'

interface PipelineStep {
  key: keyof Pick<
    GrievanceDashboardStats,
    | 'openTickets'
    | 'assignedTickets'
    | 'inProgressTickets'
    | 'escalatedTickets'
    | 'resolvedTickets'
    | 'closedTickets'
  >
  label: string
  shortLabel: string
  hint: string
  icon: LucideIcon
  accent: string
  iconBg: string
  iconColor: string
  barColor: string
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    key: 'openTickets',
    label: 'Open Tickets',
    shortLabel: 'Open',
    hint: 'Awaiting assignment',
    icon: MessageSquare,
    accent: 'bg-sky-500',
    iconBg: 'bg-sky-100 dark:bg-sky-950/50',
    iconColor: 'text-sky-600 dark:text-sky-400',
    barColor: 'bg-sky-500',
  },
  {
    key: 'assignedTickets',
    label: 'Assigned',
    shortLabel: 'Assigned',
    hint: 'Assigned to officers',
    icon: UserCheck,
    accent: 'bg-blue-500',
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    barColor: 'bg-blue-500',
  },
  {
    key: 'inProgressTickets',
    label: 'In Progress',
    shortLabel: 'Active',
    hint: 'Under investigation',
    icon: TrendingUp,
    accent: 'bg-violet-500',
    iconBg: 'bg-violet-100 dark:bg-violet-950/50',
    iconColor: 'text-violet-600 dark:text-violet-400',
    barColor: 'bg-violet-500',
  },
  {
    key: 'escalatedTickets',
    label: 'Escalated',
    shortLabel: 'Escalated',
    hint: 'SLA breached or escalated',
    icon: AlertTriangle,
    accent: 'bg-red-500',
    iconBg: 'bg-red-100 dark:bg-red-950/50',
    iconColor: 'text-red-600 dark:text-red-400',
    barColor: 'bg-red-500',
  },
  {
    key: 'resolvedTickets',
    label: 'Resolved',
    shortLabel: 'Resolved',
    hint: 'Awaiting pensioner confirmation',
    icon: CheckCircle2,
    accent: 'bg-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    barColor: 'bg-emerald-500',
  },
  {
    key: 'closedTickets',
    label: 'Closed',
    shortLabel: 'Closed',
    hint: 'Successfully closed',
    icon: CheckCircle2,
    accent: 'bg-slate-400',
    iconBg: 'bg-slate-100 dark:bg-slate-800/50',
    iconColor: 'text-slate-600 dark:text-slate-400',
    barColor: 'bg-slate-400',
  },
]

interface GrievanceTicketPipelineCardsProps {
  stats: GrievanceDashboardStats
  className?: string
}

export function GrievanceTicketPipelineCards({ stats, className }: GrievanceTicketPipelineCardsProps) {
  const total = Math.max(stats.totalTickets, 1)
  const activeCount =
    stats.openTickets +
    stats.assignedTickets +
    stats.inProgressTickets +
    stats.escalatedTickets

  return (
    <motion.div
      variants={adminStaggerItem}
      initial="hidden"
      animate="show"
      className={cn(
        'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/20 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Ticket pipeline</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {stats.totalTickets} total · {activeCount} active · {stats.closedTickets + stats.resolvedTickets} completed
          </p>
        </div>

        <div className="hidden items-center gap-0.5 xl:flex">
          {PIPELINE_STEPS.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {step.shortLabel}
              </span>
              {index < PIPELINE_STEPS.length - 1 && (
                <ChevronRight className="mx-0.5 size-3 shrink-0 text-muted-foreground/40" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-border/50 sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {PIPELINE_STEPS.map((step, index) => {
          const value = stats[step.key]
          const share = Math.round((value / total) * 100)
          const Icon = step.icon

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex min-h-[8.5rem] flex-col p-4 transition-colors hover:bg-muted/25 sm:min-h-[9rem] lg:min-h-[10rem] lg:p-4 xl:p-5"
            >
              <div className={cn('absolute inset-x-0 top-0 h-0.5', step.accent)} aria-hidden />

              <div className="flex items-start justify-between gap-2">
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                    step.iconBg,
                  )}
                >
                  <Icon className={cn('size-4', step.iconColor)} strokeWidth={1.75} />
                </div>
                {value > 0 && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                    {share}%
                  </span>
                )}
              </div>

              <p className="mt-3 text-[1.625rem] font-bold tabular-nums leading-none text-foreground">
                {value}
              </p>
              <p className="mt-1.5 text-xs font-medium text-foreground">{step.label}</p>

              <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-muted/80">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', step.barColor)}
                  style={{ width: `${share}%` }}
                />
              </div>

              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{step.hint}</p>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
