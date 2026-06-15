import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileText,
  Plus,
  RotateCcw,
  ShieldAlert,
  UserX,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import {
  AdminDetailHero,
  AdminIllustrationPanel,
  AdminMetricGrid,
  AdminPageShell,
  AdminProcessStepper,
} from '@/components/admin/shared/admin-detail-ui'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { SuspensionStatusBadge } from '@/components/suspension/suspension-status-badge'
import { SuspensionSourceBadge, TriggerTypeBadge } from '@/components/suspension/trigger-type-badge'
import featureRecoveryManagement from '@/assets/features/feature-recovery-management.png'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fetchSuspensionCases,
  fetchSuspensionDashboardStats,
} from '@/data/suspension-api'
import { matchesListSearch } from '@/lib/list-search'
import { TRIGGER_TYPE_LABELS } from '@/lib/suspension'
import type { SuspensionCase, SuspensionCaseStatus, SuspensionTriggerType } from '@/types/suspension'

const SUSPENSION_WORKFLOW_STEPS = [
  { id: 'case', label: 'Case Created', description: 'Suspension filed' },
  { id: 'active', label: 'Suspended', description: 'Pension on hold' },
  { id: 'restore', label: 'Restoration', description: 'Review request' },
  { id: 'resolved', label: 'Resolved', description: 'Restored or closed' },
]

const columns: ColumnDef<SuspensionCase>[] = [
  {
    accessorKey: 'id',
    header: 'Suspension ID',
    cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
  },
  { accessorKey: 'ppoNumber', header: 'PPO Number' },
  { accessorKey: 'pensionerName', header: 'Pensioner Name' },
  {
    accessorKey: 'suspensionReason',
    header: 'Suspension Reason',
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate" title={row.original.suspensionReason}>
        {row.original.suspensionReason}
      </span>
    ),
  },
  { accessorKey: 'suspensionDate', header: 'Suspension Date' },
  {
    accessorKey: 'triggerType',
    header: 'Trigger Type',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <TriggerTypeBadge triggerType={row.original.triggerType} />
        <SuspensionSourceBadge source={row.original.source} />
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <SuspensionStatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <Button variant="ghost" size="sm" className="rounded-full" asChild>
          <Link to="/admin/suspensions/$id" params={{ id: row.original.id }}>
            <Eye className="size-3.5" /> View Case
          </Link>
        </Button>
      </div>
    ),
  },
]

export function SuspensionsDashboardPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | SuspensionCaseStatus>('all')
  const [triggerFilter, setTriggerFilter] = useState<'all' | SuspensionTriggerType>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['suspension-dashboard-stats'],
    queryFn: fetchSuspensionDashboardStats,
  })

  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ['admin-suspension-cases'],
    queryFn: fetchSuspensionCases,
  })

  const filteredCases = useMemo(() => {
    if (!cases) return []
    return cases.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (triggerFilter !== 'all' && item.triggerType !== triggerFilter) return false
      return matchesListSearch(search, [
        item.id,
        item.ppoNumber,
        item.pensionerName,
        item.suspensionReason,
        TRIGGER_TYPE_LABELS[item.triggerType],
      ])
    })
  }, [cases, search, statusFilter, triggerFilter])

  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) + (triggerFilter !== 'all' ? 1 : 0)

  const workflowStep = useMemo(() => {
    if (!stats) return 2
    if (stats.pendingRestoration > 0) return 3
    if (stats.restoredCases > 0) return 4
    return 2
  }, [stats])

  if (statsLoading || casesLoading) return <PageLoadingSkeleton />

  return (
    <AdminPageShell>
      <AdminDetailHero
        title="Suspension Management"
        subtitle="Monitor suspended pensioners, restoration requests, and compliance cases"
        actions={
          <Button className="rounded-full" asChild>
            <Link to="/admin/suspensions/create">
              <Plus className="size-4" /> Create Suspension Case
            </Link>
          </Button>
        }
      />

      <AdminProcessStepper steps={SUSPENSION_WORKFLOW_STEPS} currentStep={workflowStep} />

      <AdminMetricGrid
        metrics={[
          { label: 'Total Suspended', value: String(stats!.totalSuspended), icon: UserX, tone: 'rose' },
          {
            label: 'Pending Restoration',
            value: String(stats!.pendingRestoration),
            icon: ShieldAlert,
            tone: 'amber',
          },
          { label: 'Restored Cases', value: String(stats!.restoredCases), icon: CheckCircle2, tone: 'green' },
          { label: 'Fraud Cases', value: String(stats!.fraudCases), icon: AlertTriangle, tone: 'violet' },
          {
            label: 'Verification Failures',
            value: String(stats!.verificationFailureCases),
            icon: FileText,
            tone: 'blue',
          },
        ]}
      />

      <AdminIllustrationPanel
        imageSrc={featureRecoveryManagement}
        alt="Suspension and recovery management"
        title="Compliance-driven suspensions"
        description="Track automatic and manual suspension triggers, restoration requests, and audit-ready case timelines in one place."
      />

      <AdminListPageHeader
        title="Suspension Cases"
        count={filteredCases.length}
        description="All suspension cases with status and trigger information"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID, PPO, name..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          <Button variant="outline" className="h-10 rounded-full" asChild>
            <Link to="/admin/suspensions/restoration">
              <RotateCcw className="size-4" /> Restoration Requests
            </Link>
          </Button>
        }
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter cases"
            onClear={() => {
              setStatusFilter('all')
              setTriggerFilter('all')
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="suspension-status-filter">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as 'all' | SuspensionCaseStatus)}
                >
                  <SelectTrigger id="suspension-status-filter" className="w-full rounded-xl">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="restoration_pending">Restoration Pending</SelectItem>
                    <SelectItem value="restored">Restored</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suspension-trigger-filter">Trigger Type</Label>
                <Select
                  value={triggerFilter}
                  onValueChange={(v) => setTriggerFilter(v as 'all' | SuspensionTriggerType)}
                >
                  <SelectTrigger id="suspension-trigger-filter" className="w-full rounded-xl">
                    <SelectValue placeholder="Trigger" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All triggers</SelectItem>
                    {(Object.keys(TRIGGER_TYPE_LABELS) as SuspensionTriggerType[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {TRIGGER_TYPE_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ListFiltersPopover>
        }
      />

      {filteredCases.length ? (
        <DataListView
          columns={columns}
          data={filteredCases}
          pageSize={10}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(item, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={item.id}
              subtitle={item.ppoNumber}
              badges={
                <>
                  <SuspensionStatusBadge status={item.status} />
                  <TriggerTypeBadge triggerType={item.triggerType} />
                </>
              }
              fields={[
                { label: 'Pensioner', value: item.pensionerName },
                { label: 'Reason', value: item.suspensionReason },
                { label: 'Date', value: item.suspensionDate },
                { label: 'Created By', value: item.createdBy },
              ]}
              action={
                <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
                  <Link to="/admin/suspensions/$id" params={{ id: item.id }}>
                    <Eye className="size-3.5" /> View Case
                  </Link>
                </Button>
              }
            />
          )}
        />
      ) : (
        <EmptyState
          title="No suspension cases"
          description="Create a suspension case or adjust your filters."
          action={
            <Button className="rounded-full" asChild>
              <Link to="/admin/suspensions/create">Create Suspension Case</Link>
            </Button>
          }
        />
      )}
    </AdminPageShell>
  )
}
