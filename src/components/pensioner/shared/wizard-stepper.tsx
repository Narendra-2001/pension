import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface WizardStep {
  id: number
  label: string
}

interface WizardStepperProps {
  steps: WizardStep[]
  currentStep: number
  className?: string
}

export function WizardStepper({ steps, currentStep, className }: WizardStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.id
          const isActive = currentStep === step.id
          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    backgroundColor: isComplete || isActive ? 'var(--primary)' : 'var(--muted)',
                  }}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    isComplete || isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {isComplete ? <Check className="size-4" /> : step.id}
                </motion.div>
                <span
                  className={cn(
                    'text-xs font-medium text-center max-w-[80px]',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded-full transition-colors',
                    isComplete ? 'bg-primary' : 'bg-muted',
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-muted-foreground">{steps[currentStep - 1]?.label}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}
