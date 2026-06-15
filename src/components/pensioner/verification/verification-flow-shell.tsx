import { Link } from '@tanstack/react-router'
import { ArrowLeft, Shield } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { VERIFICATION_WIZARD_STEPS } from './verification-constants'
import { VerificationFlowStepper, VerificationFlowStepperMobile } from './verification-flow-stepper'

interface VerificationFlowShellProps {
  currentStep: number
  title?: string
  onCancel?: () => void
  children: ReactNode
  className?: string
}

export function VerificationFlowShell({
  currentStep,
  title = 'Life Certificate Verification',
  onCancel,
  children,
  className,
}: VerificationFlowShellProps) {
  const stepMeta = VERIFICATION_WIZARD_STEPS.find((s) => s.id === currentStep)

  return (
    <div className={cn('mx-auto w-full max-w-6xl', className)}>
      {/* Top bar */}
      <header className="mb-6 flex items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="size-9 shrink-0 rounded-lg" asChild>
            <Link to="/pensioner/verification" onClick={onCancel}>
              <ArrowLeft className="size-4" />
              <span className="sr-only">Back to verification status</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="size-4 text-primary" />
              </div>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {stepMeta?.label} · Secure digital life certificate
            </p>
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Progress</p>
          <p className="text-sm font-semibold tabular-nums">
            Step {currentStep} of {VERIFICATION_WIZARD_STEPS.length}
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
        {/* Sidebar stepper — desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Verification steps
            </p>
            <VerificationFlowStepper currentStep={currentStep} />
          </div>
        </aside>

        {/* Main panel */}
        <main className="min-w-0">
          <div className="mb-5 lg:hidden">
            <VerificationFlowStepperMobile currentStep={currentStep} />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
