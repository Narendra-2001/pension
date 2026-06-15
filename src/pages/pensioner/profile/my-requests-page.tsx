import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ProfileSubNav } from '@/components/pensioner/profile/profile-sub-nav'
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
import { fetchPensionerProfileUpdateRequests } from '@/data/profile-update-api'
import { matchesListSearch } from '@/lib/list-search'
import { REQUEST_TYPE_LABELS } from '@/lib/profile-update'
import { useAuth } from '@/providers/auth-provider'
import type { ProfileUpdateRequest, ProfileUpdateRequestStatus } from '@/types/profile-update-request'

const columns: ColumnDef<ProfileUpdateRequest>[] = [
  {
    accessorKey: 'id',
    header: 'Request ID',
    cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.id}</span>,
  },
  { accessorKey: 'ppoNumber', header: 'PPO' },
  {
    accessorKey: 'requestType',
    header: 'Type',
    cell: ({ row }) => REQUEST_TYPE_LABELS[row.original.requestType],
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <ProfileUpdateStatusBadge status={row.original.status} />,
  },
  { accessorKey: 'submittedAt', header: 'Submitted' },
  { accessorKey: 'updatedAt', header: 'Last Updated' },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" className="rounded-full" asChild>
        <Link to="/pensioner/profile/requests/$id" params={{ id: row.original.id }}>
          <Eye className="mr-1 size-3.5" /> View
        </Link>
      </Button>
    ),
  },
]

export function MyRequestsPage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProfileUpdateRequestStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: requests, isLoading } = useQuery({
    queryKey: ['pensioner-profile-requests', pensionerId],
    queryFn: () => fetchPensionerProfileUpdateRequests(pensionerId),
    enabled: !!pensionerId,
  })

  const filteredRequests = useMemo(() => {
    if (!requests) return []
    return requests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) return false
      return matchesListSearch(search, [
        request.id,
        request.ppoNumber,
        REQUEST_TYPE_LABELS[request.requestType],
      ])
    })
  }, [requests, search, statusFilter])

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <AdminListPageHeader
        title="My Requests"
        count={filteredRequests.length}
        description="Track your profile update requests and their status"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          <Button className="h-10 rounded-lg px-4 shadow-sm" asChild>
            <Link to="/pensioner/profile/request">
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
              <Label htmlFor="my-request-status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as 'all' | ProfileUpdateRequestStatus)
                }
              >
                <SelectTrigger id="my-request-status-filter" className="w-full rounded-lg">
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

      <ProfileSubNav activePath="/pensioner/profile/requests" />

      {filteredRequests.length ? (
        <DataListView
          columns={columns}
          data={filteredRequests}
          pageSize={8}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(request, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={request.id}
              subtitle={request.ppoNumber}
              badges={<ProfileUpdateStatusBadge status={request.status} />}
              fields={[
                { label: 'Type', value: REQUEST_TYPE_LABELS[request.requestType] },
                { label: 'Submitted', value: request.submittedAt },
                { label: 'Last Updated', value: request.updatedAt },
              ]}
              action={
                <Button variant="outline" size="sm" className="w-full rounded-full" asChild>
                  <Link to="/pensioner/profile/requests/$id" params={{ id: request.id }}>
                    <Eye className="mr-1 size-3.5" /> View Request
                  </Link>
                </Button>
              }
            />
          )}
        />
      ) : (
        <EmptyState
          title="No requests yet"
          description="Submit a profile update request when you need to change your registered information."
          action={
            <Button className="rounded-full" asChild>
              <Link to="/pensioner/profile/request">Request Profile Update</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
