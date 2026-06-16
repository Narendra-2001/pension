import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  BadgeIndianRupee,
  Calendar,
  CheckCircle2,
  FileText,
  History,
  Minus,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import type { ReactNode } from 'react'

import { PensionCalculationPreview } from '@/components/admin/pensioners/pension-calculation-preview'
import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { PensionerPageShell } from '@/components/pensioner/shared/pensioner-page-ui'
import { getVerificationStatusVariant, StatusPill } from '@/components/pensioner/shared/status-pill'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchPensionerProfile, fetchPensionStatements } from '@/data/pensioner-api'
import { fetchPensionStructure } from '@/data/pension-structure-api'
import { formatCurrency } from '@/data/pensioner-mock-data'
import {
  formatPensionCurrency,
  getActiveComponents,
  PENSION_TYPE_LABELS,
} from '@/lib/pension-structure'
import { useAuth } from '@/providers/auth-provider'
import type { PensionStatement } from '@/types/pensioner-portal'
import type { PensionDetails } from '@/types/pensioner'
import { cn } from '@/lib/utils'

type KpiTone = 'green' | 'amber' | 'rose' | 'slate'

const KPI_TONES: Record<KpiTone, { icon: string; value: string }> = {
  green: {
    icon: 'bg-emerald-100 text-emerald-600',
    value: 'text-emerald-700',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-600',
    value: 'text-rose-700',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-600',
    value: 'text-foreground',
  },
}

function PensionKpiCard({
  label,
  value,
  icon: Icon,
  tone = 'green',
  delay = 0,
}: {
  label: string
  value: ReactNode
  icon: LucideIcon
  tone?: KpiTone
  delay?: number
}) {
  const styles = KPI_TONES[tone]

  return (
    <motion.div
      variants={adminStaggerItem}
      transition={{ delay }}
      className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_3px_rgba(15,23,42,0.05),0_4px_16px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-full',
            styles.icon,
          )}
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-xl font-bold tabular-nums leading-tight', styles.value)}>
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function BreakdownTable({
  title,
  rows,
  footer,
  tone = 'default',
}: {
  title: string
  rows: { label: string; value: string; negative?: boolean }[]
  footer?: { label: string; value: string; highlight?: boolean }
  tone?: 'default' | 'deduction'
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60">
      <div
        className={cn(
          'border-b border-border/60 px-4 py-3',
          tone === 'deduction' ? 'bg-rose-50' : 'bg-muted/40',
        )}
      >
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-muted/20">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Component
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <motion.tr
              key={row.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.04 }}
              className="border-b border-border/40 last:border-b-0 hover:bg-muted/25"
            >
              <td className="px-4 py-3 font-medium text-muted-foreground">{row.label}</td>
              <td
                className={cn(
                  'px-4 py-3 text-right font-semibold tabular-nums',
                  row.negative ? 'text-rose-600' : 'text-foreground',
                )}
              >
                {row.value}
              </td>
            </motion.tr>
          ))}
        </tbody>
        {footer && (
          <tfoot>
            <tr className={cn(footer.highlight ? 'bg-emerald-50' : 'bg-muted/30')}>
              <td
                className={cn(
                  'px-4 py-3.5 font-semibold',
                  footer.highlight ? 'text-emerald-800' : 'text-foreground',
                )}
              >
                {footer.label}
              </td>
              <td
                className={cn(
                  'px-4 py-3.5 text-right text-base font-bold tabular-nums',
                  footer.highlight ? 'text-emerald-700' : 'text-foreground',
                )}
              >
                {footer.value}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/40 py-3 last:border-b-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-semibold text-foreground">{value}</span>
    </div>
  )
}

const STATEMENT_STATUS_LABELS: Record<PensionStatement['status'], string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
}

function scaleAmount(value: number, factor: number) {
  return Math.round(value * factor)
}

function buildStatementBreakdown(
  pension: PensionDetails,
  statement: PensionStatement,
  structureCredits: { label: string; value: number }[],
  structureDeductions: { label: string; value: number }[],
) {
  const grossFactor =
    pension.grossPension > 0 ? statement.grossPension / pension.grossPension : 1

  const creditItems =
    structureCredits.length > 0
      ? structureCredits.map((item) => ({
          label: item.label,
          value: scaleAmount(item.value, grossFactor),
        }))
      : [
          { label: 'Basic Pension', value: scaleAmount(pension.basicPension, grossFactor) },
          { label: 'Dearness Relief', value: scaleAmount(pension.dearnessRelief, grossFactor) },
          { label: 'Medical Allowance', value: scaleAmount(pension.medicalAllowance, grossFactor) },
          { label: 'Special Allowance', value: scaleAmount(pension.specialAllowance, grossFactor) },
          { label: 'Arrears', value: scaleAmount(pension.arrears, grossFactor) },
        ]

  const deductionItems =
    structureDeductions.length > 0
      ? [
          { label: 'Recovery', value: statement.recoveryAmount },
          ...structureDeductions
            .filter((item) => !item.label.toLowerCase().includes('recovery'))
            .map((item) => ({
              label: item.label,
              value: scaleAmount(item.value, grossFactor),
            })),
        ]
      : [
          { label: 'Recovery Deduction', value: statement.recoveryAmount },
          { label: 'Tax & Other Deductions', value: statement.deductions },
        ]

  const totalDeductions = statement.recoveryAmount + statement.deductions

  return {
    creditItems,
    deductionItems,
    grossPension: statement.grossPension,
    netPension: statement.netPension,
    totalDeductions,
  }
}

export function PensionDetailsPage({ month }: { month?: string }) {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''

  const { data: record, isLoading } = useQuery({
    queryKey: ['pensioner-pension', pensionerId],
    queryFn: () => fetchPensionerProfile(pensionerId),
    enabled: !!pensionerId,
  })

  const { data: structure } = useQuery({
    queryKey: ['pension-structure', pensionerId],
    queryFn: () => fetchPensionStructure(pensionerId),
    enabled: !!pensionerId,
  })

  const { data: statements, isLoading: statementsLoading } = useQuery({
    queryKey: ['pensioner-statements', pensionerId],
    queryFn: () => fetchPensionStatements(pensionerId),
    enabled: !!pensionerId && !!month,
  })

  if (isLoading || !record || (month && statementsLoading)) return <PageLoadingSkeleton />

  const statement = month ? statements?.find((item) => item.month === month) : undefined

  if (month && !statement) {
    return (
      <PensionerPageShell>
        <EmptyState
          icon={<FileText className="size-7 text-muted-foreground" />}
          title="Statement not found"
          description={`No pension statement was found for ${month}.`}
          action={
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/pensioner/statements">
                <ArrowLeft className="mr-1 size-3.5" />
                Back to Statements
              </Link>
            </Button>
          }
        />
      </PensionerPageShell>
    )
  }

  const { pension, service } = record
  const master = structure?.master
  const activeComponents = structure ? getActiveComponents(structure.components) : []

  const creditComponents = activeComponents.filter((c) => c.calcType !== 'deduction')
  const deductionComponents = activeComponents.filter((c) => c.calcType === 'deduction')

  const creditItems = structure
    ? creditComponents.map((c) => ({ label: c.name, value: c.amount }))
    : [
        { label: 'Basic Pension', value: pension.basicPension },
        { label: 'Dearness Relief', value: pension.dearnessRelief },
        { label: 'Medical Allowance', value: pension.medicalAllowance },
        { label: 'Special Allowance', value: pension.specialAllowance },
        { label: 'Arrears', value: pension.arrears },
      ]

  const deductionItems = structure
    ? deductionComponents.map((c) => ({ label: c.name, value: c.amount }))
    : [
        { label: 'Tax Deduction', value: pension.taxDeduction },
        { label: 'Recovery Deduction', value: pension.recoveryDeduction },
      ]

  const breakdown = statement
    ? buildStatementBreakdown(pension, statement, creditItems, deductionItems)
    : {
        creditItems,
        deductionItems,
        grossPension: pension.grossPension,
        netPension: pension.netPension,
        totalDeductions: deductionItems.reduce((sum, item) => sum + item.value, 0),
      }

  const pensionTypeLabel = master
    ? PENSION_TYPE_LABELS[master.pensionType]
    : service.pensionType.replace('_', ' ')

  return (
    <PensionerPageShell>
      <motion.div variants={adminStaggerItem}>
        <PageHeader
          variant="admin"
          title="Pension Details"
          description={
            statement
              ? `${statement.month} statement — monthly pension breakdown and payment history`
              : 'View your monthly pension breakdown, credits, deductions, and payment summary'
          }
          actions={
            <div className="flex flex-wrap gap-2">
              {statement && (
                <Button variant="outline" className="rounded-xl border-border bg-card" asChild>
                  <Link to="/pensioner/statements">
                    <ArrowLeft className="size-4" />
                    Back to Statements
                  </Link>
                </Button>
              )}
              <Button variant="outline" className="rounded-xl border-border bg-card" asChild>
                <Link to="/pensioner/pension/history">
                  <History className="size-4" />
                  View History
                </Link>
              </Button>
            </div>
          }
        />
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PensionKpiCard
          label="Net Monthly Pension"
          value={formatCurrency(breakdown.netPension)}
          icon={BadgeIndianRupee}
          tone="green"
        />
        <PensionKpiCard
          label="Gross Pension"
          value={formatCurrency(breakdown.grossPension)}
          icon={TrendingUp}
          tone="green"
          delay={0.06}
        />
        <PensionKpiCard
          label="Total Deductions"
          value={formatCurrency(breakdown.totalDeductions)}
          icon={Minus}
          tone="amber"
          delay={0.12}
        />
        <PensionKpiCard
          label={statement ? 'Payment Status' : 'Pension Status'}
          value={
            statement ? (
              <StatusPill
                label={STATEMENT_STATUS_LABELS[statement.status]}
                variant={getVerificationStatusVariant(statement.status)}
              />
            ) : (
              <StatusPill label="Active" variant={getVerificationStatusVariant('Active')} />
            )
          }
          icon={CheckCircle2}
          tone="slate"
          delay={0.18}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div variants={adminStaggerItem} className="space-y-5 lg:col-span-3">
          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_24px_rgba(15,23,42,0.04)]">
            <CardHeader className="border-b border-border/50 bg-muted/30 px-5 py-4">
              <CardTitle className="text-base font-bold">Monthly Pension Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                {statement
                  ? `Credits, deductions, and net payable for ${statement.month}`
                  : 'Credits, deductions, and net payable for the current month'}
              </p>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <BreakdownTable
                title="Credits & Allowances"
                rows={breakdown.creditItems.map((item) => ({
                  label: item.label,
                  value: formatCurrency(item.value),
                }))}
                footer={{
                  label: 'Gross Pension',
                  value: formatCurrency(breakdown.grossPension),
                }}
              />

              <BreakdownTable
                title="Deductions"
                tone="deduction"
                rows={breakdown.deductionItems.map((item) => ({
                  label: item.label,
                  value: `−${formatPensionCurrency(item.value)}`,
                  negative: true,
                }))}
              />

              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-emerald-800">Net Pension Payable</p>
                  <p className="mt-0.5 text-xs text-emerald-600">
                    Amount credited to your registered bank account
                  </p>
                </div>
                <p className="text-2xl font-bold tabular-nums text-emerald-700">
                  {formatCurrency(breakdown.netPension)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={adminStaggerItem} className="space-y-5 lg:col-span-2">
          {statement && (
            <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_24px_rgba(15,23,42,0.04)]">
              <CardHeader className="border-b border-border/50 bg-muted/30 px-5 py-4">
                <CardTitle className="text-base font-bold">Payment History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Disbursement details for {statement.month}
                </p>
              </CardHeader>
              <CardContent className="px-5 py-2">
                <InfoField label="Statement Month" value={statement.month} />
                <InfoField
                  label="Payment Status"
                  value={
                    <StatusPill
                      label={STATEMENT_STATUS_LABELS[statement.status]}
                      variant={getVerificationStatusVariant(statement.status)}
                    />
                  }
                />
                <InfoField label="UTR Reference" value={statement.utrReference ?? '—'} />
                <InfoField
                  label="NEFT Credited On"
                  value={
                    statement.neftCreditedAt
                      ? format(parseISO(statement.neftCreditedAt), 'dd MMM yyyy')
                      : '—'
                  }
                />
                <InfoField label="Net Amount Paid" value={formatCurrency(statement.netPension)} />
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_24px_rgba(15,23,42,0.04)]">
            <CardHeader className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">{service.ppoNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">{pensionTypeLabel}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 py-2">
              <InfoField label="PPO Number" value={service.ppoNumber} />
              <InfoField label="Pension Type" value={pensionTypeLabel} />
              <InfoField
                label="Pension Start Date"
                value={master?.pensionStartDate ?? service.retirementDate}
              />
              <InfoField
                label="Status"
                value={
                  <StatusPill label="Active" variant={getVerificationStatusVariant('Active')} />
                }
              />
              <InfoField label="Department" value={service.department} />
              <InfoField label="Office" value={service.officeName} />
            </CardContent>
            <div className="border-t border-border/50 bg-muted/20 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                Pension disbursed monthly on the 1st working day
              </div>
            </div>
          </Card>

          {structure && (
            <Card className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_1px_3px_rgba(15,23,42,0.05),0_8px_24px_rgba(15,23,42,0.04)]">
              <CardHeader className="border-b border-border/50 bg-muted/30 px-5 py-3.5">
                <CardTitle className="flex items-center gap-2 text-sm font-bold">
                  <FileText className="size-4 text-muted-foreground" />
                  Component Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <PensionCalculationPreview
                  components={structure.components}
                  className="border-0 bg-transparent p-0"
                />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </PensionerPageShell>
  )
}
