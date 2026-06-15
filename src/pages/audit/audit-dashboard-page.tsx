import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import {
  Activity,
  ChevronRight,
  ClipboardList,
  ScrollText,
  Shield,
  Users,
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
  AdminChartCard,
  AdminHeroMetric,
  AdminHorizontalMarquee,
  AdminSectionHeading,
  AdminStatChip,
  CHART_TOOLTIP_STYLE,
} from '@/components/admin/shared/admin-analytics-ui'
import { AdminDashboardShell } from '@/components/admin/shared/admin-dashboard-shell'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { RecentAuditActivity } from '@/components/audit/recent-audit-activity'
import {
  AuditWorkflowPipeline,
  AuditWorkflowSummaryStrip,
} from '@/components/audit/audit-workflow-pipeline'
import { Button } from '@/components/ui/button'
import {
  fetchAuditActionChart,
  fetchAuditDashboardStats,
  fetchAuditModuleChart,
  fetchSystemAuditLogs,
} from '@/data/audit-api'
import { AUDIT_MODULE_COLORS } from '@/lib/audit'
import { sparklinePattern } from '@/lib/sparkline-data'

export function AuditDashboardPage() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['audit-dashboard-stats'],
    queryFn: fetchAuditDashboardStats,
  })

  const { data: moduleChart } = useQuery({
    queryKey: ['audit-module-chart'],
    queryFn: fetchAuditModuleChart,
  })

  const { data: actionChart } = useQuery({
    queryKey: ['audit-action-chart'],
    queryFn: fetchAuditActionChart,
  })

  const { data: recentLogs } = useQuery({
    queryKey: ['audit-recent-logs'],
    queryFn: () => fetchSystemAuditLogs(),
  })

  if (statsLoading || !stats) return <PageLoadingSkeleton />

  const moduleBarData =
    moduleChart?.map((item) => ({
      name: item.label,
      count: item.count,
      fill: AUDIT_MODULE_COLORS[item.module],
    })) ?? []

  const actionBarData =
    actionChart?.map((item) => ({
      name: item.label,
      count: item.count,
    })) ?? []

  return (
    <AdminDashboardShell>
      <PageHeader
        variant="admin"
        title="Dashboard"
        description="System-wide activity monitoring — every user action recorded with old/new values, user details, and timestamps"
        className="mb-6"
        action={
          <Button className="rounded-lg px-5" onClick={() => navigate({ to: '/audit/logs' })}>
            <ClipboardList className="mr-1.5 size-4" />
            Review audit logs
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminHeroMetric
          label="Total Audit Logs"
          value={stats.totalLogs}
          trend={`${stats.logsToday} today`}
          icon={ScrollText}
          iconTone="blue"
          sparklineData={sparklinePattern('trendUp')}
          delay={0.05}
        />
        <AdminHeroMetric
          label="Recent Activity (24h)"
          value={stats.recentActivity}
          hint="Last 24 hours"
          icon={Activity}
          iconTone="green"
          sparklineData={sparklinePattern('trendUpAlt')}
          delay={0.1}
        />
        <AdminHeroMetric
          label="Active Users"
          value={stats.uniqueUsers}
          hint="Unique actors"
          icon={Users}
          iconTone="violet"
          sparklineData={sparklinePattern('wave')}
          delay={0.15}
        />
        <AdminHeroMetric
          label="Modules Tracked"
          value={stats.modulesActive}
          hint="Across system"
          icon={Shield}
          iconTone="amber"
          sparklineData={sparklinePattern('moderate')}
          delay={0.2}
        />
      </div>

      <AdminSectionHeading
        title="Audit snapshot"
        description="Compliance metrics across tracked modules"
      />
      <AdminHorizontalMarquee duration={32} icon3d className="mb-8">
        <AdminStatChip label="Total logs" value={stats.totalLogs} icon={ScrollText} iconTone="blue" />
        <AdminStatChip label="Today" value={stats.logsToday} icon={Activity} iconTone="green" />
        <AdminStatChip label="24h activity" value={stats.recentActivity} icon={Activity} iconTone="violet" />
        <AdminStatChip label="Unique users" value={stats.uniqueUsers} icon={Users} iconTone="teal" />
        <AdminStatChip label="Modules" value={stats.modulesActive} icon={Shield} iconTone="amber" />
      </AdminHorizontalMarquee>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="Activity by Module"
          description="Audit events grouped by system module"
          icon={ScrollText}
          tone="blue"
          delay={0.2}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moduleBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }} />
                <Bar dataKey="count" radius={[0, 10, 10, 0]} maxBarSize={32}>
                  {moduleBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Top Actions"
          description="Most frequent audit actions recorded"
          icon={Activity}
          tone="violet"
          delay={0.25}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionBarData} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} cursor={{ fill: 'rgba(139, 92, 246, 0.06)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[10, 10, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>
      </div>

      <AdminSectionHeading
        title="Audit workflow"
        description="Every user action follows an immutable capture-to-review pipeline"
      />

      <div className="mb-4">
        <AuditWorkflowSummaryStrip />
      </div>

      <AdminChartCard
        title="Audit pipeline"
        description="From user action to officer review — fully automated and tamper-proof"
        icon={Shield}
        tone="green"
        delay={0.3}
        className="mb-8"
      >
        <AuditWorkflowPipeline />
      </AdminChartCard>

      <AdminChartCard
        title="Recent Audit Activity"
        description="Live system events — filter by module and inspect change details"
        icon={ClipboardList}
        tone="slate"
        delay={0.35}
        action={
          <Button variant="ghost" size="sm" className="rounded-lg text-primary hover:bg-primary/5" onClick={() => navigate({ to: '/audit/logs' })}>
            View all
            <ChevronRight className="ml-0.5 size-4" />
          </Button>
        }
      >
        <RecentAuditActivity
          entries={recentLogs ?? []}
          maxItems={8}
          onViewAll={() => navigate({ to: '/audit/logs' })}
        />
      </AdminChartCard>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Last refreshed {format(new Date(), 'dd MMM yyyy, hh:mm a')}
      </p>
    </AdminDashboardShell>
  )
}
