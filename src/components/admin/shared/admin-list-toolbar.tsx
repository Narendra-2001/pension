import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface AdminListToolbarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: {
    value: string
    onChange: (value: string) => void
    placeholder: string
    options: FilterOption[]
  }[]
  children?: ReactNode
  className?: string
}

export function AdminListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  children,
  className,
}: AdminListToolbarProps) {
  return (
    <div className={cn('admin-list-toolbar', className)}>
      {onSearchChange !== undefined && (
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="admin-toolbar-search pl-10"
          />
        </div>
      )}

      {filters?.map((filter) => (
        <Select key={filter.placeholder} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="admin-toolbar-select h-10 w-full sm:w-40">
            <SelectValue placeholder={filter.placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {children}
    </div>
  )
}
