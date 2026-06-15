import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { AlertTriangle, Eye } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { GrievancePriorityBadge } from '@/components/grievance/grievance-priority-badge'
import { GrievanceStatusBadge } from '@/components/grievance/grievance-status-badge'
import { useGrievancePortal } from '@/components/grievance/grievance-portal-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchGrievanceTickets } from '@/data/grievance-api'
import { formatGrievanceDateTime, GRIEVANCE_CATEGORY_LABELS, GRIEVANCE_STATUS_LABELS } from '@/lib/grievance'
import { matchesListSearch } from '@/lib/list-search'
import type { GrievanceTicket, GrievanceTicketStatus } from '@/types/grievance'

export function GrievanceTicketsPage() {
  const navigate = useNavigate()
  const { basePath } = useGrievancePortal()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | GrievanceTicketStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['grievance-tickets'],
    queryFn: fetchGrievanceTickets,
  })

  const filteredTickets = useMemo(() => {
    if (!tickets) return []
    return tickets.filter((ticket) => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
      return matchesListSearch(search, [
        ticket.id,
        ticket.ppoNumber,
        ticket.pensionerName,
        ticket.subject,
        GRIEVANCE_CATEGORY_LABELS[ticket.category],
        ticket.assignedToName,
      ])
    })
  }, [tickets, search, statusFilter])

  const columns = useMemo<ColumnDef<GrievanceTicket>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Ticket ID',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-medium">{row.original.id}</span>
            {row.original.slaBreached && (
              <AlertTriangle className="size-3.5 text-red-500" aria-label="SLA Breached" />
            )}
          </div>
        ),
      },
      { accessorKey: 'ppoNumber', header: 'PPO Number' },
      { accessorKey: 'pensionerName', header: 'Pensioner' },
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
        cell: ({ row }) => (
          <span className="text-xs">{formatGrievanceDateTime(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <GrievanceStatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => navigate({ href: `${basePath}/tickets/${row.original.id}` })}
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
      <AdminListPageHeader
        title="Ticket Queue"
        count={filteredTickets.length}
        description="Review, assign, and manage pensioner grievance tickets"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by ticket ID, PPO, name..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter tickets"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label htmlFor="grievance-queue-status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as 'all' | GrievanceTicketStatus)}
              >
                <SelectTrigger id="grievance-queue-status" className="w-full rounded-lg">
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
        pageSize={10}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={false}
        renderCard={(ticket, serialNo) => (
          <ListRecordCard
            serialNo={serialNo}
            title={ticket.subject}
            subtitle={`${ticket.id} · ${ticket.ppoNumber}`}
            badges={
              <>
                <GrievanceStatusBadge status={ticket.status} />
                <GrievancePriorityBadge priority={ticket.priority} />
                {ticket.slaBreached && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">
                    <AlertTriangle className="size-3" /> SLA Breached
                  </span>
                )}
              </>
            }
            fields={[
              { label: 'Pensioner', value: ticket.pensionerName },
              { label: 'Issue Type', value: GRIEVANCE_CATEGORY_LABELS[ticket.category] },
              { label: 'Assigned To', value: ticket.assignedToName ?? 'Unassigned' },
              { label: 'Created', value: formatGrievanceDateTime(ticket.createdAt) },
            ]}
            action={
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-full"
                onClick={() => navigate({ href: `${basePath}/tickets/${ticket.id}` })}
              >
                <Eye className="mr-1 size-3.5" /> View Ticket
              </Button>
            }
          />
        )}
      />
    </motion.div>
  )
}
