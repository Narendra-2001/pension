import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Eye, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { useDemisePortal } from '@/components/demise/demise-portal-context'
import { DemiseStatusBadge } from '@/components/demise/demise-status-badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchDemiseIntimations } from '@/data/demise-api'
import { DEMISE_STATUS_LABELS } from '@/lib/demise'
import { matchesListSearch } from '@/lib/list-search'
import type { DemiseIntimation, DemiseIntimationStatus } from '@/types/demise'

export function DemiseRequestsListPage() {
  const navigate = useNavigate()
  const { basePath, permissions } = useDemisePortal()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | DemiseIntimationStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: intimations, isLoading } = useQuery({
    queryKey: ['demise-intimations'],
    queryFn: fetchDemiseIntimations,
  })

  const filtered = useMemo(() => {
    if (!intimations) return []
    return intimations.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      return matchesListSearch(search, [
        item.id,
        item.ppoNumber,
        item.pensionerName,
        item.nominee.nomineeName,
        item.dateOfDeath,
        item.status,
      ])
    })
  }, [intimations, search, statusFilter])

  const columns = useMemo<ColumnDef<DemiseIntimation>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Intimation ID',
        cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
      },
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'pensionerName', header: 'Pensioner Name' },
      {
        id: 'nominee',
        header: 'Nominee Name',
        cell: ({ row }) => row.original.nominee.nomineeName,
      },
      { accessorKey: 'dateOfDeath', header: 'Date of Death' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DemiseStatusBadge status={row.original.status} />,
      },
      { accessorKey: 'submittedAt', header: 'Submitted Date' },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => navigate({ href: `${basePath}/requests/${row.original.id}` })}
            >
              <Eye className="mr-1 size-3.5" /> View
            </Button>
            {permissions.canVerify && row.original.status === 'submitted' && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-amber-600"
                onClick={() => navigate({ href: `${basePath}/requests/${row.original.id}` })}
              >
                <ShieldCheck className="mr-1 size-3.5" /> Verify
              </Button>
            )}
          </div>
        ),
      },
    ],
    [basePath, navigate, permissions.canVerify],
  )

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Demise Requests"
        description="Review and process demise intimation reports from nominees and admin entries"
      />

      <AdminListPageHeader
        title="All Intimations"
        count={filtered.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ID, PPO, name..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover activeCount={activeFilterCount} onClear={() => setStatusFilter('all')}>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {(Object.keys(DEMISE_STATUS_LABELS) as DemiseIntimationStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {DEMISE_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
        className="mb-4"
      />

      <DataListView
        columns={columns}
        data={filtered}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={false}
        renderCard={(item, serialNo) => (
          <ListRecordCard
            serialNo={serialNo}
            title={item.id}
            subtitle={`${item.pensionerName} · ${item.ppoNumber}`}
            badges={<DemiseStatusBadge status={item.status} />}
            fields={[
              { label: 'Nominee', value: item.nominee.nomineeName },
              { label: 'Date of Death', value: item.dateOfDeath },
              { label: 'Submitted', value: item.submittedAt },
            ]}
            action={
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => navigate({ href: `${basePath}/requests/${item.id}` })}
              >
                <Eye className="mr-1 size-3.5" /> View Details
              </Button>
            }
          />
        )}
      />
    </motion.div>
  )
}
