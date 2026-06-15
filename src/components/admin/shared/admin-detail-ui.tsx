import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Check, User } from 'lucide-react'
import type { ReactNode } from 'react'

import { adminStaggerContainer, adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPensionerAvatarSrc } from '@/lib/user-avatars'
import { cn } from '@/lib/utils'

export type DetailCardTone = 'blue' | 'green' | 'amber' | 'violet' | 'rose' | 'slate'

const DETAIL_CARD_TONES: Record<DetailCardTone, string> = {
  blue: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
  green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
}

interface PensionerAvatarProps {
  name: string
  ppo?: string
  gender?: 'male' | 'female' | 'other'
  className?: string
}

export function PensionerAvatar({ name, ppo, gender, className }: PensionerAvatarProps) {
  const src = getPensionerAvatarSrc(ppo, gender)
  const initial = name.trim().charAt(0).toUpperCase() || 'P'

  return (
    <Avatar className={cn('size-16 shrink-0 ring-2 ring-primary/15 sm:size-20', className)}>
      <AvatarImage src={src} alt={name} className="object-cover object-center" />
      <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initial}</AvatarFallback>
    </Avatar>
  )
}

interface AdminPageShellProps {
  children: ReactNode
  className?: string
}

export function AdminPageShell({ children, className }: AdminPageShellProps) {
  return (
    <motion.div
      variants={adminStaggerContainer}
      initial="hidden"
      animate="show"
      className={cn('space-y-6', className)}
    >
      {children}
    </motion.div>
  )
}

interface AdminDetailHeroProps {
  avatar?: ReactNode
  title: string
  subtitle?: string
  badges?: ReactNode
  actions?: ReactNode
  illustration?: ReactNode
  className?: string
}

export function AdminDetailHero({
  avatar,
  title,
  subtitle,
  badges,
  actions,
  illustration,
  className,
}: AdminDetailHeroProps) {
  return (
    <motion.div
      variants={adminStaggerItem}
      className={cn(
        'admin-detail-hero overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] sm:p-6',
        className,
      )}
    >
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          {avatar}
          <div className="min-w-0 flex-1">
            <h1 className="admin-page-title">{title}</h1>
            {subtitle && <p className="admin-page-desc font-mono text-sm">{subtitle}</p>}
            {badges && <div className="mt-3 flex flex-wrap gap-2">{badges}</div>}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
        )}
      </div>
      {illustration}
    </motion.div>
  )
}

interface AdminActionBarProps {
  children: ReactNode
  className?: string
}

export function AdminActionBar({ children, className }: AdminActionBarProps) {
  return (
    <motion.div
      variants={adminStaggerItem}
      className={cn(
        'flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-4',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

interface AdminDetailCardProps {
  title: string
  icon?: LucideIcon
  tone?: DetailCardTone
  children: ReactNode
  className?: string
  headerAction?: ReactNode
}

export function AdminDetailCard({
  title,
  icon: Icon,
  tone = 'blue',
  children,
  className,
  headerAction,
}: AdminDetailCardProps) {
  return (
    <motion.div variants={adminStaggerItem}>
      <Card className={cn('admin-card admin-detail-card h-full', className)}>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl',
                  DETAIL_CARD_TONES[tone],
                )}
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
            )}
            <CardTitle className="admin-card-title">{title}</CardTitle>
          </div>
          {headerAction}
        </CardHeader>
        <CardContent className="space-y-3">{children}</CardContent>
      </Card>
    </motion.div>
  )
}

interface AdminDetailRowProps {
  label: string
  value?: ReactNode
  highlight?: boolean
  mono?: boolean
}

export function AdminDetailRow({ label, value, highlight, mono }: AdminDetailRowProps) {
  return (
    <div className="admin-detail-row flex flex-col gap-0.5 border-b border-border/40 py-2.5 last:border-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm font-medium sm:text-right',
          mono && 'font-mono text-xs',
          highlight && 'text-destructive',
        )}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}

interface AdminDetailGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function AdminDetailGrid({ children, columns = 2, className }: AdminDetailGridProps) {
  const colClass =
    columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'

  return <div className={cn('grid gap-5', colClass, className)}>{children}</div>
}

export interface ProcessStep {
  id: string
  label: string
  description?: string
}

interface AdminProcessStepperProps {
  steps: ProcessStep[]
  currentStep: number
  className?: string
}

export function AdminProcessStepper({ steps, currentStep, className }: AdminProcessStepperProps) {
  return (
    <motion.div variants={adminStaggerItem} className={cn('w-full', className)}>
      <div className="hidden sm:block">
        <div className="flex items-start">
          {steps.map((step, index) => {
            const stepNum = index + 1
            const isComplete = currentStep > stepNum
            const isActive = currentStep === stepNum
            const isLast = index === steps.length - 1

            return (
              <div key={step.id} className={cn('flex flex-1 items-start', isLast && 'flex-none')}>
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={cn(
                      'relative flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300',
                      isComplete || isActive
                        ? 'bg-primary text-primary-foreground shadow-[0_0_0_4px_rgba(59,130,246,0.12)]'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isComplete ? <Check className="size-4" strokeWidth={2.5} /> : stepNum}
                    {isActive && (
                      <motion.span
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.35, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      />
                    )}
                  </motion.div>
                  <div className="mt-2 max-w-[88px] text-center">
                    <p
                      className={cn(
                        'text-xs font-semibold leading-tight',
                        isActive ? 'text-foreground' : 'text-muted-foreground',
                      )}
                    >
                      {step.label}
                    </p>
                    {step.description && (
                      <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{step.description}</p>
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div className="mx-2 mt-5 h-0.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={false}
                      animate={{ width: isComplete ? '100%' : isActive ? '50%' : '0%' }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-muted-foreground">{steps[currentStep - 1]?.label}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export interface WorkflowTimelineEvent {
  id: string
  title: string
  description?: string
  actor?: string
  timestamp?: string
  status?: string
  icon?: LucideIcon
  tone?: DetailCardTone
}

interface AdminWorkflowTimelineProps {
  events: WorkflowTimelineEvent[]
  className?: string
}

export function AdminWorkflowTimeline({ events, className }: AdminWorkflowTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {events.map((event, index) => {
        const Icon = event.icon
        const tone = event.tone ?? 'slate'

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {index < events.length - 1 && (
              <div className="absolute left-[19px] top-10 h-[calc(100%-1rem)] w-0.5 bg-border" />
            )}
            <div
              className={cn(
                'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full',
                DETAIL_CARD_TONES[tone],
              )}
            >
              {Icon && <Icon className="size-4" strokeWidth={1.75} />}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold">{event.title}</p>
              {event.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
              )}
              {(event.actor || event.timestamp) && (
                <div className="mt-1.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                  {event.actor && <span>{event.actor}</span>}
                  {event.actor && event.timestamp && <span>·</span>}
                  {event.timestamp && <span>{event.timestamp}</span>}
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

interface AdminIllustrationPanelProps {
  imageSrc: string
  alt: string
  title?: string
  description?: string
  className?: string
}

export function AdminIllustrationPanel({
  imageSrc,
  alt,
  title,
  description,
  className,
}: AdminIllustrationPanelProps) {
  return (
    <motion.div
      variants={adminStaggerItem}
      className={cn(
        'overflow-hidden rounded-2xl border border-border/60 bg-muted/30',
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center">
        <motion.img
          src={imageSrc}
          alt={alt}
          className="h-36 w-full object-cover object-top sm:h-28 sm:w-40 shrink-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        {(title || description) && (
          <div className="p-4">
            {title && <p className="text-sm font-semibold">{title}</p>}
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
        )}
      </div>
    </motion.div>
  )
}

interface AdminTextBlockProps {
  title: string
  content: string
  icon?: LucideIcon
  tone?: DetailCardTone
}

export function AdminTextBlock({ title, content, icon: Icon, tone = 'slate' }: AdminTextBlockProps) {
  return (
    <motion.div variants={adminStaggerItem}>
      <Card className="admin-card">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
          {Icon && (
            <div className={cn('flex size-9 items-center justify-center rounded-lg', DETAIL_CARD_TONES[tone])}>
              <Icon className="size-4" />
            </div>
          )}
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{content}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function parseComparisonLines(text: string): { label: string; value: string }[] {
  return text.split('\n').filter(Boolean).map((line) => {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) return { label: line.trim(), value: '' }
    return {
      label: line.slice(0, colonIdx).trim(),
      value: line.slice(colonIdx + 1).trim(),
    }
  })
}

interface AdminComparisonPanelProps {
  current: string
  requested: string
  className?: string
}

export function AdminComparisonPanel({ current, requested, className }: AdminComparisonPanelProps) {
  const currentLines = parseComparisonLines(current)
  const requestedLines = parseComparisonLines(requested)
  const labels = [
    ...new Set([...currentLines.map((l) => l.label), ...requestedLines.map((l) => l.label)]),
  ]

  return (
    <motion.div variants={adminStaggerItem} className={className}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="admin-card rounded-2xl border border-border/60 bg-muted/20 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current Value
          </p>
          <div className="space-y-2">
            {currentLines.map((line) => (
              <div key={line.label} className="text-sm">
                <span className="text-muted-foreground">{line.label}: </span>
                <span className="font-medium">{line.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card rounded-2xl border border-primary/25 bg-primary/[0.03] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
            Requested New Value
          </p>
          <div className="space-y-2">
            {requestedLines.map((line) => (
              <div key={line.label} className="text-sm">
                <span className="text-muted-foreground">{line.label}: </span>
                <span className="font-semibold text-foreground">{line.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {labels.map((label) => {
          const oldVal = currentLines.find((l) => l.label === label)?.value ?? '—'
          const newVal = requestedLines.find((l) => l.label === label)?.value ?? '—'
          const changed = oldVal !== newVal
          return (
            <div
              key={label}
              className={cn(
                'flex flex-col gap-1 rounded-xl border px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between',
                changed
                  ? 'border-amber-500/25 bg-amber-500/8'
                  : 'border-border/40 bg-card',
              )}
            >
              <span className="font-medium text-muted-foreground">{label}</span>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className={cn(changed && 'text-muted-foreground line-through')}>{oldVal}</span>
                {changed && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-primary">{newVal}</span>
                  </>
                )}
                {!changed && <span className="text-xs text-muted-foreground">(unchanged)</span>}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

interface VerificationStep {
  label: string
  done: boolean
}

interface AdminVerificationStepGridProps {
  steps: VerificationStep[]
  className?: string
}

export function AdminVerificationStepGrid({ steps, className }: AdminVerificationStepGridProps) {
  const completedCount = steps.filter((s) => s.done).length

  return (
    <motion.div variants={adminStaggerItem} className={className}>
      <AdminProcessStepper
        steps={steps.map((s, i) => ({
          id: String(i + 1),
          label: s.label,
          description: s.done ? 'Complete' : 'Pending',
        }))}
        currentStep={completedCount === steps.length ? steps.length : completedCount + 1}
      />
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors',
              step.done
                ? 'border-emerald-500/25 bg-emerald-500/8'
                : 'border-border/50 bg-muted/20',
            )}
          >
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                step.done ? 'bg-emerald-500 text-white' : 'border-2 border-muted-foreground/30',
              )}
            >
              {step.done ? <Check className="size-4" strokeWidth={2.5} /> : null}
            </div>
            <span className={cn('font-medium', step.done ? 'text-foreground' : 'text-muted-foreground')}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

interface AdminFacePreviewProps {
  imageSrc?: string
  alt: string
  score?: number
  capturedAt?: string
  className?: string
}

export function AdminFacePreview({ imageSrc, alt, score, capturedAt, className }: AdminFacePreviewProps) {
  return (
    <motion.div variants={adminStaggerItem} className={className}>
      <div className="relative mx-auto aspect-square max-w-[220px] overflow-hidden rounded-2xl border-2 border-primary/20 bg-muted/30 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        {imageSrc ? (
          <motion.img
            src={imageSrc}
            alt={alt}
            className="size-full object-cover object-center"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <User className="size-16 text-primary/30" />
          </div>
        )}
        {score != null && (
          <div className="absolute inset-x-0 bottom-0 bg-card/95 px-3 py-2 text-center text-xs font-semibold backdrop-blur-sm">
            Face match: {score}%
          </div>
        )}
      </div>
      {capturedAt && (
        <p className="mt-2 text-center text-xs text-muted-foreground">Captured: {capturedAt}</p>
      )}
    </motion.div>
  )
}

interface AdminMetricItem {
  label: string
  value: string
  icon: LucideIcon
  tone?: DetailCardTone
}

interface AdminMetricGridProps {
  metrics: AdminMetricItem[]
  className?: string
}

export function AdminMetricGrid({ metrics, className }: AdminMetricGridProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const tone = metric.tone ?? 'blue'
        return (
          <motion.div
            key={metric.label}
            variants={adminStaggerItem}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="admin-card admin-hero-metric group">
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="admin-metric-label">{metric.label}</p>
                  <p className="admin-metric-value">{metric.value}</p>
                </div>
                <div
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
                    DETAIL_CARD_TONES[tone],
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

interface AdminInstallmentProgressProps {
  paidCount: number
  totalCount: number
  className?: string
}

export function AdminInstallmentProgress({ paidCount, totalCount, className }: AdminInstallmentProgressProps) {
  if (totalCount <= 0) return null

  return (
    <motion.div
      variants={adminStaggerItem}
      className={cn('rounded-2xl border border-border/60 bg-muted/20 p-4', className)}
    >
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-semibold">Installment Progress</span>
        <span className="text-muted-foreground">
          {paidCount} of {totalCount} paid
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: totalCount }, (_, i) => {
          const num = i + 1
          const isPaid = num <= paidCount
          const isCurrent = num === paidCount + 1
          return (
            <motion.div
              key={num}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                isPaid && 'bg-emerald-500 text-white',
                isCurrent && !isPaid && 'bg-primary text-primary-foreground ring-2 ring-primary/20',
                !isPaid && !isCurrent && 'border border-border bg-card text-muted-foreground',
              )}
              title={`Installment ${num}${isPaid ? ' — paid' : isCurrent ? ' — current' : ''}`}
            >
              {isPaid ? <Check className="size-3.5" strokeWidth={2.5} /> : num}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

interface AdminProgressCardProps {
  title: string
  percent: number
  footer?: ReactNode
  children?: ReactNode
  className?: string
}

export function AdminProgressCard({ title, percent, footer, children, className }: AdminProgressCardProps) {
  return (
    <motion.div variants={adminStaggerItem} className={className}>
      <Card className="admin-card">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">{title}</span>
            <span className="text-lg font-bold text-primary">{percent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            />
          </div>
          {children}
          {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
