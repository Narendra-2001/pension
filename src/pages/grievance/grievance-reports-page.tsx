import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'

import { AdminChartCard, CHART_TOOLTIP_STYLE } from '@/components/admin/shared/admin-analytics-ui'
import { DataTable } from '@/components/admin/shared/data-table'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { GrievancePriorityBadge } from '@/components/grievance/grievance-priority-badge'
import { GrievanceStatusBadge } from '@/components/grievance/grievance-status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchEscalatedTicketsReport, fetchGrievanceSlaReport, fetchOpenTicketsReport, fetchResolutionTimeReport } from '@/data/grievance-api'
import type {
  GrievanceOpenTicketsReportItem,
  GrievanceResolutionTimeReportItem,
  GrievanceSlaReportItem,
} from '@/types/grievance'
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

const SLA_COLORS = ['#10b981', '#ef4444']

export function GrievanceReportsPage() {
  const [activeTab, setActiveTab] = useState('open')

  const { data: openReport, isLoading: openLoading } = useQuery({
    queryKey: ['grievance-open-report'],
    queryFn: fetchOpenTicketsReport,
  })

  const { data: resolutionReport, isLoading: resolutionLoading } = useQuery({
    queryKey: ['grievance-resolution-report'],
    queryFn: fetchResolutionTimeReport,
  })

  const { data: escalatedReport, isLoading: escalatedLoading } = useQuery({
    queryKey: ['grievance-escalated-report'],
    queryFn: fetchEscalatedTicketsReport,
  })

  const { data: slaReport, isLoading: slaLoading } = useQuery({
    queryKey: ['grievance-sla-report'],
    queryFn: fetchGrievanceSlaReport,
  })

  const openColumns = useMemo<ColumnDef<GrievanceOpenTicketsReportItem>[]>(
    () => [
      { accessorKey: 'id', header: 'Ticket ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
      { accessorKey: 'subject', header: 'Subject' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <GrievancePriorityBadge priority={row.original.priority} /> },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GrievanceStatusBadge status={row.original.status} /> },
      { accessorKey: 'assignedTo', header: 'Assigned To', cell: ({ row }) => row.original.assignedTo ?? '—' },
      { accessorKey: 'daysOpen', header: 'Days Open' },
      {
        accessorKey: 'slaBreached',
        header: 'SLA',
        cell: ({ row }) =>
          row.original.slaBreached ? (
            <span className="text-xs font-medium text-red-600">Breached</span>
          ) : (
            <span className="text-xs text-emerald-600">On Track</span>
          ),
      },
    ],
    [],
  )

  const resolutionColumns = useMemo<ColumnDef<GrievanceResolutionTimeReportItem>[]>(
    () => [
      { accessorKey: 'id', header: 'Ticket ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
      { accessorKey: 'subject', header: 'Subject' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'priority', header: 'Priority', cell: ({ row }) => <GrievancePriorityBadge priority={row.original.priority} /> },
      { accessorKey: 'resolutionHours', header: 'Hours to Resolve', cell: ({ row }) => `${row.original.resolutionHours}h` },
      {
        accessorKey: 'withinSla',
        header: 'SLA Met',
        cell: ({ row }) => (row.original.withinSla ? 'Yes' : 'No'),
      },
    ],
    [],
  )

  const slaChartData =
    slaReport?.map((item) => [
      { name: `${item.label} (Within)`, value: item.withinSla, fill: SLA_COLORS[0] },
      { name: `${item.label} (Breached)`, value: item.breached, fill: SLA_COLORS[1] },
    ]).flat() ?? []

  if (openLoading || resolutionLoading || escalatedLoading || slaLoading) {
    return <PageLoadingSkeleton />
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Grievance Reports"
        description="Open tickets, resolution time, escalated tickets, and SLA performance"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="rounded-full">
          <TabsTrigger value="open" className="rounded-full">Open Tickets</TabsTrigger>
          <TabsTrigger value="resolution" className="rounded-full">Resolution Time</TabsTrigger>
          <TabsTrigger value="escalated" className="rounded-full">Escalated</TabsTrigger>
          <TabsTrigger value="sla" className="rounded-full">SLA Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <DataTable columns={openColumns} data={openReport ?? []} pageSize={10} />
        </TabsContent>

        <TabsContent value="resolution">
          <DataTable columns={resolutionColumns} data={resolutionReport ?? []} pageSize={10} />
        </TabsContent>

        <TabsContent value="escalated">
          <DataTable columns={openColumns} data={escalatedReport ?? []} pageSize={10} />
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(slaReport ?? []).map((item: GrievanceSlaReportItem) => (
              <div key={item.priority} className="rounded-2xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-bold">{item.complianceRate}%</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.withinSla} within SLA · {item.breached} breached
                </p>
              </div>
            ))}
          </div>

          <AdminChartCard title="SLA Compliance by Priority" description="Within SLA vs breached" icon={BarChart3} tone="green">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={slaChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {slaChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AdminChartCard>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
