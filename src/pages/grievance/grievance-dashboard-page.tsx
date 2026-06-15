import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Clock,
  TrendingUp,
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
  AdminHorizontalMarquee,
  AdminSectionHeading,
  AdminStatChip,
  AdminStyledDonutChart,
  CHART_TOOLTIP_STYLE,
} from '@/components/admin/shared/admin-analytics-ui'
import { AdminDashboardShell } from '@/components/admin/shared/admin-dashboard-shell'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { useGrievancePortal } from '@/components/grievance/grievance-portal-context'
import { GrievanceTicketPipelineCards } from '@/components/grievance/grievance-ticket-pipeline-cards'
import { Button } from '@/components/ui/button'
import {
  fetchGrievanceCategoryChart,
  fetchGrievanceDashboardStats,
  fetchGrievancePriorityChart,
  fetchGrievanceResolutionTrend,
} from '@/data/grievance-api'
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#06b6d4', '#ec4899']
const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
}

export function GrievanceDashboardPage() {
  const navigate = useNavigate()
  const { basePath } = useGrievancePortal()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['grievance-dashboard-stats'],
    queryFn: fetchGrievanceDashboardStats,
  })

  const { data: categoryChart } = useQuery({
    queryKey: ['grievance-category-chart'],
    queryFn: fetchGrievanceCategoryChart,
  })

  const { data: priorityChart } = useQuery({
    queryKey: ['grievance-priority-chart'],
    queryFn: fetchGrievancePriorityChart,
  })

  const { data: resolutionTrend } = useQuery({
    queryKey: ['grievance-resolution-trend'],
    queryFn: fetchGrievanceResolutionTrend,
  })

  if (isLoading || !stats) return <PageLoadingSkeleton />

  const categoryDonutData =
    categoryChart
      ?.filter((item) => item.count > 0)
      .map((item, i) => ({
        name: item.label,
        value: item.count,
        fill: PIE_COLORS[i % PIE_COLORS.length],
      })) ?? []

  const priorityBarData =
    priorityChart?.map((item) => ({
      name: item.label,
      count: item.count,
      fill: PRIORITY_COLORS[item.priority],
    })) ?? []

  const resolutionSeries = [
    { dataKey: 'resolved', name: 'Resolved', color: '#10b981' },
    { dataKey: 'closed', name: 'Closed', color: '#3b82f6' },
    { dataKey: 'escalated', name: 'Escalated', color: '#ef4444' },
  ] as const

  return (
    <AdminDashboardShell>
      <PageHeader
        variant="admin"
        title="Dashboard"
        description="Monitor grievance tickets, SLA performance, and resolution trends"
        className="mb-6"
        action={
          <Button className="rounded-lg px-5" onClick={() => navigate({ href: `${basePath}/tickets` })}>
            <ClipboardList className="mr-1.5 size-4" />
            View ticket queue
          </Button>
        }
      />

      <GrievanceTicketPipelineCards stats={stats} className="mb-6" />

      <AdminSectionHeading title="Helpdesk snapshot" description="Key ticket metrics at a glance" />
      <AdminHorizontalMarquee duration={30} icon3d className="mb-8">
        <AdminStatChip label="Total Tickets" value={stats.totalTickets} icon={ClipboardList} iconTone="blue" />
        <AdminStatChip label="Waiting For User" value={stats.waitingForUser} icon={Clock} iconTone="amber" />
        <AdminStatChip label="SLA Breached" value={stats.slaBreached} icon={AlertTriangle} iconTone="rose" />
        <AdminStatChip label="Avg Resolution" value={`${stats.avgResolutionHours}h`} icon={TrendingUp} iconTone="green" />
      </AdminHorizontalMarquee>

      <div className="mb-8 grid gap-4 lg:grid-cols-5">
        <AdminChartCard
          title="Tickets By Category"
          description="Distribution across issue types"
          icon={ClipboardList}
          tone="blue"
          className="lg:col-span-2"
          delay={0.2}
        >
          <AdminStyledDonutChart data={categoryDonutData} animationDelay={0.2} />
        </AdminChartCard>

        <AdminChartCard
          title="Tickets By Priority"
          description="Open and active tickets by priority level"
          icon={AlertTriangle}
          tone="amber"
          className="lg:col-span-3"
          delay={0.25}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityBarData} barCategoryGap="18%">
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} cursor={{ fill: 'rgba(245, 158, 11, 0.06)' }} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} maxBarSize={42}>
                  {priorityBarData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Resolution Trend"
          description="Monthly resolved, closed, and escalated tickets"
          icon={TrendingUp}
          tone="green"
          className="lg:col-span-5"
          delay={0.3}
        >
          <AdminAnimatedLineChart
            data={(resolutionTrend ?? []) as unknown as Record<string, string | number>[]}
            series={[...resolutionSeries]}
            animationDelay={0.3}
          />
        </AdminChartCard>
      </div>

      <AdminSectionHeading
        title="Quick actions"
        description="Frequently used helpdesk tasks"
        action={
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate({ href: `${basePath}/tickets` })}>
            Open ticket queue
            <ChevronRight className="ml-0.5 size-4" />
          </Button>
        }
      />
      <AdminHorizontalMarquee duration={34}>
        {[
          { label: 'Ticket Queue', href: `${basePath}/tickets`, icon: ClipboardList },
          { label: 'Reports', href: `${basePath}/reports`, icon: TrendingUp },
          { label: 'Audit Trail', href: `${basePath}/audit`, icon: AlertTriangle },
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
    </AdminDashboardShell>
  )
}
