import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import { VERIFICATION_WIZARD_STEPS } from './verification-constants'

interface VerificationFlowStepperProps {
  currentStep: number
  className?: string
}

export function VerificationFlowStepper({ currentStep, className }: VerificationFlowStepperProps) {
  return (
    <nav aria-label="Verification progress" className={cn('space-y-1', className)}>
      {VERIFICATION_WIZARD_STEPS.map((step) => {
        const isComplete = currentStep > step.id
        const isActive = currentStep === step.id

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
              isActive && 'bg-primary/8 ring-1 ring-primary/15',
              !isActive && !isComplete && 'opacity-60',
            )}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                isComplete
                  ? 'bg-emerald-600 text-white'
                  : isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {isComplete ? <Check className="size-3.5" strokeWidth={2.5} /> : step.id}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  'truncate text-sm font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        )
      })}
    </nav>
  )
}

export function VerificationFlowStepperMobile({ currentStep }: { currentStep: number }) {
  const step = VERIFICATION_WIZARD_STEPS.find((s) => s.id === currentStep)
  const progress = (currentStep / VERIFICATION_WIZARD_STEPS.length) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{step?.label}</span>
        <span className="tabular-nums text-muted-foreground">
          {currentStep} / {VERIFICATION_WIZARD_STEPS.length}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {VERIFICATION_WIZARD_STEPS.map((s) => (
          <span
            key={s.id}
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
              s.id === currentStep
                ? 'bg-primary text-primary-foreground'
                : s.id < currentStep
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {s.shortLabel}
          </span>
        ))}
      </div>
    </div>
  )
}
