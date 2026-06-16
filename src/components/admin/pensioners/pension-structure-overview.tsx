import { Link } from '@tanstack/react-router'
import { ArrowRight, Calculator, Layers, Minus, Plus, Receipt } from 'lucide-react'

import { AdminDetailCard } from '@/components/admin/shared/admin-detail-ui'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  calculatePensionFromComponents,
  formatPensionCurrency,
  getActiveComponents,
  PENSION_COMPONENT_CALC_TYPE_LABELS,
  PENSION_COMPONENT_CATEGORY_LABELS,
} from '@/lib/pension-structure'
import type { PensionComponent, PensionComponentCategory } from '@/types/pension-structure'
import { cn } from '@/lib/utils'

const CATEGORY_ORDER: PensionComponentCategory[] = ['core', 'allowance', 'adjustment', 'deduction']

const CATEGORY_ACCENT: Record<PensionComponentCategory, string> = {
  core: 'border-l-sky-500',
  allowance: 'border-l-violet-500',
  adjustment: 'border-l-amber-500',
  deduction: 'border-l-rose-500',
}

const CATEGORY_PILL: Record<PensionComponentCategory, string> = {
  core: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
  allowance: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
  adjustment: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  deduction: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

interface PensionStructureOverviewProps {
  components: PensionComponent[]
  ppoRouteRef: string
  className?: string
}

function groupByCategory(components: PensionComponent[]) {
  const groups = new Map<PensionComponentCategory, PensionComponent[]>()
  for (const category of CATEGORY_ORDER) {
    const items = components.filter((c) => c.category === category)
    if (items.length > 0) groups.set(category, items)
  }
  return groups
}

function formatEffectiveDate(date: string) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function PensionStructureOverview({
  components,
  ppoRouteRef,
  className,
}: PensionStructureOverviewProps) {
  const active = getActiveComponents(components)
  const calc = calculatePensionFromComponents(active)
  const groups = groupByCategory(components)
  const totalDeductions = calc.breakdown
    .filter((b) => b.calcType === 'deduction')
    .reduce((sum, b) => sum + b.amount, 0)

  const creditItems = calc.breakdown.filter((b) => b.calcType !== 'deduction')
  const deductionItems = calc.breakdown.filter((b) => b.calcType === 'deduction')

  return (
    <AdminDetailCard
      title="Pension Structure"
      icon={Calculator}
      tone="blue"
      className={className}
      headerAction={
        <Button variant="outline" size="sm" className="rounded-full text-xs" asChild>
          <Link to="/admin/pensioners/$id/pension" params={{ id: ppoRouteRef }}>
            Manage Structure
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      }
    >
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Breakdown of {active.length} active pension component{active.length !== 1 ? 's' : ''} that
          determine monthly disbursement.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Plus className="size-3.5 text-sky-500" />
              Gross Pension
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight">
              {formatPensionCurrency(calc.grossPension)}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Minus className="size-3.5 text-rose-500" />
              Deductions
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-rose-600 dark:text-rose-400">
              {totalDeductions > 0 ? `−${formatPensionCurrency(totalDeductions)}` : formatPensionCurrency(0)}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 p-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              <Receipt className="size-3.5" />
              Net Pension
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-emerald-700 dark:text-emerald-300">
              {formatPensionCurrency(calc.netPension)}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] xl:items-start">
          <div className="min-w-0">
            {components.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center">
                <Layers className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  No pension components configured
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/60">
                <div className="hidden border-b border-border/50 bg-muted/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1.4fr)_88px_100px_108px_72px] sm:gap-3">
                  <span>Component</span>
                  <span>Type</span>
                  <span>Category</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">Status</span>
                </div>

                <div className="divide-y divide-border/40">
                  {Array.from(groups.entries()).map(([category, items]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 bg-muted/15 px-4 py-2">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            CATEGORY_PILL[category],
                          )}
                        >
                          {PENSION_COMPONENT_CATEGORY_LABELS[category]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {items.map((component) => (
                        <div
                          key={component.id}
                          className={cn(
                            'border-l-[3px] px-4 py-3 transition-colors hover:bg-muted/20',
                            CATEGORY_ACCENT[category],
                          )}
                        >
                          <div className="sm:grid sm:grid-cols-[minmax(0,1.4fr)_88px_100px_108px_72px] sm:items-center sm:gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{component.name}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                                {PENSION_COMPONENT_CALC_TYPE_LABELS[component.calcType]} ·{' '}
                                {formatEffectiveDate(component.effectiveDate)}
                              </p>
                              <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                                Effective {formatEffectiveDate(component.effectiveDate)}
                              </p>
                            </div>

                            <span className="hidden text-xs text-muted-foreground sm:block">
                              {PENSION_COMPONENT_CALC_TYPE_LABELS[component.calcType]}
                            </span>

                            <span className="hidden sm:block">
                              <span
                                className={cn(
                                  'inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                                  CATEGORY_PILL[category],
                                )}
                              >
                                {PENSION_COMPONENT_CATEGORY_LABELS[category]}
                              </span>
                            </span>

                            <span
                              className={cn(
                                'mt-2 block text-sm font-bold tabular-nums sm:mt-0 sm:text-right',
                                component.calcType === 'deduction'
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-foreground',
                              )}
                            >
                              {component.calcType === 'deduction' ? '−' : ''}
                              {formatPensionCurrency(component.amount)}
                            </span>

                            <span className="mt-1 flex items-center gap-1.5 text-xs sm:mt-0 sm:justify-end">
                              <span
                                className={cn(
                                  'size-1.5 rounded-full',
                                  component.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                                )}
                              />
                              <span className="capitalize text-muted-foreground">{component.status}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/15 p-4 xl:sticky xl:top-6">
            <h4 className="text-sm font-semibold">Monthly Calculation</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              How components roll up to net pension
            </p>

            <div className="mt-4 space-y-2.5">
              {creditItems.map((item) => (
                <div key={item.kind} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-muted-foreground">{item.name}</span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatPensionCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Gross</span>
              <span className="tabular-nums text-primary">{formatPensionCurrency(calc.grossPension)}</span>
            </div>

            {deductionItems.length > 0 && (
              <div className="mt-3 space-y-2">
                {deductionItems.map((item) => (
                  <div key={item.kind} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-muted-foreground">{item.name}</span>
                    <span className="shrink-0 font-medium tabular-nums text-rose-600 dark:text-rose-400">
                      −{formatPensionCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-3 py-2.5">
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Net Payable</span>
              <span className="text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                {formatPensionCurrency(calc.netPension)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminDetailCard>
  )
}
