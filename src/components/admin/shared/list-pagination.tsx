import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ListPaginationProps {
  pageIndex: number
  pageSize: number
  totalRows: number
  onPageIndexChange: (index: number) => void
  onPageSizeChange: (size: number) => void
}

export function ListPagination({
  pageIndex,
  pageSize,
  totalRows,
  onPageIndexChange,
  onPageSizeChange,
}: ListPaginationProps) {
  if (totalRows === 0) return null

  const pageCount = Math.max(Math.ceil(totalRows / pageSize), 1)
  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className="flex flex-col gap-3 text-sm lg:flex-row lg:items-center lg:justify-between">
      <p className="text-muted-foreground">
        Showing {start}–{end} of {totalRows.toLocaleString('en-IN')}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="admin-toolbar-select h-9 w-[72px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {[5, 10, 20, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={pageIndex === 0}
          onClick={() => onPageIndexChange(pageIndex - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="px-2 tabular-nums">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={pageIndex >= pageCount - 1}
          onClick={() => onPageIndexChange(pageIndex + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
