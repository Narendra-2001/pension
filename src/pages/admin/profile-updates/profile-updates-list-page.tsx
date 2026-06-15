import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ProfileUpdateStatusBadge } from '@/components/profile-update/request-status-badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchAdminProfileUpdateRequests } from '@/data/profile-update-api'
import { matchesListSearch } from '@/lib/list-search'
import { REQUEST_TYPE_LABELS } from '@/lib/profile-update'
import type { ProfileUpdateRequest, ProfileUpdateRequestStatus } from '@/types/profile-update-request'

const columns: ColumnDef<ProfileUpdateRequest>[] = [
  {
    accessorKey: 'id',
    header: 'Request ID',
    cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
  },
  { accessorKey: 'ppoNumber', header: 'PPO' },
  { accessorKey: 'pensionerName', header: 'Pensioner Name' },
  {
    accessorKey: 'requestType',
    header: 'Request Type',
    cell: ({ row }) => REQUEST_TYPE_LABELS[row.original.requestType],
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ProfileUpdateStatusBadge status={row.original.status} />,
  },
  { accessorKey: 'submittedAt', header: 'Submitted Date' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" className="rounded-full" asChild>
        <Link to="/admin/profile-updates/$id" params={{ id: row.original.id }}>
          <Eye className="mr-1 size-3.5" /> View
        </Link>
      </Button>
    ),
  },
]

export function ProfileUpdatesListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProfileUpdateRequestStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-profile-updates'],
    queryFn: fetchAdminProfileUpdateRequests,
  })

  const filteredRequests = useMemo(() => {
    if (!requests) return []
    return requests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) return false
      return matchesListSearch(search, [
        request.id,
        request.ppoNumber,
        request.pensionerName,
        REQUEST_TYPE_LABELS[request.requestType],
      ])
    })
  }, [requests, search, statusFilter])

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <AdminListPageHeader
        title="Profile Update Requests"
        count={filteredRequests.length}
        description="Manage and review pensioner profile update requests"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter requests"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label htmlFor="profile-status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as 'all' | ProfileUpdateRequestStatus)
                }
              >
                <SelectTrigger id="profile-status-filter" className="w-full rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending_review">Pending review</SelectItem>
                  <SelectItem value="under_verification">Under verification</SelectItem>
                  <SelectItem value="more_info_required">More info required</SelectItem>
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
          renderCard={(request, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={request.id}
              subtitle={`${request.pensionerName} · ${request.ppoNumber}`}
              badges={<ProfileUpdateStatusBadge status={request.status} />}
              fields={[
                { label: 'Request Type', value: REQUEST_TYPE_LABELS[request.requestType] },
                { label: 'Submitted', value: request.submittedAt },
              ]}
              action={
                <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
                  <Link to="/admin/profile-updates/$id" params={{ id: request.id }}>
                    <Eye className="mr-1 size-3.5" /> View Request
                  </Link>
                </Button>
              }
            />
          )}
        />
      ) : (
        <EmptyState
          title="No profile update requests"
          description="Pensioner profile update requests will appear here."
        />
      )}
    </div>
  )
}
