import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  HeartPulse,
  IndianRupee,
  Minus,
  PauseCircle,
  Plus,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { AdminHeroMetric, AdminSectionHeading, adminStaggerContainer, adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchMonthlyPaymentAccountSummary } from '@/data/admin-api'
import { formatCurrency } from '@/data/pensioner-mock-data'
import { CHANGE_META, formatAccountCount } from '@/lib/bulk-payment-comparison'
import { cn } from '@/lib/utils'
import type { MonthlyPaymentAccountChange, MonthlyPaymentChangeCategory } from '@/types/disbursement'

const CATEGORY_TONES: Record<MonthlyPaymentChangeCategory, string> = {
  new_pensioner: 'bg-sky-100 text-sky-600 ring-sky-200/80 dark:bg-sky-950/50 dark:text-sky-400 dark:ring-sky-800',
  family_pension: 'bg-violet-100 text-violet-600 ring-violet-200/80 dark:bg-violet-950/50 dark:text-violet-400 dark:ring-violet-800',
  reactivation: 'bg-teal-100 text-teal-600 ring-teal-200/80 dark:bg-teal-950/50 dark:text-teal-400 dark:ring-teal-800',
  deceased: 'bg-rose-100 text-rose-600 ring-rose-200/80 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-800',
  suspended: 'bg-amber-100 text-amber-600 ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-800',
  dr_revision: 'bg-blue-100 text-blue-600 ring-blue-200/80 dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-800',
  medical_allowance_revision: 'bg-emerald-100 text-emerald-600 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-800',
  correction: 'bg-slate-100 text-slate-600 ring-slate-200/80 dark:bg-slate-800/50 dark:text-slate-400 dark:ring-slate-700',
}

type SectionTone = 'added' | 'removed' | 'payout' | 'forecast'

const SECTION_TONE_STYLES: Record<
  SectionTone,
  {
    headerBg: string
    bodyBg: string
    accent: string
    border: string
    title: string
    desc: string
    iconWrap: string
    icon: string
    badge: string
    rowHover: string
  }
> = {
  added: {
    headerBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    bodyBg: 'bg-emerald-50/15 dark:bg-emerald-950/10',
    accent: 'bg-emerald-500',
    border: 'border-emerald-200/70 dark:border-emerald-800/50',
    title: 'text-emerald-900 dark:text-emerald-100',
    desc: 'text-emerald-700/75 dark:text-emerald-400/85',
    iconWrap: 'bg-emerald-100 ring-emerald-200/80 dark:bg-emerald-900/60 dark:ring-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    badge: 'border-emerald-200/80 bg-emerald-100/80 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    rowHover: 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20',
  },
  removed: {
    headerBg: 'bg-rose-50/70 dark:bg-rose-950/30',
    bodyBg: 'bg-rose-50/15 dark:bg-rose-950/10',
    accent: 'bg-rose-500',
    border: 'border-rose-200/70 dark:border-rose-800/50',
    title: 'text-rose-900 dark:text-rose-100',
    desc: 'text-rose-700/75 dark:text-rose-400/85',
    iconWrap: 'bg-rose-100 ring-rose-200/80 dark:bg-rose-900/60 dark:ring-rose-800',
    icon: 'text-rose-600 dark:text-rose-400',
    badge: 'border-rose-200/80 bg-rose-100/80 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300',
    rowHover: 'hover:bg-rose-50/50 dark:hover:bg-rose-950/20',
  },
  payout: {
    headerBg: 'bg-sky-50/70 dark:bg-sky-950/30',
    bodyBg: 'bg-sky-50/15 dark:bg-sky-950/10',
    accent: 'bg-sky-500',
    border: 'border-sky-200/70 dark:border-sky-800/50',
    title: 'text-sky-900 dark:text-sky-100',
    desc: 'text-sky-700/75 dark:text-sky-400/85',
    iconWrap: 'bg-sky-100 ring-sky-200/80 dark:bg-sky-900/60 dark:ring-sky-800',
    icon: 'text-sky-600 dark:text-sky-400',
    badge: 'border-sky-200/80 bg-sky-100/80 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
    rowHover: 'hover:bg-sky-50/50 dark:hover:bg-sky-950/20',
  },
  forecast: {
    headerBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    bodyBg: 'bg-amber-50/15 dark:bg-amber-950/10',
    accent: 'bg-amber-500',
    border: 'border-amber-200/70 dark:border-amber-800/50',
    title: 'text-amber-900 dark:text-amber-100',
    desc: 'text-amber-700/75 dark:text-amber-400/85',
    iconWrap: 'bg-amber-100 ring-amber-200/80 dark:bg-amber-900/60 dark:ring-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'border-amber-200/80 bg-amber-100/80 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    rowHover: 'hover:bg-amber-50/50 dark:hover:bg-amber-950/20',
  },
}

const SECTION_TONE_ICONS: Record<SectionTone, LucideIcon> = {
  added: Plus,
  removed: Minus,
  payout: IndianRupee,
  forecast: TrendingUp,
}

const FORECAST_STAT_STYLES = [
  {
    label: 'New pensioners',
    tone: 'bg-sky-50 border-sky-200/70 dark:bg-sky-950/30 dark:border-sky-800/50',
    labelClass: 'text-sky-700 dark:text-sky-400',
    valueClass: 'text-sky-900 dark:text-sky-100',
  },
  {
    label: 'Family pension',
    tone: 'bg-violet-50 border-violet-200/70 dark:bg-violet-950/30 dark:border-violet-800/50',
    labelClass: 'text-violet-700 dark:text-violet-400',
    valueClass: 'text-violet-900 dark:text-violet-100',
  },
  {
    label: 'Projected total',
    tone: 'bg-amber-50 border-amber-200/70 dark:bg-amber-950/30 dark:border-amber-800/50',
    labelClass: 'text-amber-700 dark:text-amber-400',
    valueClass: 'text-amber-900 dark:text-amber-100',
    emphasize: true,
  },
  {
    label: 'Est. payout increase',
    tone: 'bg-emerald-50 border-emerald-200/70 dark:bg-emerald-950/30 dark:border-emerald-800/50',
    labelClass: 'text-emerald-700 dark:text-emerald-400',
    valueClass: 'text-emerald-900 dark:text-emerald-100',
    currency: true,
  },
] as const

const CATEGORY_ICONS: Record<MonthlyPaymentChangeCategory, LucideIcon> = {
  new_pensioner: UserPlus,
  family_pension: HeartPulse,
  reactivation: RefreshCw,
  deceased: Minus,
  suspended: PauseCircle,
  dr_revision: TrendingUp,
  medical_allowance_revision: Stethoscope,
  correction: Plus,
}

function AnimatedCount({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(0, { stiffness: 80, damping: 24 })
  const display = useTransform(spring, (latest) => Math.round(latest).toLocaleString('en-IN'))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span className={className}>{display}</motion.span>
}

function DeltaValue({
  value,
  format = 'count',
  direction,
}: {
  value: number
  format?: 'count' | 'currency' | 'percent'
  direction?: 'up' | 'down' | 'neutral'
}) {
  const isUp = direction === 'up' || (direction === undefined && value > 0)
  const isDown = direction === 'down' || (direction === undefined && value < 0)
  const absValue = Math.abs(value)
  const formatted =
    format === 'currency'
      ? formatCurrency(absValue)
      : format === 'percent'
        ? `${absValue}%`
        : formatAccountCount(absValue)

  return (
    <span className="inline-flex items-center gap-1 tabular-nums">
      {isUp && <ArrowUpRight className="size-3.5 shrink-0 text-foreground/60" strokeWidth={2} />}
      {isDown && <ArrowDownRight className="size-3.5 shrink-0 text-foreground/60" strokeWidth={2} />}
      <span>
        {isUp && value !== 0 ? '+' : isDown ? '−' : ''}
        {formatted}
      </span>
    </span>
  )
}

function ReasonRow({ change, rowHover }: { change: MonthlyPaymentAccountChange; rowHover?: string }) {
  const Icon = CATEGORY_ICONS[change.category]
  const meta = CHANGE_META[change.category]
  const isAmountOnly = meta.direction === 'amount'

  return (
    <div className={cn('flex items-center gap-4 rounded-xl px-2 py-3.5 transition-colors first:pt-2 last:pb-2', rowHover)}>
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
          CATEGORY_TONES[change.category],
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{change.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{change.description}</p>
      </div>
      <div className="shrink-0 text-right">
        {isAmountOnly ? (
          <p className="text-sm font-semibold tabular-nums text-foreground">
            <DeltaValue value={change.payoutDelta ?? 0} format="currency" direction="up" />
          </p>
        ) : (
          <p className="text-sm font-semibold tabular-nums text-foreground">
            <DeltaValue
              value={change.accountDelta}
              direction={change.accountDelta > 0 ? 'up' : change.accountDelta < 0 ? 'down' : 'neutral'}
            />
          </p>
        )}
        {change.payoutDelta !== undefined && !isAmountOnly && (
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
            <DeltaValue
              value={change.payoutDelta}
              format="currency"
              direction={change.payoutDelta >= 0 ? 'up' : 'down'}
            />
          </p>
        )}
      </div>
    </div>
  )
}

function SectionHeader({
  tone,
  title,
  description,
  badge,
}: {
  tone: SectionTone
  title: string
  description: string
  badge?: ReactNode
}) {
  const styles = SECTION_TONE_STYLES[tone]
  const Icon = SECTION_TONE_ICONS[tone]

  return (
    <div className={cn('relative overflow-hidden border-b px-5 py-4', styles.headerBg, styles.border)}>
      <div className={cn('absolute inset-x-0 top-0 h-[3px]', styles.accent)} />
      <div className="flex flex-wrap items-start justify-between gap-3 pt-0.5">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
              styles.iconWrap,
            )}
          >
            <Icon className={cn('size-4', styles.icon)} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h3 className={cn('admin-section-title', styles.title)}>{title}</h3>
            <p className={cn('admin-section-desc', styles.desc)}>{description}</p>
          </div>
        </div>
        {badge}
      </div>
    </div>
  )
}

function ChangeSection({
  tone,
  title,
  description,
  changes,
}: {
  tone: SectionTone
  title: string
  description: string
  changes: MonthlyPaymentAccountChange[]
}) {
  if (changes.length === 0) return null

  const styles = SECTION_TONE_STYLES[tone]

  return (
    <motion.div variants={adminStaggerItem} className={cn('admin-card overflow-hidden border', styles.border)}>
      <SectionHeader tone={tone} title={title} description={description} />
      <div className={cn('divide-y divide-border/40 px-3 py-1', styles.bodyBg)}>
        {changes.map((change) => (
          <ReasonRow key={change.id} change={change} rowHover={styles.rowHover} />
        ))}
      </div>
    </motion.div>
  )
}

type FlowVariant = 'previous' | 'added' | 'removed' | 'current'

const FLOW_VARIANT_STYLES: Record<
  FlowVariant,
  {
    card: string
    accent: string
    label: string
    value: string
    sublabel: string
    iconWrap: string
    icon: string
    border: string
  }
> = {
  previous: {
    card: 'bg-slate-50 dark:bg-slate-900/50',
    accent: 'bg-slate-400',
    label: 'text-slate-600 dark:text-slate-400',
    value: 'text-slate-900 dark:text-slate-100',
    sublabel: 'text-slate-500 dark:text-slate-400',
    iconWrap: 'bg-slate-100 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700',
    icon: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-200/80 dark:border-slate-700/80',
  },
  added: {
    card: 'bg-emerald-50/90 dark:bg-emerald-950/35',
    accent: 'bg-emerald-500',
    label: 'text-emerald-700 dark:text-emerald-400',
    value: 'text-emerald-900 dark:text-emerald-100',
    sublabel: 'text-emerald-600/80 dark:text-emerald-400/80',
    iconWrap: 'bg-emerald-100 ring-emerald-200/80 dark:bg-emerald-900/60 dark:ring-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/80 dark:border-emerald-800/60',
  },
  removed: {
    card: 'bg-rose-50/90 dark:bg-rose-950/35',
    accent: 'bg-rose-500',
    label: 'text-rose-700 dark:text-rose-400',
    value: 'text-rose-900 dark:text-rose-100',
    sublabel: 'text-rose-600/80 dark:text-rose-400/80',
    iconWrap: 'bg-rose-100 ring-rose-200/80 dark:bg-rose-900/60 dark:ring-rose-800',
    icon: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200/80 dark:border-rose-800/60',
  },
  current: {
    card: 'bg-violet-50/90 dark:bg-violet-950/35',
    accent: 'bg-violet-600 dark:bg-violet-500',
    label: 'text-violet-700 dark:text-violet-400',
    value: 'text-violet-900 dark:text-violet-100',
    sublabel: 'text-violet-600/80 dark:text-violet-400/80',
    iconWrap: 'bg-violet-100 ring-violet-200/80 dark:bg-violet-900/60 dark:ring-violet-800',
    icon: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200/80 dark:border-violet-800/60',
  },
}

const FLOW_VARIANT_ICONS: Record<FlowVariant, LucideIcon> = {
  previous: Users,
  added: Plus,
  removed: Minus,
  current: Users,
}

function FlowOperator({ variant }: { variant: 'plus' | 'minus' | 'arrow' }) {
  const Icon = variant === 'plus' ? Plus : variant === 'minus' ? Minus : ArrowRight
  const styles =
    variant === 'plus'
      ? 'bg-emerald-100 text-emerald-600 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-800'
      : variant === 'minus'
        ? 'bg-rose-100 text-rose-600 ring-rose-200/80 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-800'
        : 'bg-violet-100 text-violet-600 ring-violet-200/80 dark:bg-violet-950/50 dark:text-violet-400 dark:ring-violet-800'

  return (
    <div className="flex shrink-0 items-center justify-center self-center px-0.5 sm:px-1">
      <div className={cn('flex size-7 items-center justify-center rounded-full ring-1 ring-inset', styles)}>
        <Icon className="size-3.5" strokeWidth={2.25} />
      </div>
    </div>
  )
}

function FlowStep({
  variant,
  label,
  value,
  sublabel,
}: {
  variant: FlowVariant
  label: string
  value: number
  sublabel?: string
}) {
  const styles = FLOW_VARIANT_STYLES[variant]
  const Icon = FLOW_VARIANT_ICONS[variant]

  return (
    <div
      className={cn(
        'relative min-w-[8rem] flex-1 overflow-hidden rounded-2xl border shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        styles.card,
        styles.border,
        variant === 'current' && 'shadow-[0_4px_14px_rgba(109,40,217,0.08)]',
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-[3px]', styles.accent)} />
      <div className="flex items-center gap-3 px-4 py-3.5 pt-4">
        <div
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
            styles.iconWrap,
          )}
        >
          <Icon className={cn('size-4', styles.icon)} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className={cn('text-[11px] font-semibold uppercase tracking-wide', styles.label)}>{label}</p>
          <p className={cn('mt-0.5 text-xl font-bold tabular-nums tracking-tight', styles.value)}>
            <AnimatedCount value={value} />
          </p>
          {sublabel && <p className={cn('mt-0.5 text-[11px] font-medium', styles.sublabel)}>{sublabel}</p>}
        </div>
      </div>
    </div>
  )
}

interface BulkPaymentMonthComparisonProps {
  paymentMonth: string
  showForecast?: boolean
  compact?: boolean
}

export function BulkPaymentMonthComparison({
  paymentMonth,
  showForecast = false,
  compact = false,
}: BulkPaymentMonthComparisonProps) {
  const [samplesOpen, setSamplesOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['bulk-payment-month-comparison', paymentMonth],
    queryFn: () => fetchMonthlyPaymentAccountSummary(paymentMonth),
    enabled: !!paymentMonth,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  const accountChanges = data.changes.filter((c) => CHANGE_META[c.category].direction !== 'amount')
  const amountChanges = data.changes.filter((c) => CHANGE_META[c.category].direction === 'amount')
  const addedChanges = accountChanges.filter((c) => c.accountDelta > 0)
  const removedChanges = accountChanges.filter((c) => c.accountDelta < 0)
  const totalAdded = addedChanges.reduce((sum, c) => sum + c.accountDelta, 0)
  const totalRemoved = Math.abs(removedChanges.reduce((sum, c) => sum + c.accountDelta, 0))
  const isIncrease = data.netAccountChange >= 0
  const payoutIsIncrease = data.netPayoutChange >= 0
  const forecastIsIncrease = data.forecast.projectedNetAccountChange >= 0

  return (
    <motion.div
      key={paymentMonth}
      variants={adminStaggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Key metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AdminHeroMetric
          label={`Accounts to pay — ${data.paymentMonth}`}
          value={<AnimatedCount value={data.currentMonthAccounts} />}
          hint={`${isIncrease ? '+' : '−'}${formatAccountCount(Math.abs(data.netAccountChange))} (${isIncrease ? '+' : '−'}${Math.abs(data.changePercent)}%) vs last month · ${
            isIncrease
              ? `${formatAccountCount(totalAdded)} added${totalRemoved > 0 ? `, ${formatAccountCount(totalRemoved)} removed` : ''}`
              : `${formatAccountCount(totalRemoved)} removed${totalAdded > 0 ? `, ${formatAccountCount(totalAdded)} added` : ''}`
          }`}
          icon={Users}
          iconTone="slate"
        />
        <AdminHeroMetric
          label={`Payout — ${data.paymentMonth}`}
          value={formatCurrency(data.currentMonthPayout)}
          hint={`${payoutIsIncrease ? '+' : '−'}${formatCurrency(Math.abs(data.netPayoutChange))} vs last month · ${formatAccountCount(data.currentMonthAccounts)} accounts`}
          icon={IndianRupee}
          iconTone="slate"
        />
        <AdminHeroMetric
          label={`Previous month — ${data.previousMonth}`}
          value={formatCurrency(data.previousMonthPayout)}
          hint={`${formatAccountCount(data.previousMonthAccounts)} accounts paid`}
          icon={CalendarDays}
          iconTone="slate"
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Month flow */}
      <motion.div variants={adminStaggerItem} className="admin-card overflow-hidden">
        <div className="border-b border-border/50 bg-muted/15 px-5 py-4">
          <AdminSectionHeading
            title="How we get to this number"
            description={`Rolling account count from ${data.previousMonth} to ${data.paymentMonth}`}
          />
        </div>
        <div className="bg-muted/10 p-4 sm:p-5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch">
            <FlowStep
              variant="previous"
              label={data.previousMonth}
              value={data.previousMonthAccounts}
              sublabel="Last month"
            />

            {totalAdded > 0 && (
              <>
                <FlowOperator variant="plus" />
                <FlowStep variant="added" label="Added" value={totalAdded} sublabel="New on roll" />
              </>
            )}

            {totalRemoved > 0 && (
              <>
                <FlowOperator variant="minus" />
                <FlowStep variant="removed" label="Removed" value={totalRemoved} sublabel="Off roll" />
              </>
            )}

            <FlowOperator variant="arrow" />
            <FlowStep
              variant="current"
              label={data.paymentMonth}
              value={data.currentMonthAccounts}
              sublabel="This month"
            />
          </div>
        </div>
      </motion.div>

      {!compact && (
        <div className="grid gap-5 lg:grid-cols-2">
          <ChangeSection
            tone="added"
            title="Accounts added"
            description={`${formatAccountCount(totalAdded)} new accounts on the payment roll`}
            changes={addedChanges}
          />
          <ChangeSection
            tone="removed"
            title="Accounts removed"
            description={`${formatAccountCount(totalRemoved)} accounts taken off the payment roll`}
            changes={removedChanges}
          />
        </div>
      )}

      {!compact && amountChanges.length > 0 && (
        <ChangeSection
          tone="payout"
          title="Payout changes"
          description="Same account count — monthly amount revised for existing pensioners"
          changes={amountChanges}
        />
      )}

      {showForecast && (
        <motion.div
          variants={adminStaggerItem}
          className={cn('admin-card overflow-hidden border', SECTION_TONE_STYLES.forecast.border)}
        >
          <SectionHeader
            tone="forecast"
            title={`Next month outlook — ${data.forecast.nextMonth}`}
            description="Based on pending activations and onboarding pipeline"
            badge={
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                  SECTION_TONE_STYLES.forecast.badge,
                )}
              >
                <DeltaValue
                  value={data.forecast.projectedNetAccountChange}
                  direction={forecastIsIncrease ? 'up' : 'down'}
                />
                <span className="opacity-75">accounts expected</span>
              </span>
            }
          />

          <div className={cn('space-y-4 px-5 py-4', SECTION_TONE_STYLES.forecast.bodyBg)}>
            <p className="text-sm leading-relaxed text-amber-900/70 dark:text-amber-200/70">
              {data.forecast.summary}
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FORECAST_STAT_STYLES.map((statStyle, index) => {
                const values = [
                  data.forecast.projectedNewPensioners,
                  data.forecast.projectedFamilyPension,
                  data.forecast.projectedAccountTotal,
                  data.forecast.projectedPayoutIncrease,
                ]
                const value = values[index] ?? 0

                return (
                  <div
                    key={statStyle.label}
                    className={cn('rounded-xl border px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]', statStyle.tone)}
                  >
                    <p className={cn('text-xs font-medium', statStyle.labelClass)}>{statStyle.label}</p>
                    <p className={cn('mt-1 text-lg font-semibold tabular-nums', statStyle.valueClass)}>
                      ~
                      {'currency' in statStyle && statStyle.currency
                        ? formatCurrency(value)
                        : formatAccountCount(value)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}

      {!compact && (
        <motion.div variants={adminStaggerItem} className="admin-card overflow-hidden">
          <Button
            type="button"
            variant="ghost"
            className="flex h-auto w-full items-center justify-between rounded-none px-5 py-4 hover:bg-muted/30"
            onClick={() => setSamplesOpen((open) => !open)}
          >
            <div className="text-left">
              <span className="text-sm font-medium text-foreground">Example pensioners affected</span>
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                Sample cases behind these changes
              </p>
            </div>
            <motion.span animate={{ rotate: samplesOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown className="size-4 text-muted-foreground" />
            </motion.span>
          </Button>
          <AnimatePresence initial={false}>
            {samplesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="divide-y divide-border/50 border-t border-border/50 px-5">
                  {data.samples.map((sample, index) => {
                    const Icon = CATEGORY_ICONS[sample.category]
                    return (
                      <motion.div
                        key={sample.ppoNumber}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                        className="flex items-center gap-4 py-3.5"
                      >
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/60">
                          <Icon className="size-4 text-foreground/70" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{sample.pensionerName}</p>
                          <p className="font-mono text-xs text-muted-foreground">{sample.ppoNumber}</p>
                        </div>
                        <p className="max-w-[42%] truncate text-right text-xs text-muted-foreground">
                          {sample.reason}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
