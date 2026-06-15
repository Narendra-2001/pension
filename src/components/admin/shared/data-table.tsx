import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useMemo, useState } from 'react'

import { adminTableStyles } from '@/components/admin/shared/admin-table-styles'
import { ListPagination } from '@/components/admin/shared/list-pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  pageSize?: number
  className?: string
  emptyMessage?: string
  showSerialNumber?: boolean
}

function createSerialColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: 'slNo',
    header: 'Sl. No.',
    enableSorting: false,
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination
      return (
        <span className="tabular-nums text-muted-foreground">
          {pageIndex * pageSize + row.index + 1}
        </span>
      )
    },
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  className,
  emptyMessage = 'No records found',
  showSerialNumber = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const tableColumns = useMemo(
    () => (showSerialNumber ? [createSerialColumn<TData>(), ...columns] : columns),
    [columns, showSerialNumber],
  )

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize } },
  })

  const pageIndex = table.getState().pagination.pageIndex
  const currentPageSize = table.getState().pagination.pageSize
  const totalRows = table.getFilteredRowModel().rows.length

  return (
    <div className={cn('space-y-4', className)}>
      <div className={adminTableStyles.wrap}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={adminTableStyles.headerRow}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className={adminTableStyles.headCell}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody key={`${pageIndex}-${currentPageSize}`}>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={adminTableStyles.bodyRow}
                  style={{ '--table-row-index': row.index } as React.CSSProperties}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={adminTableStyles.bodyCell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className={adminTableStyles.emptyCell}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ListPagination
        pageIndex={pageIndex}
        pageSize={currentPageSize}
        totalRows={totalRows}
        onPageIndexChange={(index) => table.setPageIndex(index)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </div>
  )
}

export function SortableHeader({
  column,
  children,
}: {
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' }
  children: React.ReactNode
}) {
  const sorted = column.getIsSorted()

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:text-primary-foreground/85"
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {children}
      {sorted === 'asc' ? (
        <ArrowUp className="size-3.5 opacity-70" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="size-3.5 opacity-70" />
      ) : null}
    </button>
  )
}
