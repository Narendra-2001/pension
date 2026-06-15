import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Send,
  XCircle,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { useCommunicationPortal } from '@/components/communication/communication-portal-context'
import { Button } from '@/components/ui/button'
import {
  fetchDeliveryStatusChart,
  fetchMonthlyNoticeChart,
  fetchNoticeDashboardStats,
  fetchNoticeTypeChart,
} from '@/data/communication-api'

const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1']

export function NoticeDashboardPage() {
  const navigate = useNavigate()
  const { basePath, permissions } = useCommunicationPortal()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['notice-dashboard-stats'],
    queryFn: fetchNoticeDashboardStats,
  })

  const { data: typeChart } = useQuery({
    queryKey: ['notice-type-chart'],
    queryFn: fetchNoticeTypeChart,
  })

  const { data: monthlyChart } = useQuery({
    queryKey: ['monthly-notice-chart'],
    queryFn: fetchMonthlyNoticeChart,
  })

  const { data: deliveryChart } = useQuery({
    queryKey: ['delivery-status-chart'],
    queryFn: fetchDeliveryStatusChart,
  })

  if (isLoading || !stats) return <PageLoadingSkeleton />

  const typePieData =
    typeChart?.map((item, i) => ({
      name: item.label,
      value: item.count,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })) ?? []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Notice Management Dashboard"
        description="Monitor official notice generation, delivery status, and pensioner communications"
        action={
          permissions.canCreateNotice ? (
            <Button className="rounded-full" onClick={() => navigate({ href: `${basePath}/notices/create` })}>
              <Plus className="mr-1.5 size-4" /> Generate Notice
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminHeroMetric label="Total Generated" value={stats.totalGenerated} icon={FileText} iconTone="blue" />
        <AdminHeroMetric label="Sent Today" value={stats.sentToday} icon={Send} iconTone="violet" />
        <AdminHeroMetric label="Pending" value={stats.pending} icon={Clock} iconTone="amber" />
        <AdminHeroMetric label="Failed" value={stats.failed} icon={XCircle} iconTone="rose" />
        <AdminHeroMetric label="Delivered" value={stats.delivered} icon={CheckCircle2} iconTone="green" />
      </div>

      <AdminSectionHeading title="Notice snapshot" description="Key notice metrics at a glance" />
      <AdminHorizontalMarquee duration={28}>
        <AdminStatChip label="Total" value={stats.totalGenerated} icon={FileText} iconTone="blue" />
        <AdminStatChip label="Sent Today" value={stats.sentToday} icon={Send} iconTone="violet" />
        <AdminStatChip label="Pending" value={stats.pending} icon={Clock} iconTone="amber" />
        <AdminStatChip label="Delivered" value={stats.delivered} icon={CheckCircle2} iconTone="green" />
        <AdminStatChip label="Failed" value={stats.failed} icon={XCircle} iconTone="rose" />
      </AdminHorizontalMarquee>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard title="Notice Type Distribution" description="Notices by type" icon={FileText} tone="blue">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typePieData} dataKey="value" nameKey="name" cx="50%" cy="46%" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={2} stroke="var(--background)">
                  {typePieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Legend layout="horizontal" verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard title="Monthly Notice Generation" description="Notices generated per month (2026)" icon={FileText} tone="green">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChart ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard title="Delivery Status Overview" description="Notices by delivery status" icon={Send} tone="violet" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryChart ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>
      </div>
    </motion.div>
  )
}
