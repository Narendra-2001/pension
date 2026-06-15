import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useMemo, useState } from 'react'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { GrievancePriorityBadge } from '@/components/grievance/grievance-priority-badge'
import { GrievanceStatusBadge } from '@/components/grievance/grievance-status-badge'
import { Button } from '@/components/ui/button'
import { fetchGrievanceTicketsByPensioner } from '@/data/grievance-api'
import {
  formatGrievanceDateTime,
  GRIEVANCE_CATEGORY_LABELS,
  HISTORY_GRIEVANCE_STATUSES,
} from '@/lib/grievance'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { GrievanceTicket } from '@/types/grievance'

export function TicketHistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const pensionerId = user?.pensionerId ?? ''
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['pensioner-grievances', pensionerId],
    queryFn: () => fetchGrievanceTicketsByPensioner(pensionerId),
    enabled: !!pensionerId,
  })

  const historyTickets = useMemo(() => {
    if (!tickets) return []
    return tickets.filter((t) => HISTORY_GRIEVANCE_STATUSES.includes(t.status))
  }, [tickets])

  const filteredTickets = useMemo(() => {
    return historyTickets.filter((ticket) =>
      matchesListSearch(search, [
        ticket.id,
        ticket.subject,
        GRIEVANCE_CATEGORY_LABELS[ticket.category],
        ticket.resolution?.notes,
      ]),
    )
  }, [historyTickets, search])

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

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <AdminListPageHeader
        title="Ticket History"
        count={filteredTickets.length}
        description="View your resolved and closed grievance tickets"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search history..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
            subtitle={`${ticket.id} · Closed ${formatGrievanceDateTime(ticket.updatedAt)}`}
            badges={<GrievanceStatusBadge status={ticket.status} />}
            fields={[
              { label: 'Issue Type', value: GRIEVANCE_CATEGORY_LABELS[ticket.category] },
              { label: 'Resolution', value: ticket.resolution?.notes ?? '—' },
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
