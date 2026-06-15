import { LayoutGrid, Table2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export type ViewMode = 'table' | 'card'

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
  variant?: 'default' | 'icon'
}

export function ViewModeToggle({
  value,
  onChange,
  className,
  variant = 'default',
}: ViewModeToggleProps) {
  if (variant === 'icon') {
    return (
      <div
        className={cn(
          'inline-flex shrink-0 items-center overflow-hidden rounded-lg border border-border/60 bg-card',
          className,
        )}
        role="group"
        aria-label="View mode"
      >
        <button
          type="button"
          onClick={() => onChange('table')}
          className={cn(
            'inline-flex size-10 items-center justify-center transition-colors',
            value === 'table'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
          aria-pressed={value === 'table'}
          aria-label="Table view"
        >
          <Table2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onChange('card')}
          className={cn(
            'inline-flex size-10 items-center justify-center border-l border-border/60 transition-colors',
            value === 'card'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          )}
          aria-pressed={value === 'card'}
          aria-label="Card view"
        >
          <LayoutGrid className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border border-border/60 bg-card p-1',
        className,
      )}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => onChange('table')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
          value === 'table'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={value === 'table'}
      >
        <Table2 className="size-3.5" />
        Table
      </button>
      <button
        type="button"
        onClick={() => onChange('card')}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
          value === 'card'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        aria-pressed={value === 'card'}
      >
        <LayoutGrid className="size-3.5" />
        Cards
      </button>
    </div>
  )
}
