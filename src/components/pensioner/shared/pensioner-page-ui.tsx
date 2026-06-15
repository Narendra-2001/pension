import { motion, useSpring, useTransform, type Variants } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { cn } from '@/lib/utils'

export const pensionerPageVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

export const pensionerSlideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

export const pensionerScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

interface PensionerPageShellProps {
  children: ReactNode
  className?: string
}

export function PensionerPageShell({ children, className }: PensionerPageShellProps) {
  return (
    <motion.div
      className={cn('admin-dashboard-page', className)}
      variants={pensionerPageVariants}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

interface PensionerStatCardProps {
  label: string
  value: ReactNode
  icon: LucideIcon
  tone?: 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'teal'
  delay?: number
  className?: string
}

const STAT_TONES = {
  blue: {
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
  },
  green: {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
  },
  teal: {
    icon: 'bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
  },
} as const

export function PensionerStatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
  delay = 0,
  className,
}: PensionerStatCardProps) {
  const styles = STAT_TONES[tone]

  return (
    <motion.div
      variants={adminStaggerItem}
      transition={{ delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        'group rounded-2xl border border-border/60 bg-card p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:border-primary/20 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
            styles.icon,
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-bold text-foreground">{value}</p>
        </div>
      </div>
    </motion.div>
  )
}

interface AnimatedProgressProps {
  value: number
  label?: string
  hint?: string
  tone?: 'primary' | 'emerald' | 'amber' | 'rose'
  className?: string
}

const PROGRESS_TONES = {
  primary: 'bg-primary',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
} as const

export function AnimatedProgress({
  value,
  label,
  hint,
  tone = 'primary',
  className,
}: AnimatedProgressProps) {
  const spring = useSpring(0, { stiffness: 60, damping: 18 })
  const width = useTransform(spring, (v) => `${v}%`)

  useEffect(() => {
    spring.set(Math.min(100, Math.max(0, value)))
  }, [spring, value])

  return (
    <div className={className}>
      {(label || hint) && (
        <div className="mb-2.5 flex items-center justify-between gap-2">
          {label && <span className="text-sm font-medium">{label}</span>}
          {hint && (
            <motion.span
              key={value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm font-bold text-primary"
            >
              {hint}
            </motion.span>
          )}
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-muted/80">
        <motion.div
          className={cn('h-full rounded-full', PROGRESS_TONES[tone])}
          style={{ width }}
        />
      </div>
    </div>
  )
}

interface BreakdownRowProps {
  label: string
  value: string
  percent?: number
  negative?: boolean
  highlight?: boolean
  delay?: number
}

export function BreakdownRow({
  label,
  value,
  percent,
  negative = false,
  highlight = false,
  delay = 0,
}: BreakdownRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-xl px-3 py-2.5 transition-colors',
        highlight
          ? 'bg-emerald-50 ring-1 ring-emerald-200/60 dark:bg-emerald-950/30 dark:ring-emerald-800/40'
          : 'hover:bg-muted/40',
      )}
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className={cn('font-medium', highlight ? 'text-emerald-800 dark:text-emerald-200' : 'text-muted-foreground')}>
          {label}
        </span>
        <span
          className={cn(
            'shrink-0 font-semibold tabular-nums',
            negative && 'text-rose-600 dark:text-rose-400',
            highlight && 'text-lg font-bold text-emerald-700 dark:text-emerald-300',
          )}
        >
          {value}
        </span>
      </div>
      {percent !== undefined && percent > 0 && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/60">
          <motion.div
            className={cn('h-full rounded-full', negative ? 'bg-rose-400/70' : 'bg-primary/60')}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ delay: delay + 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
    </motion.div>
  )
}

interface HeroHighlightProps {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'emerald' | 'blue' | 'violet' | 'amber'
  className?: string
}

const HERO_TONES = {
  emerald: {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    value: 'text-emerald-700 dark:text-emerald-300',
  },
  blue: {
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    value: 'text-sky-700 dark:text-sky-300',
  },
  violet: {
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
    value: 'text-violet-700 dark:text-violet-300',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    value: 'text-amber-700 dark:text-amber-300',
  },
} as const

export function HeroHighlight({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'emerald',
  className,
}: HeroHighlightProps) {
  const styles = HERO_TONES[tone]

  return (
    <motion.div
      variants={pensionerScaleIn}
      className={cn(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)]',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn('flex size-12 shrink-0 items-center justify-center rounded-full', styles.icon)}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('mt-1 text-2xl font-bold tabular-nums sm:text-3xl', styles.value)}
          >
            {value}
          </motion.p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
    </motion.div>
  )
}

interface StepTransitionProps {
  stepKey: string | number
  children: ReactNode
  className?: string
}

export function StepTransition({ stepKey, children, className }: StepTransitionProps) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
