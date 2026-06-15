import type { ReactNode } from 'react'
import { Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ListFiltersPopoverProps {
  activeCount?: number
  title?: string
  onClear?: () => void
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ListFiltersPopover({
  activeCount = 0,
  title = 'Filter results',
  onClear,
  children,
  open,
  onOpenChange,
}: ListFiltersPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 gap-2 rounded-lg px-4 shadow-sm">
          <Filter className="size-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 rounded-xl p-4">
        <PopoverHeader className="mb-4">
          <PopoverTitle>{title}</PopoverTitle>
        </PopoverHeader>
        <div className="space-y-4">
          {children}
          {activeCount > 0 && onClear && (
            <Button variant="ghost" className="w-full rounded-lg" onClick={onClear}>
              Clear filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
