import type { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

import { DataTable } from '@/components/admin/shared/data-table'
import { Badge } from '@/components/ui/badge'
import {
  formatPensionCurrency,
  PENSION_COMPONENT_CALC_TYPE_LABELS,
  PENSION_COMPONENT_CATEGORY_LABELS,
} from '@/lib/pension-structure'
import type { PensionComponent } from '@/types/pension-structure'

interface PensionComponentTableProps {
  components: PensionComponent[]
  onEdit?: (component: PensionComponent) => void
}

export function PensionComponentTable({ components, onEdit }: PensionComponentTableProps) {
  const columns = useMemo<ColumnDef<PensionComponent>[]>(
    () => [
      { accessorKey: 'name', header: 'Component Name' },
      {
        accessorKey: 'calcType',
        header: 'Component Type',
        cell: ({ row }) => PENSION_COMPONENT_CALC_TYPE_LABELS[row.original.calcType],
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {PENSION_COMPONENT_CATEGORY_LABELS[row.original.category]}
          </Badge>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="font-medium">{formatPensionCurrency(row.original.amount)}</span>
        ),
      },
      { accessorKey: 'effectiveDate', header: 'Effective Date' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={
              row.original.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-700'
                : 'bg-muted text-muted-foreground'
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      ...(onEdit
        ? [
            {
              id: 'actions',
              header: '',
              cell: ({ row }: { row: { original: PensionComponent } }) => (
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => onEdit(row.original)}
                >
                  Edit
                </button>
              ),
            } as ColumnDef<PensionComponent>,
          ]
        : []),
    ],
    [onEdit],
  )

  return (
    <DataTable
      data={components}
      columns={columns}
      searchKey="name"
      emptyMessage="No pension components configured"
    />
  )
}
