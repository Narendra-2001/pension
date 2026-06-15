import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Bell, Clock, Mail, MessageSquare, Smartphone, XCircle } from 'lucide-react'
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
  AdminChartCard,
  AdminHeroMetric,
  AdminSectionHeading,
  CHART_TOOLTIP_STYLE,
} from '@/components/admin/shared/admin-analytics-ui'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { useCommunicationPortal } from '@/components/communication/communication-portal-context'
import { Button } from '@/components/ui/button'
import { fetchNotificationDashboardStats, fetchNotifications } from '@/data/communication-api'
import { NOTIFICATION_EVENT_LABELS } from '@/lib/communication'

export function NotificationDashboardPage() {
  const navigate = useNavigate()
  const { basePath } = useCommunicationPortal()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['notification-dashboard-stats'],
    queryFn: fetchNotificationDashboardStats,
  })

  const { data: notifications } = useQuery({
    queryKey: ['system-notifications'],
    queryFn: fetchNotifications,
  })

  const channelChart = [
    { channel: 'SMS', count: stats?.smsSent ?? 0 },
    { channel: 'Email', count: stats?.emailsSent ?? 0 },
    {
      channel: 'In-App',
      count: notifications?.filter((n) => n.channel === 'in_app' && n.status !== 'failed').length ?? 0,
    },
  ]

  const eventCounts = notifications?.reduce<Record<string, number>>((acc, n) => {
    acc[n.eventType] = (acc[n.eventType] ?? 0) + 1
    return acc
  }, {})

  const eventChart = Object.entries(eventCounts ?? {})
    .slice(0, 6)
    .map(([type, count]) => ({
      event: NOTIFICATION_EVENT_LABELS[type as keyof typeof NOTIFICATION_EVENT_LABELS]?.slice(0, 20) ?? type,
      count,
    }))

  if (isLoading || !stats) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Notification Dashboard"
        description="Real-time SMS, email, and in-app notification delivery tracking"
        action={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/notifications` })}>
            View History
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminHeroMetric label="Total Notifications" value={stats.totalNotifications} icon={Bell} iconTone="blue" />
        <AdminHeroMetric label="SMS Sent" value={stats.smsSent} icon={Smartphone} iconTone="violet" />
        <AdminHeroMetric label="Emails Sent" value={stats.emailsSent} icon={Mail} iconTone="green" />
        <AdminHeroMetric label="Failed" value={stats.failed} icon={XCircle} iconTone="rose" />
        <AdminHeroMetric label="Pending" value={stats.pending} icon={Clock} iconTone="amber" />
      </div>

      <AdminSectionHeading title="Notification engine" description="Multi-channel delivery overview" />

      <div className="mb-6 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground sm:gap-4">
          <span className="rounded-full bg-background px-3 py-1.5 shadow-sm">Event Triggered</span>
          <span>→</span>
          <span className="rounded-full bg-background px-3 py-1.5 shadow-sm">Generate Notification</span>
          <span>→</span>
          <span className="rounded-full bg-background px-3 py-1.5 shadow-sm">Select Channel</span>
          <span>→</span>
          <span className="flex items-center gap-1 rounded-full bg-background px-3 py-1.5 shadow-sm">
            <Smartphone className="size-3" /> SMS
          </span>
          <span>→</span>
          <span className="flex items-center gap-1 rounded-full bg-background px-3 py-1.5 shadow-sm">
            <Mail className="size-3" /> Email
          </span>
          <span>→</span>
          <span className="flex items-center gap-1 rounded-full bg-background px-3 py-1.5 shadow-sm">
            <MessageSquare className="size-3" /> Portal
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard title="Channel Distribution" description="Notifications by channel" icon={Bell} tone="blue">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="channel" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard title="Event Types" description="Top notification events" icon={MessageSquare} tone="green">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="event" tick={{ fontSize: 9 }} width={130} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>
      </div>
    </motion.div>
  )
}
