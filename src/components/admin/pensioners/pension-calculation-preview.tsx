import { motion } from 'framer-motion'

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
}

export function PensionCalculationPreview({ components, className }: PensionCalculationPreviewProps) {
  const active = getActiveComponents(components)
  const calc = calculatePensionFromComponents(active)

  const creditItems = calc.breakdown.filter((b) => b.calcType !== 'deduction')
  const deductionItems = calc.breakdown.filter((b) => b.calcType === 'deduction')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-xl border bg-muted/20 p-4', className)}
    >
      <h4 className="mb-3 text-sm font-semibold">Calculation Preview</h4>
      <div className="space-y-2">
        {creditItems.map((item) => (
          <div key={item.kind} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {item.name}
              <span className="ml-1 text-xs">({PENSION_COMPONENT_CALC_TYPE_LABELS[item.calcType]})</span>
            </span>
            <span className="font-medium">{formatPensionCurrency(item.amount)}</span>
          </div>
        ))}
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Gross Pension</span>
          <span className="text-primary">{formatPensionCurrency(calc.grossPension)}</span>
        </div>
        {deductionItems.length > 0 && (
          <>
            <Separator className="my-2" />
            {deductionItems.map((item) => (
              <div key={item.kind} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium text-red-600">−{formatPensionCurrency(item.amount)}</span>
              </div>
            ))}
          </>
        )}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <span className="font-semibold text-emerald-800 dark:text-emerald-200">Net Pension</span>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatPensionCurrency(calc.netPension)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
