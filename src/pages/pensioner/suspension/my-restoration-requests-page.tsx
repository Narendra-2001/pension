import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Plus } from 'lucide-react'
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
import { fetchPensionerRestorationRequests } from '@/data/suspension-api'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { RestorationRequest, RestorationRequestStatus } from '@/types/suspension'

const columns: ColumnDef<RestorationRequest>[] = [
  {
    accessorKey: 'id',
    header: 'Request ID',
    cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
  },
  { accessorKey: 'ppoNumber', header: 'PPO Number' },
  {
    accessorKey: 'suspensionCaseId',
    header: 'Suspension ID',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.suspensionCaseId}</span>,
  },
  { accessorKey: 'requestDate', header: 'Request Date' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <RestorationStatusBadge status={row.original.status} />,
  },
  { accessorKey: 'updatedAt', header: 'Last Updated' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" className="rounded-full" asChild>
        <Link to="/pensioner/suspension/requests/$id" params={{ id: row.original.id }}>
          <Eye className="mr-1 size-3.5" /> View
        </Link>
      </Button>
    ),
  },
]

export function MyRestorationRequestsPage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | RestorationRequestStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: requests, isLoading } = useQuery({
    queryKey: ['pensioner-restoration-requests', pensionerId],
    queryFn: () => fetchPensionerRestorationRequests(pensionerId),
    enabled: !!pensionerId,
  })

  const filteredRequests = useMemo(() => {
    if (!requests) return []
    return requests.filter((req) => {
      if (statusFilter !== 'all' && req.status !== statusFilter) return false
      return matchesListSearch(search, [req.id, req.ppoNumber, req.suspensionCaseId])
    })
  }, [requests, search, statusFilter])

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <PageHeader
        title="My Restoration Requests"
        description="Track the status of your pension restoration requests"
      />

      <AdminListPageHeader
        title="Restoration Requests"
        count={filteredRequests.length}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search requests..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          <Button className="h-10 rounded-lg px-4 shadow-sm" asChild>
            <Link to="/pensioner/suspension/restoration">
              <Plus className="size-4" />
              New Request
            </Link>
          </Button>
        }
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter requests"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label htmlFor="my-restoration-status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as 'all' | RestorationRequestStatus)}
              >
                <SelectTrigger id="my-restoration-status-filter" className="w-full rounded-lg">
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
          pageSize={8}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(req, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={req.id}
              subtitle={req.suspensionCaseId}
              badges={<RestorationStatusBadge status={req.status} />}
              fields={[
                { label: 'PPO', value: req.ppoNumber },
                { label: 'Request Date', value: req.requestDate },
                { label: 'Last Updated', value: req.updatedAt },
              ]}
              action={
                <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
                  <Link to="/pensioner/suspension/requests/$id" params={{ id: req.id }}>
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
          description="Submit a restoration request if your pension has been suspended."
          action={
            <Button className="rounded-full" asChild>
              <Link to="/pensioner/suspension/restoration">Submit Restoration Request</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
