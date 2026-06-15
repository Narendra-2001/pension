import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  IndianRupee,
  MessageSquare,
  PieChart,
  Shield,
  ShieldAlert,
  Upload,
  Users,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  AdminAnimatedLineChart,
  AdminChartCard,
  AdminHeroMetric,
  AdminHorizontalMarquee,
  AdminSectionHeading,
  AdminStatChip,
  AdminStyledDonutChart,
  CHART_TOOLTIP_STYLE,
} from '@/components/admin/shared/admin-analytics-ui'
import { adminTableStyles } from '@/components/admin/shared/admin-table-styles'
import { AdminDashboardShell } from '@/components/admin/shared/admin-dashboard-shell'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PensionerProfileBanner } from '@/components/pensioner/shared/pensioner-profile-banner'
import { getVerificationStatusVariant, StatusPill } from '@/components/pensioner/shared/status-pill'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchPensionerDashboard } from '@/data/pensioner-api'
import { formatCurrency } from '@/data/pensioner-mock-data'
import { fetchPensionerActiveSuspension } from '@/data/suspension-api'
import {
  GRIEVANCE_CATEGORY_LABELS,
  GRIEVANCE_STATUS_LABELS,
} from '@/lib/grievance'
import { useAuth } from '@/providers/auth-provider'
import { sparklinePattern } from '@/lib/sparkline-data'
import { cn } from '@/lib/utils'

const quickActions = [
  { label: 'Submit Life Certificate', href: '/pensioner/verification/start', icon: Shield },
  { label: 'View Pension Details', href: '/pensioner/pension', icon: Wallet },
  { label: 'Download Statement', href: '/pensioner/statements', icon: Download },
  { label: 'Upload Documents', href: '/pensioner/documents', icon: Upload },
  { label: 'Raise Grievance', href: '/pensioner/grievance/raise', icon: MessageSquare },
  { label: 'Notifications', href: '/pensioner/notifications', icon: Bell },
]

const statementStatusStyles = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  failed: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
} as const

const neftStatusBarColors = {
  paid: '#10b981',
  pending: '#f59e0b',
  failed: '#f43f5e',
} as const

function formatChartCurrency(value: number) {
  return formatCurrency(value)
}

const deductionsTrendSeries = [
  { dataKey: 'recoveryAmount', name: 'Recovery', color: '#f59e0b' },
  { dataKey: 'deductions', name: 'Deductions', color: '#f43f5e' },
] as const

function formatNotificationTime(timestamp: string) {
  try {
    return format(parseISO(timestamp), 'dd MMM yyyy, hh:mm a')
  } catch {
    return timestamp
  }
}

export function PensionerDashboardPage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''

  const { data, isLoading } = useQuery({
    queryKey: ['pensioner-dashboard', pensionerId],
    queryFn: () => fetchPensionerDashboard(pensionerId),
    enabled: !!pensionerId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const { data: suspensionCase } = useQuery({
    queryKey: ['pensioner-active-suspension', pensionerId],
    queryFn: () => fetchPensionerActiveSuspension(pensionerId),
    enabled: !!pensionerId,
  })

  if (isLoading || !data) {
    return (
      <div className="admin-dashboard-page">
        <Skeleton className="mb-2 h-10 w-48 rounded-2xl" />
        <Skeleton className="mb-8 h-5 w-72 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const {
    summary,
    record,
    recovery,
    recentStatements,
    pensionTrend,
    neftMonthlyChart,
    recentNotifications,
    unreadNotificationCount,
    openGrievances,
    verificationHistory,
  } = data

  const isVerificationRejected =
    data.lifeCertStatus === 'rejected' || !!data.rejectionReason
  const isSuspended =
    record.status === 'suspended' ||
    (!!suspensionCase && suspensionCase.status !== 'restored')

  const pensionSparkline =
    pensionTrend.length >= 2 ? pensionTrend : sparklinePattern('trendUp')

  const recoveryProgress = recovery
    ? Math.round((recovery.recoveredAmount / Math.max(recovery.totalAmount, 1)) * 100)
    : 0

  const latestNeftMonth = neftMonthlyChart.at(-1)
  const grossVsNetPieData = latestNeftMonth
    ? [
        { name: 'Net credited', value: latestNeftMonth.netAmount, fill: '#3b82f6' },
        { name: 'Recovery', value: latestNeftMonth.recoveryAmount, fill: '#f59e0b' },
        { name: 'Deductions', value: latestNeftMonth.deductions, fill: '#f43f5e' },
      ]
    : []

  return (
    <AdminDashboardShell>
      {isSuspended && suspensionCase && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card mb-6 overflow-hidden border-destructive/30 bg-destructive/5"
        >
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <ShieldAlert className="size-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-destructive">Your pension has been suspended.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {suspensionCase.suspensionReason} · Suspended on {suspensionCase.suspensionDate}
                  </p>
                </div>
              </div>
              <Button className="shrink-0 rounded-lg" asChild>
                <Link to="/pensioner/suspension/restoration">Submit Restoration Request</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isVerificationRejected && data.rejectionReason && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-card mb-6 overflow-hidden border-destructive/30 bg-destructive/5"
        >
          <Card className="border-0 bg-transparent shadow-none">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                  <AlertTriangle className="size-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-destructive">Life Certificate Rejected</p>
                  <p className="mt-1 text-sm text-muted-foreground">{data.rejectionReason}</p>
                </div>
              </div>
              <Button className="shrink-0 rounded-lg" asChild>
                <Link to="/pensioner/verification/start" search={{ mode: 'resubmit' }}>
                  Resubmit Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <PageHeader
        variant="admin"
        title="Dashboard"
        description={`Pension account for ${record.service.ppoNumber} · ${record.service.department}`}
        className="mb-6"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminHeroMetric
          label="Current Pension Amount"
          value={formatCurrency(summary.currentPensionAmount)}
          hint={`Gross ${formatCurrency(record.pension.grossPension)} · Net monthly`}
          icon={Wallet}
          iconTone="blue"
          sparklineData={pensionSparkline}
          delay={0.05}
        />
        <AdminHeroMetric
          label="Verification Status"
          value={summary.verificationStatus}
          hint={
            isVerificationRejected
              ? 'Action required — resubmit life certificate'
              : `Due: ${summary.nextVerificationDueDate}`
          }
          icon={Shield}
          iconTone={isVerificationRejected ? 'rose' : 'green'}
          sparklineData={sparklinePattern('wave')}
          delay={0.1}
        />
        <AdminHeroMetric
          label="Recovery Balance"
          value={recovery ? formatCurrency(recovery.remainingBalance) : 'None'}
          hint={
            recovery
              ? `${recovery.installmentsPaid} paid · ${recovery.installmentsRemaining} remaining`
              : 'No active recovery case'
          }
          icon={AlertTriangle}
          iconTone={recovery ? 'amber' : 'green'}
          sparklineData={recovery ? sparklinePattern('decline') : sparklinePattern('subtle')}
          delay={0.15}
        />
        <AdminHeroMetric
          label="Nominee"
          value={record.nominee?.relationship ?? 'N/A'}
          hint={record.nominee?.nomineeName ?? 'No nominee on record'}
          icon={Users}
          iconTone="violet"
          sparklineData={sparklinePattern('subtle')}
          delay={0.2}
        />
      </div>

      <PensionerProfileBanner
        user={user}
        name={user?.name ?? 'Pensioner'}
        summary={{
          ...summary,
          department: record.service.department,
          designation: record.service.designation,
          officeName: record.service.officeName,
        }}
        delay={0.25}
      />

      <AdminSectionHeading title="Account snapshot" description="Live data from your pension account" />
      <AdminHorizontalMarquee duration={32} icon3d className="mb-8">
        <AdminStatChip label="Monthly pension" value={formatCurrency(summary.currentPensionAmount)} icon={Wallet} iconTone="blue" />
        <AdminStatChip label="Bank account" value={`****${record.bank.accountNumber.slice(-4)}`} icon={FileText} iconTone="teal" />
        <AdminStatChip label="Unread alerts" value={unreadNotificationCount} icon={Bell} iconTone="amber" />
        <AdminStatChip label="Open tickets" value={openGrievances.length} icon={MessageSquare} iconTone="violet" />
        <AdminStatChip
          label="Recovery"
          value={recovery ? formatCurrency(recovery.remainingBalance) : 'None'}
          icon={AlertTriangle}
          iconTone="rose"
        />
        <AdminStatChip label="Verification due" value={summary.nextVerificationDueDate} icon={Shield} iconTone="green" />
      </AdminHorizontalMarquee>

      <AdminSectionHeading
        title="NEFT disbursements"
        description="Monthly pension credits and deduction breakdown via bank transfer"
      />
      <div className="mb-8 grid gap-4 lg:grid-cols-5">
        <AdminChartCard
          title="Monthly NEFT Credits"
          description={`Net amount credited to ****${record.bank.accountNumber.slice(-4)}`}
          icon={IndianRupee}
          tone="green"
          className="lg:col-span-3"
          delay={0.28}
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
              <Link to="/pensioner/statements">
                View statements
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </Button>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={neftMonthlyChart} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE.contentStyle}
                  cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                  labelFormatter={(_, payload) => payload[0]?.payload?.monthLabel ?? ''}
                  formatter={(value) => [formatChartCurrency(Number(value ?? 0)), 'Net credited']}
                />
                <Bar dataKey="netAmount" radius={[10, 10, 0, 0]} maxBarSize={42}>
                  {neftMonthlyChart.map((entry) => (
                    <Cell key={entry.monthLabel} fill={neftStatusBarColors[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Paid
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              Pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500" />
              Failed
            </span>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Gross vs Net NEFT"
          description={
            latestNeftMonth
              ? `${latestNeftMonth.monthLabel} — gross split into net credit and deductions`
              : 'Gross pension split into net credit and deductions'
          }
          icon={PieChart}
          tone="blue"
          className="lg:col-span-2"
          delay={0.3}
        >
          {grossVsNetPieData.length > 0 ? (
            <AdminStyledDonutChart
              data={grossVsNetPieData}
              centerLabel="Gross"
              animationDelay={0.3}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No NEFT data available yet.
            </p>
          )}
        </AdminChartCard>

        <AdminChartCard
          title="Monthly Deductions Breakdown"
          description="Recovery installments and statutory deductions trend over time"
          icon={Wallet}
          tone="amber"
          className="lg:col-span-5"
          delay={0.32}
        >
          <AdminAnimatedLineChart
            data={neftMonthlyChart as unknown as Record<string, string | number>[]}
            series={[...deductionsTrendSeries]}
            animationDelay={0.32}
          />
        </AdminChartCard>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-5">
        <AdminChartCard
          title="Recent Pension Payments"
          description="Monthly disbursement history from your account"
          icon={Wallet}
          tone="blue"
          className="lg:col-span-3"
          delay={0.3}
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
              <Link to="/pensioner/statements">
                View all
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </Button>
          }
        >
          <div className={cn(adminTableStyles.wrap, 'admin-table-colored rounded-2xl')}>
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className={adminTableStyles.headerRow}>
                  <th className={adminTableStyles.headCell}>Month</th>
                  <th className={adminTableStyles.headCell}>Gross</th>
                  <th className={adminTableStyles.headCell}>Recovery</th>
                  <th className={adminTableStyles.headCell}>Net paid</th>
                  <th className={adminTableStyles.headCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentStatements.map((statement) => (
                  <tr key={statement.id} className={adminTableStyles.bodyRow}>
                    <td className={cn(adminTableStyles.bodyCell, 'font-medium')}>{statement.month}</td>
                    <td className={adminTableStyles.bodyCell}>{formatCurrency(statement.grossPension)}</td>
                    <td className={adminTableStyles.bodyCell}>{formatCurrency(statement.recoveryAmount)}</td>
                    <td className={cn(adminTableStyles.bodyCell, 'font-medium tabular-nums')}>
                      {formatCurrency(statement.netPension)}
                    </td>
                    <td className={adminTableStyles.bodyCell}>
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
                          statementStatusStyles[statement.status],
                        )}
                      >
                        {statement.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Notifications"
          description={`${unreadNotificationCount} unread alert${unreadNotificationCount === 1 ? '' : 's'}`}
          icon={Bell}
          tone="amber"
          className="lg:col-span-2"
          delay={0.32}
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
              <Link to="/pensioner/notifications">
                View all
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </Button>
          }
        >
          <div className="space-y-3">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'rounded-xl border p-3',
                  notification.read ? 'border-border/50 bg-muted/20' : 'border-sky-200/60 bg-sky-50/40 dark:border-sky-800/40 dark:bg-sky-950/20',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{notification.title}</p>
                  {!notification.read && (
                    <span className="size-2 shrink-0 rounded-full bg-sky-500" aria-label="Unread" />
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {formatNotificationTime(notification.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </AdminChartCard>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="Open Grievance Tickets"
          description={`${openGrievances.length} active ticket${openGrievances.length === 1 ? '' : 's'} on your account`}
          icon={MessageSquare}
          tone="violet"
          delay={0.35}
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
              <Link to="/pensioner/grievance/tickets">
                View tickets
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </Button>
          }
        >
          {openGrievances.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No open grievance tickets. Raise a ticket if you need support.
            </p>
          ) : (
            <div className="space-y-3">
              {openGrievances.map((ticket) => (
                <Link
                  key={ticket.id}
                  to="/pensioner/grievance/$id"
                  params={{ id: ticket.id }}
                  className="block rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] text-muted-foreground">{ticket.id}</p>
                      <p className="mt-1 text-sm font-medium">{ticket.subject}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {GRIEVANCE_CATEGORY_LABELS[ticket.category]}
                      </p>
                    </div>
                    <StatusPill
                      label={GRIEVANCE_STATUS_LABELS[ticket.status]}
                      variant={ticket.slaBreached ? 'danger' : 'warning'}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </AdminChartCard>

        <AdminChartCard
          title="Verification History"
          description="Life certificate submissions on your record"
          icon={Shield}
          tone="green"
          delay={0.38}
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
              <Link to="/pensioner/verification">
                Manage verification
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </Button>
          }
        >
          {verificationHistory.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              No verification history yet. Submit your life certificate to begin.
            </p>
          ) : (
            <div className="space-y-3">
              {verificationHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-4"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
                    <Shield className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium capitalize">{entry.method}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted {entry.submittedAt}
                      {entry.remarks ? ` · ${entry.remarks}` : ''}
                    </p>
                  </div>
                  <StatusPill
                    label={entry.status.replace('_', ' ')}
                    variant={getVerificationStatusVariant(entry.status)}
                  />
                </div>
              ))}
            </div>
          )}
        </AdminChartCard>
      </div>

      {recovery && (
        <AdminChartCard
          title="Active Recovery Case"
          description={`Case ${recovery.caseId} · ${recovery.reason}`}
          icon={ClipboardList}
          tone="rose"
          delay={0.4}
          className="mb-8"
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
              <Link to="/pensioner/recovery">
                View recovery
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Total recoverable</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{formatCurrency(recovery.totalAmount)}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Recovered</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600">
                {formatCurrency(recovery.recoveredAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Outstanding</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-rose-600">
                {formatCurrency(recovery.remainingBalance)}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">Expected completion</p>
              <p className="mt-1 text-sm font-semibold">{recovery.expectedCompletionDate ?? '—'}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Recovery progress</span>
              <span>{recoveryProgress}% complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${recoveryProgress}%` }}
              />
            </div>
          </div>
        </AdminChartCard>
      )}

      <AdminSectionHeading
        title="Quick actions"
        description="Frequently used self-service tasks"
      />
      <AdminHorizontalMarquee duration={34} className="mb-2">
        {quickActions.map((action) => (
          <Button
            key={action.href}
            variant="outline"
            className="h-auto shrink-0 justify-start gap-3 rounded-lg border-border bg-card px-4 py-3 hover:bg-muted/40"
            asChild
          >
            <Link to={action.href}>
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <action.icon className="size-4" />
              </span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          </Button>
        ))}
      </AdminHorizontalMarquee>
    </AdminDashboardShell>
  )
}
