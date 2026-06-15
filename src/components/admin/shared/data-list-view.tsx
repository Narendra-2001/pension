import type { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState, type ReactNode } from 'react'

import { DataTable } from '@/components/admin/shared/data-table'
import { ListPagination } from '@/components/admin/shared/list-pagination'
import { ViewModeToggle, type ViewMode } from '@/components/admin/shared/view-mode-toggle'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface DataListViewProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderCard: (item: TData, serialNo: number) => ReactNode
  pageSize?: number
  showSerialNumber?: boolean
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  defaultViewMode?: ViewMode
  showViewToggle?: boolean
  className?: string
}

export function DataListView<TData, TValue>({
  columns,
  data,
  renderCard,
  pageSize: initialPageSize = 10,
  showSerialNumber = true,
  viewMode: controlledViewMode,
  onViewModeChange,
  defaultViewMode = 'table',
  showViewToggle = true,
  className,
}: DataListViewProps<TData, TValue>) {
  const isMobile = useIsMobile()
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>(defaultViewMode)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const resolvedShowViewToggle = showViewToggle && !isMobile

  const viewMode = controlledViewMode ?? internalViewMode
  const setViewMode = onViewModeChange ?? setInternalViewMode

  useEffect(() => {
    setPageIndex(0)
  }, [data.length, viewMode, pageSize])

  const pageCount = Math.max(Math.ceil(data.length / pageSize), 1)
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const pageData = data.slice(safePageIndex * pageSize, safePageIndex * pageSize + pageSize)

  return (
    <div className={cn('space-y-4', className)}>
      {resolvedShowViewToggle && (
        <div className="flex justify-end">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>
      )}

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={data}
          pageSize={pageSize}
          showSerialNumber={showSerialNumber}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:gap-5">
            {pageData.map((item, index) =>
              renderCard(item, safePageIndex * pageSize + index + 1),
            )}
          </div>
          <ListPagination
            pageIndex={safePageIndex}
            pageSize={pageSize}
            totalRows={data.length}
            onPageIndexChange={setPageIndex}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPageIndex(0)
            }}
          />
        </>
      )}
    </div>
  )
}
