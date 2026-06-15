import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  AlertCircle,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileText,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { PageHeader } from '@/components/admin/shared/page-header'
import {
  AnimatedProgress,
  PensionerPageShell,
} from '@/components/pensioner/shared/pensioner-page-ui'
import { getVerificationStatusVariant, StatusPill } from '@/components/pensioner/shared/status-pill'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchRecoveryStatus } from '@/data/pensioner-api'
import { formatCurrency } from '@/data/pensioner-mock-data'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { RecoveryCase, RecoveryInstallment } from '@/types/pensioner-portal'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | RecoveryInstallment['status']

const installmentStatusConfig = {
  paid: {
    icon: CheckCircle2,
    accent: 'border-l-emerald-500',
    dot: 'bg-emerald-500',
    label: 'Paid',
  },
  pending: {
    icon: Clock,
    accent: 'border-l-amber-500',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  overdue: {
    icon: AlertCircle,
    accent: 'border-l-red-500',
    dot: 'bg-red-500',
    label: 'Overdue',
  },
} as const

function MetricTile({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string
  value: string
  icon: LucideIcon
  className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-border/70 bg-background px-4 py-3.5', className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" strokeWidth={2} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-1.5 text-base font-bold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function RecoveryOverview({ recovery }: { recovery: RecoveryCase }) {
  const progressPercent = Math.round((recovery.recoveredAmount / recovery.totalAmount) * 100)
  const paidCount = recovery.installments.filter((i) => i.status === 'paid').length
  const pendingCount = recovery.installments.filter((i) => i.status === 'pending').length
  const overdueCount = recovery.installments.filter((i) => i.status === 'overdue').length
  const progressTone = overdueCount > 0 ? 'amber' : progressPercent === 100 ? 'emerald' : 'primary'

  return (
    <motion.div variants={adminStaggerItem}>
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
        <div className="border-b border-border/60 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs font-semibold text-foreground">
                  <FileText className="size-3.5 text-muted-foreground" />
                  {recovery.caseId}
                </span>
                <StatusPill label="Active Recovery" variant="warning" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{recovery.reason}</p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground sm:text-4xl">
                {progressPercent}%
              </p>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">recovery complete</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount recovered</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                  {formatCurrency(recovery.recoveredAmount)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-medium text-muted-foreground">Total recovery</p>
                <p className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
                  {formatCurrency(recovery.totalAmount)}
                </p>
              </div>
            </div>
            <AnimatedProgress
              value={progressPercent}
              tone={progressTone}
              className="w-full"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricTile
              label="Remaining balance"
              value={formatCurrency(recovery.remainingBalance)}
              icon={CircleDollarSign}
            />
            <MetricTile
              label="Paid installments"
              value={String(paidCount)}
              icon={CheckCircle2}
            />
            <MetricTile
              label="Pending"
              value={String(pendingCount)}
              icon={Clock}
            />
            <MetricTile
              label="Overdue"
              value={String(overdueCount)}
              icon={AlertCircle}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function InstallmentRow({ installment }: { installment: RecoveryInstallment }) {
  const config = installmentStatusConfig[installment.status]
  const StatusIcon = config.icon
  const formattedDate = (() => {
    try {
      return format(parseISO(installment.date), 'dd MMM yyyy')
    } catch {
      return installment.date
    }
  })()

  return (
    <div
      className={cn(
        'flex items-center gap-4 border-l-[3px] px-4 py-3.5 transition-colors hover:bg-muted/30 sm:px-5',
        config.accent,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-bold tabular-nums text-foreground">
        {installment.installmentNumber}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {formatCurrency(installment.amount)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Due {formattedDate}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn('size-2 rounded-full', config.dot)} aria-hidden />
        <StatusPill
          label={config.label}
          variant={getVerificationStatusVariant(installment.status)}
          className="hidden sm:inline-flex"
        />
        <StatusIcon className="size-4 text-muted-foreground sm:hidden" aria-label={config.label} />
      </div>
    </div>
  )
}

function InstallmentSchedule({ installments }: { installments: RecoveryInstallment[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filteredInstallments = useMemo(() => {
    return installments.filter((inst) => {
      if (statusFilter !== 'all' && inst.status !== statusFilter) return false
      return matchesListSearch(search, [
        String(inst.installmentNumber),
        inst.status,
        inst.date,
        formatCurrency(inst.amount),
      ])
    })
  }, [installments, search, statusFilter])

  const counts = useMemo(
    () => ({
      all: installments.length,
      paid: installments.filter((i) => i.status === 'paid').length,
      pending: installments.filter((i) => i.status === 'pending').length,
      overdue: installments.filter((i) => i.status === 'overdue').length,
    }),
    [installments],
  )

  return (
    <motion.div variants={adminStaggerItem} className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Installment Schedule</h2>
          <p className="text-sm text-muted-foreground">
            {filteredInstallments.length} of {installments.length} installments shown
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search installments..."
            className="h-9 rounded-lg border-border/70 bg-background pl-9"
          />
        </div>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <TabsList className="h-auto w-full justify-start gap-1 rounded-xl border border-border/70 bg-muted/30 p-1 sm:w-auto">
          {(
            [
              { value: 'all', label: 'All' },
              { value: 'paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
            ] as const
          ).map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              {tab.label}
              <span className="ml-1.5 tabular-nums text-muted-foreground">
                ({counts[tab.value]})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {filteredInstallments.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No installments match your filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Try adjusting the search or status filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredInstallments.map((inst) => (
              <InstallmentRow key={inst.installmentNumber} installment={inst} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function RecoveryPage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''

  const { data: recovery, isLoading } = useQuery({
    queryKey: ['pensioner-recovery', pensionerId],
    queryFn: () => fetchRecoveryStatus(pensionerId),
    enabled: !!pensionerId,
  })

  if (isLoading) return <PageLoadingSkeleton />

  if (!recovery) {
    return (
      <PensionerPageShell>
        <motion.div variants={adminStaggerItem}>
          <PageHeader
            variant="admin"
            title="Recovery Status"
            description="Track your pension recovery case and installment schedule"
          />
        </motion.div>
        <motion.div variants={adminStaggerItem}>
          <EmptyState
            title="No active recovery case"
            description="You do not have any active pension recovery at this time."
          />
        </motion.div>
      </PensionerPageShell>
    )
  }

  return (
    <PensionerPageShell>
      <motion.div variants={adminStaggerItem}>
        <PageHeader
          variant="admin"
          title="Recovery Status"
          description="Track your pension recovery case and installment schedule"
        />
      </motion.div>

      <div className="space-y-6">
        <RecoveryOverview recovery={recovery} />
        <InstallmentSchedule installments={recovery.installments} />
      </div>
    </PensionerPageShell>
  )
}
