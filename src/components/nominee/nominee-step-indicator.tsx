import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface NomineeStep {
  id: string
  label: string
  description?: string
}

interface NomineeStepIndicatorProps {
  steps: NomineeStep[]
  currentStep: number
  className?: string
}

export function NomineeStepIndicator({ steps, currentStep, className }: NomineeStepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isActive = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className={cn('flex flex-1 items-start', isLast && 'flex-none')}>
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {/* glow ring for active step */}
                  {isActive && (
                    <span className="absolute -inset-1.5 rounded-full bg-icy-blue-400/30 blur-md" />
                  )}
                  <motion.div
                    className={cn(
                      'relative flex size-9 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300',
                      isComplete &&
                        'bg-gradient-to-br from-icy-blue-500 to-icy-blue-600 text-white shadow-md shadow-icy-blue-500/30',
                      isActive &&
                        'bg-background text-icy-blue-600 ring-2 ring-icy-blue-500 dark:text-icy-blue-400',
                      !isComplete &&
                        !isActive &&
                        'bg-muted text-muted-foreground ring-1 ring-border',
                    )}
                    animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {isComplete ? (
                      <motion.span
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      >
                        <Check className="size-4" strokeWidth={3} />
                      </motion.span>
                    ) : (
                      index + 1
                    )}
                    {isActive && (
                      <span className="nominee-pulse-ring absolute inset-0 rounded-full border-2 border-icy-blue-400/60" />
                    )}
                  </motion.div>
                </div>
                <div className="hidden text-center sm:block">
                  <p
                    className={cn(
                      'text-xs font-semibold transition-colors',
                      isActive || isComplete
                        ? 'text-icy-blue-700 dark:text-icy-blue-300'
                        : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="mt-0.5 max-w-[7rem] text-[10px] leading-tight text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className="relative mx-2 mt-4 h-1 flex-1 overflow-hidden rounded-full bg-border/70 sm:mx-3">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-icy-blue-500 to-icy-blue-400"
                    initial={{ width: '0%' }}
                    animate={{ width: isComplete ? '100%' : isActive ? '50%' : '0%' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                  {isActive && <span className="nominee-beam absolute inset-0 opacity-60" />}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
