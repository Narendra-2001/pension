import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Eye, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { GrievancePriorityBadge } from '@/components/grievance/grievance-priority-badge'
import { GrievanceStatusBadge } from '@/components/grievance/grievance-status-badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchGrievanceTicketsByPensioner } from '@/data/grievance-api'
import {
  ACTIVE_GRIEVANCE_STATUSES,
  formatGrievanceDateTime,
  GRIEVANCE_CATEGORY_LABELS,
  GRIEVANCE_STATUS_LABELS,
} from '@/lib/grievance'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { GrievanceTicket, GrievanceTicketStatus } from '@/types/grievance'

export function MyTicketsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const pensionerId = user?.pensionerId ?? ''
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | GrievanceTicketStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['pensioner-grievances', pensionerId],
    queryFn: () => fetchGrievanceTicketsByPensioner(pensionerId),
    enabled: !!pensionerId,
  })

  const activeTickets = useMemo(() => {
    if (!tickets) return []
    return tickets.filter((t) => ACTIVE_GRIEVANCE_STATUSES.includes(t.status) || t.status === 'resolved')
  }, [tickets])

  const filteredTickets = useMemo(() => {
    return activeTickets.filter((ticket) => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
      return matchesListSearch(search, [
        ticket.id,
        ticket.subject,
        GRIEVANCE_CATEGORY_LABELS[ticket.category],
      ])
    })
  }, [activeTickets, search, statusFilter])

  const columns = useMemo<ColumnDef<GrievanceTicket>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Ticket ID',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
      },
      { accessorKey: 'subject', header: 'Subject' },
      {
        accessorKey: 'category',
        header: 'Issue Type',
        cell: ({ row }) => GRIEVANCE_CATEGORY_LABELS[row.original.category],
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => <GrievancePriorityBadge priority={row.original.priority} />,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => formatGrievanceDateTime(row.original.createdAt),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <GrievanceStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'assignedToName',
        header: 'Assigned To',
        cell: ({ row }) => row.original.assignedToName ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => navigate({ href: `/pensioner/grievance/${row.original.id}` })}
          >
            <Eye className="mr-1 size-3.5" /> View
          </Button>
        ),
      },
    ],
    [navigate],
  )

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AdminListPageHeader
        title="My Tickets"
        count={filteredTickets.length}
        description="Track your active grievance and support tickets"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tickets..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={
          <Button className="h-10 rounded-lg px-4 shadow-sm" onClick={() => navigate({ href: '/pensioner/grievance/raise' })}>
            <Plus className="size-4" /> Raise Ticket
          </Button>
        }
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter tickets"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label htmlFor="my-tickets-status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as 'all' | GrievanceTicketStatus)}
              >
                <SelectTrigger id="my-tickets-status" className="w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All statuses</SelectItem>
                  {Object.entries(GRIEVANCE_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

      <DataListView
        columns={columns}
        data={filteredTickets}
        pageSize={8}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={false}
        renderCard={(ticket, serialNo) => (
          <ListRecordCard
            serialNo={serialNo}
            title={ticket.subject}
            subtitle={`${ticket.id} · ${GRIEVANCE_CATEGORY_LABELS[ticket.category]}`}
            badges={
              <>
                <GrievanceStatusBadge status={ticket.status} />
                <GrievancePriorityBadge priority={ticket.priority} />
              </>
            }
            fields={[
              { label: 'Created', value: formatGrievanceDateTime(ticket.createdAt) },
              { label: 'Assigned To', value: ticket.assignedToName ?? 'Unassigned' },
            ]}
            action={
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full"
                onClick={() => navigate({ href: `/pensioner/grievance/${ticket.id}` })}
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
