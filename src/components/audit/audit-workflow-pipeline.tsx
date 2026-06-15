import {
  ArrowRightLeft,
  ClipboardCheck,
  Database,
  FileText,
  Fingerprint,
  MousePointerClick,
  ScrollText,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PipelineStep {
  id: number
  title: string
  description: string
  icon: LucideIcon
  phase: 'capture' | 'review'
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: 1,
    title: 'User Action',
    description: 'Officer or system triggers a change',
    icon: MousePointerClick,
    phase: 'capture',
  },
  {
    id: 2,
    title: 'Record Activity',
    description: 'Event is detected and queued for logging',
    icon: FileText,
    phase: 'capture',
  },
  {
    id: 3,
    title: 'Capture Old Value',
    description: 'Previous state is preserved before mutation',
    icon: Database,
    phase: 'capture',
  },
  {
    id: 4,
    title: 'Capture New Value',
    description: 'Updated state is recorded alongside the change',
    icon: ArrowRightLeft,
    phase: 'capture',
  },
  {
    id: 5,
    title: 'Store User Details',
    description: 'Actor name, role, and department are attached',
    icon: Fingerprint,
    phase: 'capture',
  },
  {
    id: 6,
    title: 'Store Timestamp',
    description: 'Immutable timestamp with timezone context',
    icon: ScrollText,
    phase: 'capture',
  },
  {
    id: 7,
    title: 'Create Audit Log',
    description: 'Entry is written to the immutable audit store',
    icon: ShieldCheck,
    phase: 'capture',
  },
  {
    id: 8,
    title: 'Officer Reviews',
    description: 'Audit officer validates compliance and integrity',
    icon: UserCheck,
    phase: 'review',
  },
]

export function AuditWorkflowPipeline({ className }: { className?: string }) {
  const captureSteps = PIPELINE_STEPS.filter((s) => s.phase === 'capture')
  const reviewSteps = PIPELINE_STEPS.filter((s) => s.phase === 'review')

  return (
    <div className={cn('space-y-6', className)}>
      <div className="hidden lg:block">
        <div className="relative">
          <div
            className="absolute left-[calc(100%/16)] right-[calc(100%/16)] top-5 h-0.5 bg-gradient-to-r from-violet-200 via-violet-300 to-emerald-300 dark:from-violet-900/60 dark:via-violet-800/40 dark:to-emerald-800/40"
            aria-hidden
          />
          <div className="grid grid-cols-8 gap-2">
            {PIPELINE_STEPS.map((step) => (
              <PipelineNode key={step.id} step={step} variant="compact" />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:hidden">
        <PhaseBlock label="Capture phase" steps={captureSteps} tone="violet" />
        <div className="flex justify-center" aria-hidden>
          <div className="flex flex-col items-center gap-1">
            <div className="h-6 w-px bg-border" />
            <span className="rounded-full border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Immutable log
            </span>
            <div className="h-6 w-px bg-border" />
          </div>
        </div>
        <PhaseBlock label="Review phase" steps={reviewSteps} tone="emerald" />
      </div>

      <div className="hidden gap-3 lg:grid lg:grid-cols-2">
        <PhaseDetailCard
          label="Capture phase"
          description="Every mutation is automatically recorded with full before/after context"
          steps={captureSteps}
          tone="violet"
        />
        <PhaseDetailCard
          label="Review phase"
          description="Audit officers verify authorization trails and compliance posture"
          steps={reviewSteps}
          tone="emerald"
        />
      </div>
    </div>
  )
}

function PhaseBlock({
  label,
  steps,
  tone,
}: {
  label: string
  steps: PipelineStep[]
  tone: 'violet' | 'emerald'
}) {
  return (
    <div>
      <p
        className={cn(
          'mb-3 text-[10px] font-semibold uppercase tracking-[0.16em]',
          tone === 'violet' ? 'text-violet-600 dark:text-violet-400' : 'text-emerald-600 dark:text-emerald-400',
        )}
      >
        {label}
      </p>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <PipelineNode step={step} variant="inline" />
              {i < steps.length - 1 && <div className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className="min-w-0 flex-1 pb-3 pt-1">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhaseDetailCard({
  label,
  description,
  steps,
  tone,
}: {
  label: string
  description: string
  steps: PipelineStep[]
  tone: 'violet' | 'emerald'
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        tone === 'violet'
          ? 'border-violet-200/60 bg-violet-50/30 dark:border-violet-900/40 dark:bg-violet-950/20'
          : 'border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20',
      )}
    >
      <p
        className={cn(
          'text-[10px] font-semibold uppercase tracking-[0.16em]',
          tone === 'violet' ? 'text-violet-600 dark:text-violet-400' : 'text-emerald-600 dark:text-emerald-400',
        )}
      >
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{description}</p>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <li key={step.id} className="flex items-start gap-2.5 text-sm">
              <span
                className={cn(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md',
                  tone === 'violet'
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
                )}
              >
                <Icon className="size-3.5" strokeWidth={2} />
              </span>
              <span>
                <span className="font-medium">{step.title}</span>
                <span className="text-muted-foreground"> — {step.description}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function PipelineNode({
  step,
  variant,
}: {
  step: PipelineStep
  variant: 'compact' | 'inline'
}) {
  const Icon = step.icon
  const isReview = step.phase === 'review'

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full border-2',
          isReview
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-violet-500 bg-violet-500 text-white',
        )}
      >
        <Icon className="size-3.5" strokeWidth={2} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className={cn(
          'relative z-10 flex size-10 items-center justify-center rounded-full border-2 shadow-sm',
          isReview
            ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/20'
            : 'border-violet-500 bg-violet-500 text-white shadow-violet-500/20',
        )}
      >
        <Icon className="size-4" strokeWidth={2} />
      </div>
      <div className="min-w-0 px-0.5">
        <p className="text-[10px] font-semibold leading-tight text-foreground">{step.title}</p>
        <p className="mt-0.5 hidden text-[9px] leading-snug text-muted-foreground xl:block">
          {step.description}
        </p>
      </div>
    </div>
  )
}

export function AuditWorkflowSummaryStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-xs">
      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
        <ShieldCheck className="size-3.5 text-violet-600" />
        Immutable trail
      </span>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <ArrowRightLeft className="size-3.5" />
        Old/new value capture
      </span>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Fingerprint className="size-3.5" />
        Full actor attribution
      </span>
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <ClipboardCheck className="size-3.5" />
        Officer review ready
      </span>
    </div>
  )
}
