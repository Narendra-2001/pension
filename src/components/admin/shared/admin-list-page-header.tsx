import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

import { ViewModeToggle, type ViewMode } from '@/components/admin/shared/view-mode-toggle'
import { Input } from '@/components/ui/input'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

interface AdminListPageHeaderProps {
  title: string
  count?: number
  description?: string
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  actions?: ReactNode
  filters?: ReactNode
  className?: string
}

export function AdminListPageHeader({
  title,
  count,
  description,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  viewMode,
  onViewModeChange,
  actions,
  filters,
  className,
}: AdminListPageHeaderProps) {
  const isMobile = useIsMobile()
  const showControls =
    onSearchChange || actions || filters || (viewMode && onViewModeChange)
  const showViewToggle = Boolean(viewMode && onViewModeChange && !isMobile)

  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="admin-page-title">
          {title}
          {count !== undefined && (
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
              ({count.toLocaleString('en-IN')})
            </span>
          )}
        </h1>
        {description && <p className="admin-page-desc">{description}</p>}
      </div>

      {showControls && (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:max-w-[min(100%,48rem)]">
          {onSearchChange !== undefined && (
            <div className="relative min-w-[200px] max-w-sm flex-1 sm:max-w-[17.5rem]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search ?? ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 rounded-lg border-border/60 bg-card pl-9 shadow-sm"
              />
            </div>
          )}

          {showViewToggle && (
            <ViewModeToggle value={viewMode!} onChange={onViewModeChange!} variant="icon" />
          )}

          {(actions || filters) && (
            <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible sm:pb-0">
              {actions}
              {filters}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
