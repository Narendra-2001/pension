import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, Eye } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageHeader } from '@/components/admin/shared/page-header'
import { RestorationStatusBadge } from '@/components/suspension/restoration-status-badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchRestorationRequests } from '@/data/suspension-api'
import { matchesListSearch } from '@/lib/list-search'
import type { RestorationRequest, RestorationRequestStatus } from '@/types/suspension'

const columns: ColumnDef<RestorationRequest>[] = [
  {
    accessorKey: 'id',
    header: 'Request ID',
    cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
  },
  { accessorKey: 'ppoNumber', header: 'PPO Number' },
  { accessorKey: 'pensionerName', header: 'Pensioner Name' },
  {
    accessorKey: 'suspensionReason',
    header: 'Suspension Reason',
    cell: ({ row }) => (
      <span className="max-w-[180px] truncate block" title={row.original.suspensionReason}>
        {row.original.suspensionReason}
      </span>
    ),
  },
  { accessorKey: 'requestDate', header: 'Request Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <RestorationStatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" className="rounded-full" asChild>
        <Link to="/admin/suspensions/restoration/$id" params={{ id: row.original.id }}>
          <Eye className="mr-1 size-3.5" /> View Request
        </Link>
      </Button>
    ),
  },
]

export function RestorationRequestsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | RestorationRequestStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-restoration-requests'],
    queryFn: fetchRestorationRequests,
  })

  const filteredRequests = useMemo(() => {
    if (!requests) return []
    return requests.filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false
      return matchesListSearch(search, [
        req.id,
        req.ppoNumber,
        req.pensionerName,
        req.suspensionCaseId,
        req.suspensionReason,
      ])
    })
  }, [requests, search, statusFilter])

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <PageHeader
        variant="admin"
        title="Restoration Requests"
        description="Review and process pension restoration requests from suspended pensioners"
        action={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/suspensions">
              <ArrowLeft className="mr-1.5 size-4" /> Back to Suspensions
            </Link>
          </Button>
        }
      />

      <AdminListPageHeader
        title="Pending & Historical Requests"
        count={filteredRequests.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search requests..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter requests"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label htmlFor="restoration-status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as 'all' | RestorationRequestStatus)}
              >
                <SelectTrigger id="restoration-status-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

      {filteredRequests.length ? (
        <DataListView
          columns={columns}
          data={filteredRequests}
          pageSize={10}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(req, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={req.id}
              subtitle={req.ppoNumber}
              badges={<RestorationStatusBadge status={req.status} />}
              fields={[
                { label: 'Pensioner', value: req.pensionerName },
                { label: 'Suspension ID', value: req.suspensionCaseId },
                { label: 'Reason', value: req.suspensionReason },
                { label: 'Request Date', value: req.requestDate },
              ]}
              action={
                <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
                  <Link to="/admin/suspensions/restoration/$id" params={{ id: req.id }}>
                    <Eye className="mr-1 size-3.5" /> View Request
                  </Link>
                </Button>
              }
            />
          )}
        />
      ) : (
        <EmptyState
          title="No restoration requests"
          description="Restoration requests submitted by pensioners will appear here."
        />
      )}
    </div>
  )
}
