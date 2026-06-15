import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Eye, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { useRecoveryPortal } from '@/components/recovery/recovery-portal-context'
import { RecoveryStatusBadge } from '@/components/recovery/recovery-status-badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchRecoveryCases } from '@/data/recovery-api'
import { formatRecoveryCurrency, RECOVERY_REASON_LABELS, RECOVERY_TYPE_LABELS } from '@/lib/recovery'
import { matchesListSearch } from '@/lib/list-search'
import type { RecoveryCase, RecoveryCaseStatus } from '@/types/recovery'

export function RecoveryCasesListPage() {
  const navigate = useNavigate()
  const { basePath, permissions } = useRecoveryPortal()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | RecoveryCaseStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: cases, isLoading } = useQuery({
    queryKey: ['recovery-cases'],
    queryFn: fetchRecoveryCases,
  })

  const filteredCases = useMemo(() => {
    if (!cases) return []
    return cases.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      return matchesListSearch(search, [
        item.id,
        item.ppoNumber,
        item.pensionerName,
        item.excessCaseId,
        item.department,
        RECOVERY_REASON_LABELS[item.recoveryReason],
      ])
    })
  }, [cases, search, statusFilter])

  const columns = useMemo<ColumnDef<RecoveryCase>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Case ID',
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
      },
      { accessorKey: 'excessCaseId', header: 'Excess Case' },
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'pensionerName', header: 'Pensioner' },
      {
        accessorKey: 'recoveryType',
        header: 'Type',
        cell: ({ row }) => RECOVERY_TYPE_LABELS[row.original.recoveryType],
      },
      {
        accessorKey: 'totalExcessAmount',
        header: 'Excess Amount',
        cell: ({ row }) => formatRecoveryCurrency(row.original.totalExcessAmount),
      },
      {
        id: 'outstanding',
        header: 'Outstanding',
        cell: ({ row }) => formatRecoveryCurrency(row.original.calculation.outstandingBalance),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <RecoveryStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => navigate({ href: `${basePath}/cases/${row.original.id}` })}
          >
            <Eye className="mr-1 size-3.5" /> View
          </Button>
        ),
      },
    ],
    [basePath, navigate],
  )

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Recovery Cases"
        description={
          permissions.viewOnly
            ? 'View-only access to excess pension recovery cases'
            : 'Manage recovery cases from approved excess pension cases'
        }
        action={
          permissions.canCreate ? (
            <Button className="rounded-full" onClick={() => navigate({ href: `${basePath}/cases/create` })}>
              <Plus className="mr-1.5 size-4" /> Create Case
            </Button>
          ) : undefined
        }
      />

      <AdminListPageHeader
        title="All Cases"
        count={filteredCases.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by case ID, PPO, pensioner..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter cases"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label htmlFor="recovery-status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as 'all' | RecoveryCaseStatus)}
              >
                <SelectTrigger id="recovery-status-filter" className="w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="active_recovery">Active Recovery</SelectItem>
                  <SelectItem value="recovery_completed">Completed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

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
            subtitle={item.pensionerName}
            badges={<RecoveryStatusBadge status={item.status} />}
            fields={[
              { label: 'PPO', value: item.ppoNumber },
              { label: 'Outstanding', value: formatRecoveryCurrency(item.calculation.outstandingBalance) },
              { label: 'Excess Case', value: item.excessCaseId },
            ]}
            action={
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full"
                onClick={() => navigate({ href: `${basePath}/cases/${item.id}` })}
              >
                <Eye className="mr-1 size-3.5" /> View Case
              </Button>
            }
          />
        )}
      />
    </motion.div>
  )
}
