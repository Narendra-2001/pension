import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { FileText } from 'lucide-react'

import { DataTable } from '@/components/admin/shared/data-table'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { fetchGrievanceAuditLogs } from '@/data/grievance-api'
import { formatGrievanceDateTime, GRIEVANCE_AUDIT_ACTION_LABELS, GRIEVANCE_STATUS_LABELS } from '@/lib/grievance'
import type { GrievanceAuditEntry } from '@/types/grievance'

export function GrievanceAuditPage() {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['grievance-audit-all'],
    queryFn: () => fetchGrievanceAuditLogs(),
  })

  const columns = useMemo<ColumnDef<GrievanceAuditEntry>[]>(
    () => [
      {
        accessorKey: 'ticketId',
        header: 'Ticket ID',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.ticketId}</span>,
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => GRIEVANCE_AUDIT_ACTION_LABELS[row.original.action],
      },
      { accessorKey: 'user', header: 'User' },
      {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => formatGrievanceDateTime(row.original.timestamp),
      },
      {
        id: 'statusChange',
        header: 'Status Change',
        cell: ({ row }) => {
          const { oldStatus, newStatus } = row.original
          if (!oldStatus || !newStatus) return '—'
          return `${GRIEVANCE_STATUS_LABELS[oldStatus]} → ${GRIEVANCE_STATUS_LABELS[newStatus]}`
        },
      },
      { accessorKey: 'remarks', header: 'Remarks', cell: ({ row }) => row.original.remarks ?? '—' },
    ],
    [],
  )

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Grievance Audit Trail"
        description="Complete audit log of all grievance ticket actions across the system"
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border bg-muted/30 p-3 text-sm text-muted-foreground">
        <FileText className="size-4" />
        {auditLogs?.length ?? 0} audit entries recorded
      </div>

      <DataTable columns={columns} data={auditLogs ?? []} pageSize={15} />
    </motion.div>
  )
}
