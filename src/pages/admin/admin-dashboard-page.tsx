import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  IndianRupee,
  PieChart as PieChartIcon,
  Plus,
  Skull,
  TrendingUp,
  Upload,
  UserCheck,
  UserPen,
  Users,
  UserX,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  AdminOnboardingInsights,
  AdminSectionHeading,
  AdminStatChip,
  AdminStyledDonutChart,
  AdminVerticalMarquee,
  CHART_TOOLTIP_STYLE,
  adminStaggerContainer,
} from '@/components/admin/shared/admin-analytics-ui'
import { ActivityTimeline } from '@/components/admin/shared/activity-timeline'
import { adminTableStyles } from '@/components/admin/shared/admin-table-styles'
import { PageHeader } from '@/components/admin/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchDashboardStats } from '@/data/admin-api'
import { fetchPendingAdminTaskCount } from '@/data/admin-tasks-api'
import type { PensionApplicationStatus } from '@/types/pensioner'
import { cn } from '@/lib/utils'
import { sparklinePattern } from '@/lib/sparkline-data'

const applicationStatusStyles: Record<PensionApplicationStatus, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboardStats,
  })

  const { data: pendingTasks } = useQuery({
    queryKey: ['pending-admin-task-count'],
    queryFn: fetchPendingAdminTaskCount,
  })

  const stats = data?.stats
  const activeRate = stats
    ? Math.round((stats.activePensioners / Math.max(stats.totalPensioners, 1)) * 100)
    : 0

  const statusDonutData = stats
    ? [
        { name: 'Active', value: stats.activePensioners, fill: '#6d28d9' },
        { name: 'Suspended', value: stats.suspendedPensioners, fill: '#38bdf8' },
      ]
    : []

  const verificationDonutData = data?.verificationOverview.map((item, index) => ({
    ...item,
    fill: ['#10b981', '#3b82f6', '#c4b5fd'][index] ?? item.fill,
  })) ?? []

  if (isLoading) {
    return (
      <div className="admin-dashboard-page">
        <Skeleton className="mb-2 h-10 w-48 rounded-2xl" />
        <Skeleton className="mb-8 h-5 w-72 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
        <Skeleton className="my-6 h-14 rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-80 rounded-xl lg:col-span-3" />
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="mt-6 h-96 rounded-xl" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  const onboardingYtd = data!.monthlyOnboarding.reduce((sum, item) => sum + item.count, 0)
  const onboardingCurrentMonth = data!.monthlyOnboarding.at(-1)!
  const onboardingPreviousMonth = data!.monthlyOnboarding.at(-2)!
  const onboardingAvg = Math.round(onboardingYtd / data!.monthlyOnboarding.length)
  const onboardingPeak = data!.monthlyOnboarding.reduce((best, item) =>
    item.count > best.count ? item : best,
  )
  const onboardingMom = Math.round(
    ((onboardingCurrentMonth.count - onboardingPreviousMonth.count) / onboardingPreviousMonth.count) *
      100,
  )
  const topOnboardingDept = data!.onboardingTopDepartments[0]

  return (
    <motion.div
      className="admin-dashboard-page"
      variants={adminStaggerContainer}
      initial="hidden"
      animate="show"
    >
      <PageHeader
        variant="admin"
        title="Dashboard"
        description="Overview of pension management"
        className="mb-6"
        action={
          <Button className="rounded-lg px-5" asChild>
            <Link to="/admin/pensioners/add">
              <Plus className="mr-1.5 size-4" />
              Add pensioner
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <AdminHeroMetric
          label="Total Pensioners"
          value={stats!.totalPensioners.toLocaleString('en-IN')}
          trend="+6% this month"
          icon={Users}
          iconTone="blue"
          sparklineData={sparklinePattern('trendUp')}
          delay={0.05}
        />
        <AdminHeroMetric
          label="Active Pensioners"
          value={stats!.activePensioners.toLocaleString('en-IN')}
          hint={`${activeRate}% of total`}
          icon={UserCheck}
          iconTone="green"
          sparklineData={sparklinePattern('trendUpAlt')}
          delay={0.1}
        />
        <AdminHeroMetric
          label="Pending Activations"
          value={stats!.pendingActivations.toLocaleString('en-IN')}
          hint="Awaiting SMS activation"
          icon={Activity}
          iconTone="amber"
          sparklineData={sparklinePattern('wave')}
          delay={0.15}
        />
        <AdminHeroMetric
          label="Pending Verifications"
          value={stats!.pendingVerifications.toLocaleString('en-IN')}
          hint="Life certificates to review"
          icon={CheckCircle2}
          iconTone="violet"
          sparklineData={sparklinePattern('moderate')}
          delay={0.2}
        />
        <AdminHeroMetric
          label="Work Queue"
          value={(pendingTasks ?? 0).toLocaleString('en-IN')}
          hint="Pending tasks across all types"
          icon={ClipboardList}
          iconTone="teal"
          sparklineData={sparklinePattern('subtle')}
          delay={0.25}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      <AdminSectionHeading
        title="Status snapshot"
        description="Current pensioner status across the system"
      />
      <AdminHorizontalMarquee duration={32} icon3d className="mb-8">
        <AdminStatChip
          label="Active"
          value={stats!.activePensioners.toLocaleString('en-IN')}
          icon={UserCheck}
          iconTone="green"
        />
        <AdminStatChip
          label="Pending activations"
          value={stats!.pendingActivations}
          icon={Activity}
          iconTone="amber"
        />
        <AdminStatChip
          label="Pending verifications"
          value={stats!.pendingVerifications}
          icon={CheckCircle2}
          iconTone="violet"
        />
        <AdminStatChip
          label="Suspended"
          value={stats!.suspendedPensioners}
          icon={UserX}
          iconTone="rose"
        />
        <AdminStatChip
          label="Deceased"
          value={stats!.deceasedPensioners}
          icon={Skull}
          iconTone="slate"
        />
        <AdminStatChip
          label="Total"
          value={stats!.totalPensioners.toLocaleString('en-IN')}
          icon={Users}
          iconTone="blue"
        />
      </AdminHorizontalMarquee>

      <div className="mb-8 grid gap-4 lg:grid-cols-5">
        <AdminChartCard
          title="Pensioners by Department"
          description="Distribution across government departments"
          icon={BarChart3}
          tone="blue"
          className="lg:col-span-3"
          delay={0.2}
          action={
            <Select defaultValue="year">
              <SelectTrigger className="h-8 w-[7.5rem] rounded-full border-border/50 bg-muted/40 text-xs shadow-none">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data!.pensionersByDepartment} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-24}
                  textAnchor="end"
                  height={56}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }} />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[10, 10, 0, 0]}
                  maxBarSize={42}
                  animationBegin={200}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Pensioners by Status"
          description="Active vs suspended overview"
          icon={PieChartIcon}
          tone="green"
          className="lg:col-span-2"
          delay={0.25}
        >
          <AdminStyledDonutChart data={statusDonutData} animationDelay={0.25} />
        </AdminChartCard>
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="Full Status Distribution"
          description="Monthly status changes across pensioners"
          icon={TrendingUp}
          tone="blue"
          delay={0.35}
        >
          <AdminAnimatedLineChart
            data={data!.statusDistributionTrend}
            series={[...data!.statusDistributionSeries]}
            animationDelay={0.35}
          />
        </AdminChartCard>

        <AdminChartCard
          title="Verification Overview"
          description="Approved, pending, and rejected cases"
          icon={CheckCircle2}
          tone="green"
          delay={0.38}
        >
          <AdminStyledDonutChart data={verificationDonutData} animationDelay={0.38} />
        </AdminChartCard>
      </div>

      <AdminSectionHeading
        title="Onboarding snapshot"
        description="Registration metrics rolling through the year"
      />
      <AdminVerticalMarquee duration={24} icon3d>
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <AdminStatChip
            className="min-w-0 w-full"
            label="YTD total"
            value={onboardingYtd.toLocaleString('en-IN')}
            icon={Users}
            iconTone="blue"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label={`${onboardingCurrentMonth.month} registrations`}
            value={onboardingCurrentMonth.count}
            icon={TrendingUp}
            iconTone="green"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Monthly average"
            value={onboardingAvg}
            icon={Activity}
            iconTone="violet"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Peak month"
            value={`${onboardingPeak.month} · ${onboardingPeak.count}`}
            icon={BarChart3}
            iconTone="amber"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Pending verifications"
            value={stats!.pendingVerifications}
            icon={CheckCircle2}
            iconTone="violet"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Suspended"
            value={stats!.suspendedPensioners}
            icon={UserX}
            iconTone="rose"
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <AdminStatChip
            className="min-w-0 w-full"
            label="Direct registration"
            value={data!.onboardingChannelBreakdown[0].count}
            icon={UserCheck}
            iconTone="blue"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Bulk import"
            value={data!.onboardingChannelBreakdown[1].count}
            icon={Upload}
            iconTone="violet"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Department referral"
            value={data!.onboardingChannelBreakdown[2].count}
            icon={ClipboardList}
            iconTone="teal"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Month-on-month"
            value={`${onboardingMom >= 0 ? '+' : ''}${onboardingMom}%`}
            icon={TrendingUp}
            iconTone={onboardingMom >= 0 ? 'green' : 'rose'}
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label={data!.onboardingTopDepartments[1].department}
            value={data!.onboardingTopDepartments[1].count}
            icon={Users}
            iconTone="green"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label={data!.onboardingTopDepartments[2].department}
            value={data!.onboardingTopDepartments[2].count}
            icon={Users}
            iconTone="amber"
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <AdminStatChip
            className="min-w-0 w-full"
            label="Top department"
            value={`${topOnboardingDept.department} · ${topOnboardingDept.count}`}
            icon={Users}
            iconTone="blue"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Pending activations"
            value={stats!.pendingActivations}
            icon={Activity}
            iconTone="amber"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Active pensioners"
            value={stats!.activePensioners.toLocaleString('en-IN')}
            icon={UserCheck}
            iconTone="green"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Total pensioners"
            value={stats!.totalPensioners.toLocaleString('en-IN')}
            icon={Users}
            iconTone="slate"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label="Deceased"
            value={stats!.deceasedPensioners}
            icon={Skull}
            iconTone="slate"
          />
          <AdminStatChip
            className="min-w-0 w-full"
            label={data!.onboardingTopDepartments[3].department}
            value={data!.onboardingTopDepartments[3].count}
            icon={Users}
            iconTone="rose"
          />
        </div>
      </AdminVerticalMarquee>

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <AdminChartCard
          title="Monthly Onboarding"
          description="New pensioners registered per month"
          icon={TrendingUp}
          tone="violet"
          className="lg:col-span-2"
          delay={0.4}
          action={
            <Select defaultValue="year">
              <SelectTrigger className="h-8 w-[7.5rem] rounded-full border-border/50 bg-muted/40 text-xs shadow-none">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <AdminAnimatedLineChart
            data={data!.monthlyOnboarding}
            series={[...data!.monthlyOnboardingSeries]}
            animationDelay={0.4}
            showLegend={false}
          />
          <AdminOnboardingInsights
            monthlyData={data!.monthlyOnboarding}
            channels={data!.onboardingChannelBreakdown}
            topDepartments={data!.onboardingTopDepartments}
            animationDelay={0.4}
          />
        </AdminChartCard>

        <AdminChartCard
          title="Recent Activity"
          description="Latest system events and actions"
          icon={Activity}
          tone="slate"
          delay={0.42}
          action={
            <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
              <Link to="/admin/tasks">
                View all
                <ChevronRight className="ml-0.5 size-4" />
              </Link>
            </Button>
          }
        >
          <ActivityTimeline activities={data!.activities} compact />
        </AdminChartCard>
      </div>

      <AdminSectionHeading
        title="Quick actions"
        description="Frequently used administrative tasks"
        action={
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link to="/admin/tasks">
              Open work queue
              <ChevronRight className="ml-0.5 size-4" />
            </Link>
          </Button>
        }
      />
      <AdminHorizontalMarquee duration={34}>
        {[
          { label: 'Work Queue', href: '/admin/tasks', icon: ClipboardList },
          { label: 'Add Pensioner', href: '/admin/pensioners/add', icon: Plus },
          { label: 'Bulk Import', href: '/admin/pensioners/bulk-import', icon: Upload },
          { label: 'Manual Payment', href: '/admin/disbursements/manual', icon: IndianRupee },
          { label: 'Bulk Monthly Payment', href: '/admin/disbursements/bulk', icon: Upload },
          { label: 'Pending Activations', href: '/admin/pensioners/pending-activations', icon: UserCheck },
          { label: 'Profile Updates', href: '/admin/profile-updates', icon: UserPen },
          { label: 'All Pensioners', href: '/admin/pensioners', icon: Users },
        ].map((action) => (
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

      <AdminChartCard
        title="Recent Pension Applications"
        description="Latest onboarding and approval activity"
        icon={ClipboardList}
        tone="violet"
        delay={0.3}
        action={
          <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/5" asChild>
            <Link to="/admin/pensioners">
              View all
              <ChevronRight className="ml-0.5 size-4" />
            </Link>
          </Button>
        }
      >
        <div className={cn(adminTableStyles.wrap, 'admin-table-colored rounded-2xl')}>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className={adminTableStyles.headerRow}>
                <th className={adminTableStyles.headCell}>Applicant</th>
                <th className={adminTableStyles.headCell}>Department</th>
                <th className={adminTableStyles.headCell}>Applied On</th>
                <th className={adminTableStyles.headCell}>Status</th>
                <th className={cn(adminTableStyles.headCell, 'text-right')}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data!.recentApplications.map((application, index) => (
                <motion.tr
                  key={application.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.06, duration: 0.35 }}
                  className={adminTableStyles.bodyRow}
                >
                  <td className={cn(adminTableStyles.bodyCell, 'font-medium text-foreground')}>
                    {application.applicant}
                  </td>
                  <td className={cn(adminTableStyles.bodyCell, 'text-muted-foreground')}>
                    {application.department}
                  </td>
                  <td className={cn(adminTableStyles.bodyCell, 'text-muted-foreground')}>
                    {formatDate(application.appliedOn)}
                  </td>
                  <td className={adminTableStyles.bodyCell}>
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
                        applicationStatusStyles[application.status],
                      )}
                    >
                      {application.status}
                    </Badge>
                  </td>
                  <td className={cn(adminTableStyles.bodyCell, 'text-right font-medium tabular-nums text-foreground')}>
                    {formatCurrency(application.amount)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminChartCard>
    </motion.div>
  )
}
