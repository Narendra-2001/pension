import { motion } from 'framer-motion'
import { Receipt } from 'lucide-react'

import { AdminDetailCard } from '@/components/admin/shared/admin-detail-ui'
import { Separator } from '@/components/ui/separator'
import {
  calculatePensionFromComponents,
  formatPensionCurrency,
  getActiveComponents,
  PENSION_COMPONENT_CALC_TYPE_LABELS,
} from '@/lib/pension-structure'
import type { PensionComponent } from '@/types/pension-structure'
import { cn } from '@/lib/utils'

interface PensionCalculationPreviewProps {
  components: PensionComponent[]
  className?: string
  variant?: 'card' | 'plain'
}

export function PensionCalculationPreview({
  components,
  className,
  variant = 'plain',
}: PensionCalculationPreviewProps) {
  const active = getActiveComponents(components)
  const calc = calculatePensionFromComponents(active)

  const creditItems = calc.breakdown.filter((b) => b.calcType !== 'deduction')
  const deductionItems = calc.breakdown.filter((b) => b.calcType === 'deduction')

  const content = (
    <div className="space-y-1">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Based on {active.length} active component{active.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-2.5">
        {creditItems.map((item) => (
          <div key={item.kind} className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 text-muted-foreground">
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="ml-1.5 text-xs">({PENSION_COMPONENT_CALC_TYPE_LABELS[item.calcType]})</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums">{formatPensionCurrency(item.amount)}</span>
          </div>
        ))}
      </div>

      <Separator className="my-3" />

      <div className="flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5 text-sm font-semibold">
        <span>Gross Pension</span>
        <span className="text-primary tabular-nums">{formatPensionCurrency(calc.grossPension)}</span>
      </div>

      {deductionItems.length > 0 && (
        <div className="mt-3 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-600/80 dark:text-rose-400/80">
            Deductions
          </p>
          {deductionItems.map((item) => (
            <div key={item.kind} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">{item.name}</span>
              <span className="shrink-0 font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                −{formatPensionCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3.5">
        <span className="font-semibold text-emerald-800 dark:text-emerald-200">Net Pension</span>
        <span className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
          {formatPensionCurrency(calc.netPension)}
        </span>
      </div>
    </div>
  )

  if (variant === 'card') {
    return (
      <AdminDetailCard title="Calculation Preview" icon={Receipt} tone="green" className={cn('lg:sticky lg:top-6', className)}>
        {content}
      </AdminDetailCard>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border border-border/60 bg-muted/20 p-4', className)}
    >
      <h4 className="mb-3 text-sm font-semibold">Calculation Preview</h4>
      {content}
    </motion.div>
  )
}
