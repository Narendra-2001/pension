import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Upload,
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
import {
  documentRepositoryPath,
  documentUploadPath,
  documentVerificationPath,
  useDocumentPortal,
} from '@/components/documents/document-portal-context'
import { Button } from '@/components/ui/button'
import {
  fetchDocumentDashboardStats,
  fetchDocumentStatusChart,
  fetchDocumentTypeChart,
  fetchMonthlyUploadChart,
} from '@/data/documents-api'
import { DOCUMENT_TYPE_LABELS } from '@/lib/documents'

const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b', '#06b6d4', '#ec4899']

export function DocumentDashboardPage() {
  const navigate = useNavigate()
  const { basePath, permissions } = useDocumentPortal()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['document-dashboard-stats'],
    queryFn: fetchDocumentDashboardStats,
  })

  const { data: typeChart } = useQuery({
    queryKey: ['document-type-chart'],
    queryFn: fetchDocumentTypeChart,
  })

  const { data: statusChart } = useQuery({
    queryKey: ['document-status-chart'],
    queryFn: fetchDocumentStatusChart,
  })

  const { data: monthlyUploads } = useQuery({
    queryKey: ['document-monthly-uploads'],
    queryFn: fetchMonthlyUploadChart,
  })

  if (isLoading || !stats) return <PageLoadingSkeleton />

  const typePieData =
    typeChart?.slice(0, 8).map((item, i) => ({
      name: DOCUMENT_TYPE_LABELS[item.type] ?? item.label,
      value: item.count,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })) ?? []

  const statusPieData =
    statusChart?.map((item, i) => ({
      name: item.label,
      value: item.count,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    })) ?? []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Document Dashboard"
        description="Central repository for pension-related documents — upload, verify, and manage all records"
        action={
          permissions.canUpload ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => navigate({ href: documentVerificationPath(basePath) })}
              >
                <Clock className="mr-1.5 size-4" /> Verification Queue
              </Button>
              <Button className="rounded-full" onClick={() => navigate({ href: documentUploadPath(basePath) })}>
                <Plus className="mr-1.5 size-4" /> Upload Document
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminHeroMetric
          label="Total Documents"
          value={stats.totalDocuments}
          icon={FileText}
          iconTone="blue"
          hint="All documents in repository"
        />
        <AdminHeroMetric
          label="Pending Verification"
          value={stats.pendingVerification}
          icon={Clock}
          iconTone="amber"
          hint="Awaiting officer review"
        />
        <AdminHeroMetric
          label="Verified"
          value={stats.verifiedDocuments}
          icon={CheckCircle2}
          iconTone="green"
          hint="Approved documents"
        />
        <AdminHeroMetric
          label="Rejected"
          value={stats.rejectedDocuments}
          icon={XCircle}
          iconTone="rose"
          hint="Rejected — re-upload required"
        />
        <AdminHeroMetric
          label="Expired"
          value={stats.expiredDocuments}
          icon={AlertCircle}
          iconTone="slate"
          hint="Documents past validity"
        />
      </div>

      <AdminSectionHeading title="Document snapshot" description="Key document metrics at a glance" />
      <AdminHorizontalMarquee duration={28}>
        <AdminStatChip label="Total" value={stats.totalDocuments} icon={FileText} iconTone="blue" />
        <AdminStatChip label="Pending" value={stats.pendingVerification} icon={Clock} iconTone="amber" />
        <AdminStatChip label="Verified" value={stats.verifiedDocuments} icon={CheckCircle2} iconTone="green" />
        <AdminStatChip label="Rejected" value={stats.rejectedDocuments} icon={XCircle} iconTone="rose" />
        <AdminStatChip label="Expired" value={stats.expiredDocuments} icon={AlertCircle} iconTone="slate" />
      </AdminHorizontalMarquee>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="Document Type Distribution"
          description="Documents by category type"
          icon={FileText}
          tone="blue"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typePieData}
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
                  {typePieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Verification Status Distribution"
          description="Documents by verification status"
          icon={CheckCircle2}
          tone="green"
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
          title="Monthly Upload Statistics"
          description="Document uploads in 2026"
          icon={Upload}
          tone="violet"
          className="lg:col-span-2"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyUploads ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Bar dataKey="uploads" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Uploads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => navigate({ href: documentRepositoryPath(basePath) })}
        >
          View Repository
        </Button>
        {permissions.canVerify && (
          <Button
            className="rounded-full"
            onClick={() => navigate({ href: documentVerificationPath(basePath) })}
          >
            Open Verification Queue
          </Button>
        )}
      </div>
    </motion.div>
  )
}
