import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  IndianRupee,
  Plus,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  adminStaggerContainer,
} from '@/components/admin/shared/admin-analytics-ui'
import { AdminDashboardShell } from '@/components/admin/shared/admin-dashboard-shell'
import { adminTableStyles } from '@/components/admin/shared/admin-table-styles'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { RecoveryProgressBar } from '@/components/recovery/recovery-progress-bar'
import { RecoveryStatusBadge } from '@/components/recovery/recovery-status-badge'
import { useRecoveryPortal } from '@/components/recovery/recovery-portal-context'
import { Button } from '@/components/ui/button'
import {
  fetchMonthlyRecoveryCollection,
  fetchOutstandingByDepartment,
  fetchRecoveryCases,
  fetchRecoveryCasesByDepartment,
  fetchRecoveryCollectionTrend,
  fetchRecoveryDashboardStats,
  fetchRecoveryFinancialOverview,
  fetchRecoveryStatusChart,
} from '@/data/recovery-api'
import { formatRecoveryCurrency } from '@/lib/recovery'
import { cn } from '@/lib/utils'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#06b6d4']

export function RecoveryDashboardPage() {
  const navigate = useNavigate()
  const { basePath, permissions, role } = useRecoveryPortal()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['recovery-dashboard-stats'],
    queryFn: fetchRecoveryDashboardStats,
  })

  const { data: financial } = useQuery({
    queryKey: ['recovery-financial-overview'],
    queryFn: fetchRecoveryFinancialOverview,
  })

  const { data: statusChart } = useQuery({
    queryKey: ['recovery-status-chart'],
    queryFn: fetchRecoveryStatusChart,
  })

  const { data: monthlyCollection } = useQuery({
    queryKey: ['recovery-monthly-collection'],
    queryFn: fetchMonthlyRecoveryCollection,
  })

  const { data: collectionTrend } = useQuery({
    queryKey: ['recovery-collection-trend'],
    queryFn: fetchRecoveryCollectionTrend,
  })

  const { data: outstandingChart } = useQuery({
    queryKey: ['recovery-outstanding-chart'],
    queryFn: fetchOutstandingByDepartment,
  })

  const { data: casesByDepartment } = useQuery({
    queryKey: ['recovery-cases-by-department'],
    queryFn: fetchRecoveryCasesByDepartment,
  })

  const { data: cases } = useQuery({
    queryKey: ['recovery-cases'],
    queryFn: fetchRecoveryCases,
  })

  if (statsLoading || !stats || !financial) return <PageLoadingSkeleton />

  const statusDonutData =
    statusChart?.map((item, i) => ({
      name: item.label,
      value: item.count,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })) ?? []

  const portalLabel = role === 'accounts' ? 'Accounts' : 'Recovery'
  const collectionSparkline = monthlyCollection?.map((item) => item.collected) ?? []
  const currentMonthCollection = monthlyCollection?.at(-1)?.collected ?? 0
  const previousMonthCollection = monthlyCollection?.at(-2)?.collected ?? 0
  const collectionMom =
    previousMonthCollection > 0
      ? Math.round(((currentMonthCollection - previousMonthCollection) / previousMonthCollection) * 100)
      : 0
  const topOutstandingDept = outstandingChart?.[0]
  const recentCases = [...(cases ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
  const overdueCount =
    cases?.reduce(
      (sum, c) => sum + c.installments.filter((inst) => inst.status === 'overdue').length,
      0,
    ) ?? 0

  return (
    <AdminDashboardShell>
      <motion.div variants={adminStaggerContainer} initial="hidden" animate="show">
        <PageHeader
          variant="admin"
          title="Dashboard"
          description={
            role === 'accounts'
              ? 'Monitor disbursements, recovery collections, and outstanding balances'
              : 'Monitor excess pension recovery cases, collections, and outstanding balances'
          }
          className="mb-6"
          action={
            permissions.canCreate ? (
              <Button className="rounded-lg px-5" onClick={() => navigate({ href: `${basePath}/cases/create` })}>
                <Plus className="mr-1.5 size-4" />
                Create case
              </Button>
            ) : undefined
          }
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminHeroMetric
            label="Total Recovery Cases"
            value={stats.totalCases}
            hint="All recovery cases in system"
            icon={ClipboardList}
            iconTone="blue"
            sparklineData={collectionSparkline}
            delay={0.05}
          />
          <AdminHeroMetric
            label="Active Recovery"
            value={stats.activeCases}
            hint="Currently recovering"
            icon={TrendingUp}
            iconTone="green"
            sparklineData={collectionSparkline}
            delay={0.1}
          />
          <AdminHeroMetric
            label="Recovery Completed"
            value={stats.completedCases}
            hint="Fully recovered"
            icon={CheckCircle2}
            iconTone="teal"
            sparklineData={collectionSparkline}
            delay={0.15}
          />
          <AdminHeroMetric
            label="Pending Approvals"
            value={stats.pendingApprovals}
            hint="Awaiting approval"
            icon={Clock}
            iconTone="amber"
            sparklineData={collectionSparkline}
            delay={0.2}
          />
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-5">
          <AdminChartCard
            title="Financial Overview"
            description="Total recoverable amount and collection progress"
            icon={IndianRupee}
            tone="violet"
            className="lg:col-span-2"
            delay={0.22}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Total recoverable</p>
                <p className="mt-1 text-lg font-bold tabular-nums">
                  {formatRecoveryCurrency(financial.totalRecoverableAmount)}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Recovered</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600">
                  {formatRecoveryCurrency(financial.totalRecoveredAmount)}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-rose-600">
                  {formatRecoveryCurrency(financial.outstandingAmount)}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <RecoveryProgressBar
                recoveredAmount={financial.totalRecoveredAmount}
                totalAmount={financial.totalRecoverableAmount}
              />
            </div>
          </AdminChartCard>

          <AdminChartCard
            title="Collection Trend"
            description="Monthly collections and cumulative recovery (2026)"
            icon={TrendingUp}
            tone="green"
            className="lg:col-span-3"
            delay={0.25}
          >
            <AdminAnimatedLineChart
              data={(collectionTrend ?? []).map((item) => ({
                month: item.month,
                collected: item.collected,
                cumulative: item.cumulative,
              }))}
              series={[
                { dataKey: 'collected', name: 'Monthly', color: '#10b981' },
                { dataKey: 'cumulative', name: 'Cumulative', color: '#3b82f6' },
              ]}
              animationDelay={0.25}
            />
          </AdminChartCard>
        </div>

        <AdminSectionHeading
          title={`${portalLabel} snapshot`}
          description="Key recovery metrics at a glance"
        />
        <AdminHorizontalMarquee duration={30} icon3d className="mb-8">
          <AdminStatChip
            label="Recovery rate"
            value={`${financial.recoveryRatePercent}%`}
            icon={TrendingUp}
            iconTone="green"
          />
          <AdminStatChip
            label="Jun collection"
            value={formatRecoveryCurrency(currentMonthCollection)}
            icon={IndianRupee}
            iconTone="blue"
          />
          <AdminStatChip
            label="Month-on-month"
            value={`${collectionMom >= 0 ? '+' : ''}${collectionMom}%`}
            icon={BarChart3}
            iconTone={collectionMom >= 0 ? 'green' : 'rose'}
          />
          <AdminStatChip
            label="Overdue installments"
            value={overdueCount}
            icon={Clock}
            iconTone="amber"
          />
          {topOutstandingDept && (
            <AdminStatChip
              label={`Top outstanding · ${topOutstandingDept.department}`}
              value={formatRecoveryCurrency(topOutstandingDept.outstanding)}
              icon={Wallet}
              iconTone="rose"
            />
          )}
        </AdminHorizontalMarquee>

        <div className="mb-8 grid gap-4 lg:grid-cols-5">
          <AdminChartCard
            title="Recovery Status Distribution"
            description="Cases by current status"
            icon={ClipboardList}
            tone="blue"
            className="lg:col-span-2"
            delay={0.28}
          >
            <AdminStyledDonutChart data={statusDonutData} animationDelay={0.28} />
          </AdminChartCard>

          <AdminChartCard
            title="Monthly Recovery Collection"
            description="Amount collected per month (2026)"
            icon={IndianRupee}
            tone="green"
            className="lg:col-span-3"
            delay={0.3}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCollection ?? []} barCategoryGap="18%">
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
                    width={48}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE.contentStyle}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }}
                    formatter={(value) => [formatRecoveryCurrency(Number(value ?? 0)), 'Collected']}
                  />
                  <Bar dataKey="collected" fill="#10b981" radius={[10, 10, 0, 0]} maxBarSize={42} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminChartCard>

          <AdminChartCard
            title="Cases by Department"
            description="Active vs completed cases across departments"
            icon={BarChart3}
            tone="blue"
            className="lg:col-span-3"
            delay={0.32}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={casesByDepartment ?? []} barCategoryGap="18%">
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
                  <XAxis
                    dataKey="department"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  />
                  <Bar dataKey="active" name="Active" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={36} stackId="cases" />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} stackId="cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminChartCard>

          <AdminChartCard
            title="Outstanding Recovery Amount"
            description="Outstanding balance by department"
            icon={Wallet}
            tone="rose"
            className="lg:col-span-2"
            delay={0.34}
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outstandingChart ?? []} layout="vertical" barCategoryGap="18%">
                  <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="rgba(148, 163, 184, 0.18)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="department"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    width={100}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE.contentStyle}
                    cursor={{ fill: 'rgba(244, 63, 94, 0.06)' }}
                    formatter={(value) => [formatRecoveryCurrency(Number(value ?? 0)), 'Outstanding']}
                  />
                  <Bar dataKey="outstanding" fill="#f43f5e" radius={[0, 10, 10, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminChartCard>
        </div>

        <AdminChartCard
          title="Recent Recovery Cases"
          description="Latest updated cases across all departments"
          icon={ClipboardList}
          tone="green"
          className="mb-8"
          delay={0.36}
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" onClick={() => navigate({ href: `${basePath}/cases` })}>
              View all
              <ChevronRight className="ml-0.5 size-4" />
            </Button>
          }
        >
          <div className={cn(adminTableStyles.wrap, 'admin-table-colored rounded-2xl')}>
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className={adminTableStyles.headerRow}>
                  <th className={adminTableStyles.headCell}>Case ID</th>
                  <th className={adminTableStyles.headCell}>Pensioner</th>
                  <th className={adminTableStyles.headCell}>Department</th>
                  <th className={adminTableStyles.headCell}>Outstanding</th>
                  <th className={adminTableStyles.headCell}>Progress</th>
                  <th className={adminTableStyles.headCell}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((item) => {
                  const progress =
                    item.calculation.remainingAmount > 0
                      ? Math.round(
                          (item.calculation.recoveredAmount / item.calculation.remainingAmount) * 100,
                        )
                      : 0
                  return (
                    <tr
                      key={item.id}
                      className={cn(adminTableStyles.bodyRow, 'cursor-pointer')}
                      onClick={() => navigate({ href: `${basePath}/cases/${item.id}` })}
                    >
                      <td className={cn(adminTableStyles.bodyCell, 'font-mono text-xs font-medium')}>
                        {item.id}
                      </td>
                      <td className={adminTableStyles.bodyCell}>{item.pensionerName}</td>
                      <td className={adminTableStyles.bodyCell}>{item.department.replace(/ Department$/, '')}</td>
                      <td className={cn(adminTableStyles.bodyCell, 'tabular-nums font-medium')}>
                        {formatRecoveryCurrency(item.calculation.outstandingBalance)}
                      </td>
                      <td className={adminTableStyles.bodyCell}>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">{progress}%</span>
                        </div>
                      </td>
                      <td className={adminTableStyles.bodyCell}>
                        <RecoveryStatusBadge status={item.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </AdminChartCard>

        <AdminSectionHeading
          title="Quick actions"
          description="Frequently used recovery tasks"
          action={
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate({ href: `${basePath}/cases` })}>
              View all cases
              <ChevronRight className="ml-0.5 size-4" />
            </Button>
          }
        />
        <AdminHorizontalMarquee duration={34}>
          {[
            { label: 'All Cases', href: `${basePath}/cases`, icon: ClipboardList },
            ...(permissions.canCreate
              ? [{ label: 'Create Case', href: `${basePath}/cases/create`, icon: Plus }]
              : []),
            { label: 'Documents', href: `${basePath}/documents`, icon: Wallet },
          ].map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto shrink-0 justify-start gap-3 rounded-lg border-border bg-card px-4 py-3 hover:bg-muted/40"
              onClick={() => navigate({ href: action.href })}
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <action.icon className="size-4" />
              </span>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </AdminHorizontalMarquee>
      </motion.div>
    </AdminDashboardShell>
  )
}
