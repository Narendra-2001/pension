import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { Download, Printer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { getVerificationStatusVariant, StatusPill } from '@/components/pensioner/shared/status-pill'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchPensionStatements } from '@/data/pensioner-api'
import { formatCurrency } from '@/data/pensioner-mock-data'
import { matchesListSearch } from '@/lib/list-search'
import type { PensionStatement } from '@/types/pensioner-portal'

export function PensionStatementsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | PensionStatement['status']>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data: statements, isLoading } = useQuery({
    queryKey: ['pensioner-statements'],
    queryFn: fetchPensionStatements,
  })

  const handleAction = (action: string, month: string) => {
    toast.success(`${action} — ${month}`, { description: 'Demo action completed' })
  }

  const filteredStatements = useMemo(() => {
    if (!statements) return []
    return statements.filter((stmt) => {
      if (statusFilter !== 'all' && stmt.status !== statusFilter) return false
      return matchesListSearch(search, [stmt.month, stmt.status])
    })
  }, [statements, search, statusFilter])

  const columns = useMemo<ColumnDef<PensionStatement>[]>(
    () => [
      { accessorKey: 'month', header: 'Month' },
      {
        accessorKey: 'grossPension',
        header: 'Gross',
        cell: ({ row }) => formatCurrency(row.original.grossPension),
      },
      {
        accessorKey: 'recoveryAmount',
        header: 'Recovery',
        cell: ({ row }) => formatCurrency(row.original.recoveryAmount),
      },
      {
        accessorKey: 'deductions',
        header: 'Deductions',
        cell: ({ row }) => formatCurrency(row.original.deductions),
      },
      {
        accessorKey: 'netPension',
        header: 'Net Pension',
        cell: ({ row }) => (
          <span className="font-semibold">{formatCurrency(row.original.netPension)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusPill
            label={row.original.status}
            variant={getVerificationStatusVariant(row.original.status)}
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button size="icon-sm" variant="ghost" onClick={() => handleAction('Download PDF', row.original.month)}>
              <Download className="size-4" />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={() => handleAction('Print', row.original.month)}>
              <Printer className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const stmtActions = (stmt: PensionStatement) => (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleAction('Download PDF', stmt.month)}>
        <Download className="mr-1 size-3.5" /> Download
      </Button>
      <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleAction('Print', stmt.month)}>
        <Printer className="mr-1 size-3.5" /> Print
      </Button>
    </div>
  )

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <AdminListPageHeader
        title="Pension Statements"
        count={filteredStatements.length}
        description="Monthly pension payment history"
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={
          <ListFiltersPopover
            activeCount={activeFilterCount}
            title="Filter statements"
            onClear={() => setStatusFilter('all')}
          >
            <div className="space-y-2">
              <Label htmlFor="statement-status-filter">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as 'all' | PensionStatement['status'])}
              >
                <SelectTrigger id="statement-status-filter" className="w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ListFiltersPopover>
        }
      />

      <DataListView
        columns={columns}
        data={filteredStatements}
        pageSize={10}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showViewToggle={false}
        renderCard={(stmt, serialNo) => (
          <ListRecordCard
            serialNo={serialNo}
            title={stmt.month}
            subtitle={formatCurrency(stmt.netPension)}
            badges={
              <StatusPill
                label={stmt.status}
                variant={getVerificationStatusVariant(stmt.status)}
              />
            }
            fields={[
              { label: 'Gross', value: formatCurrency(stmt.grossPension) },
              { label: 'Recovery', value: formatCurrency(stmt.recoveryAmount) },
              { label: 'Deductions', value: formatCurrency(stmt.deductions) },
            ]}
            action={stmtActions(stmt)}
          />
        )}
      />
    </div>
  )
}
