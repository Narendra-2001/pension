import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** @deprecated use `action` */
  actions?: ReactNode
  action?: ReactNode
  className?: string
  variant?: 'default' | 'admin'
  meta?: ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  action,
  className,
  variant = 'default',
  meta,
}: PageHeaderProps) {
  const isAdmin = variant === 'admin'
  const headerAction = action ?? actions

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:items-center',
        isAdmin ? 'mb-6 lg:items-start' : 'mb-8 sm:mb-10',
        className,
      )}
    >
      <div className="min-w-0">
        {meta && isAdmin && <div className="mb-2">{meta}</div>}
        <h1
          className={cn(
            isAdmin ? 'admin-page-title' : 'text-2xl font-bold tracking-tight text-foreground sm:text-[2rem]',
          )}
        >
          {title}
        </h1>
        {description && (
          <p className={cn(isAdmin ? 'admin-page-desc' : 'mt-1 text-sm text-muted-foreground')}>
            {description}
          </p>
        )}
      </div>
      {headerAction && (
        <div className={cn('flex shrink-0 flex-wrap items-center gap-2', isAdmin && 'sm:ml-4')}>
          {headerAction}
        </div>
      )}
    </div>
  )
}
