import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Heart,
  Users,
  XCircle,
} from 'lucide-react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
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
import { useDemisePortal } from '@/components/demise/demise-portal-context'
import { Button } from '@/components/ui/button'
import { fetchDemiseDashboardStats, fetchDemiseIntimations } from '@/data/demise-api'
import { DEMISE_STATUS_LABELS } from '@/lib/demise'

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#64748b']

export function DemiseDashboardPage() {
  const navigate = useNavigate()
  const { basePath } = useDemisePortal()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['demise-dashboard-stats'],
    queryFn: fetchDemiseDashboardStats,
  })

  const { data: intimations } = useQuery({
    queryKey: ['demise-intimations'],
    queryFn: fetchDemiseIntimations,
  })

  if (isLoading || !stats) return <PageLoadingSkeleton />

  const statusCounts = intimations?.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  ) ?? {}

  const statusPieData = Object.entries(statusCounts).map(([status, count], i) => ({
    name: DEMISE_STATUS_LABELS[status as keyof typeof DEMISE_STATUS_LABELS] ?? status,
    value: count,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Demise Intimation Dashboard"
        description="Monitor demise reports, verification queue, family pension initiation, and deceased pensioner records"
        action={
          <Button className="rounded-full" onClick={() => navigate({ href: `${basePath}/requests` })}>
            <ClipboardList className="mr-1.5 size-4" /> View All Requests
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminHeroMetric
          label="Total Demise Requests"
          value={stats.totalRequests}
          icon={ClipboardList}
          iconTone="blue"
          hint="All demise intimations"
        />
        <AdminHeroMetric
          label="Pending Verification"
          value={stats.pendingVerification}
          icon={AlertCircle}
          iconTone="amber"
          hint="Awaiting admin review"
        />
        <AdminHeroMetric
          label="Approved Cases"
          value={stats.approvedCases}
          icon={CheckCircle2}
          iconTone="green"
          hint="Demise verified and approved"
        />
        <AdminHeroMetric
          label="Rejected Cases"
          value={stats.rejectedCases}
          icon={XCircle}
          iconTone="rose"
          hint="False or unverified reports"
        />
        <AdminHeroMetric
          label="Family Pension Initiated"
          value={stats.familyPensionInitiated}
          icon={Heart}
          iconTone="violet"
          hint="Family pension applications"
        />
        <AdminHeroMetric
          label="Deceased Profiles"
          value={stats.deceasedProfiles}
          icon={Users}
          iconTone="slate"
          hint="Approved deceased pensioners"
        />
      </div>

      <AdminSectionHeading title="Demise snapshot" description="Key metrics at a glance" />
      <AdminHorizontalMarquee duration={28}>
        <AdminStatChip label="Total" value={stats.totalRequests} icon={ClipboardList} iconTone="blue" />
        <AdminStatChip label="Pending" value={stats.pendingVerification} icon={AlertCircle} iconTone="amber" />
        <AdminStatChip label="Approved" value={stats.approvedCases} icon={CheckCircle2} iconTone="green" />
        <AdminStatChip label="Rejected" value={stats.rejectedCases} icon={XCircle} iconTone="rose" />
        <AdminStatChip label="Clarification" value={stats.needsClarification} icon={AlertCircle} iconTone="amber" />
        <AdminStatChip label="Family Pension" value={stats.familyPensionInitiated} icon={Heart} iconTone="violet" />
      </AdminHorizontalMarquee>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="Status Distribution"
          description="Demise intimations by status"
          icon={ClipboardList}
          tone="blue"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Quick Actions"
          description="Common demise management tasks"
          icon={Heart}
          tone="rose"
        >
          <div className="flex flex-col gap-3 p-2">
            <Button
              variant="outline"
              className="justify-start rounded-xl"
              onClick={() => navigate({ href: `${basePath}/requests` })}
            >
              Review Pending Requests ({stats.pendingVerification})
            </Button>
            <Button
              variant="outline"
              className="justify-start rounded-xl"
              onClick={() => navigate({ href: `${basePath}/deceased` })}
            >
              View Deceased Pensioners ({stats.deceasedProfiles})
            </Button>
            <Button
              variant="outline"
              className="justify-start rounded-xl"
              onClick={() => navigate({ href: `${basePath}/family-pension` })}
            >
              Family Pension Cases ({stats.familyPensionInitiated})
            </Button>
          </div>
        </AdminChartCard>
      </div>
    </motion.div>
  )
}
