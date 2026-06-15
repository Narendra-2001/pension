import { cn } from '@/lib/utils'

type BrandMarkSize = 'sm' | 'md' | 'lg'

const MARK_SIZE: Record<BrandMarkSize, string> = {
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-12',
}

interface BrandMarkProps {
  size?: BrandMarkSize
  className?: string
  label?: string
}

export function BrandMark({ size = 'md', className, label = 'PF' }: BrandMarkProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground',
        MARK_SIZE[size],
        className,
      )}
      aria-hidden
    >
      <span className="text-[11px] font-bold tracking-tight">{label}</span>
    </div>
  )
}

interface BrandLogoProps {
  size?: BrandMarkSize
  title?: string
  subtitle?: string
  markLabel?: string
  className?: string
}

export function BrandLogo({
  size = 'md',
  title = 'PensionFlow',
  subtitle = 'Admin Portal',
  markLabel = 'PF',
  className,
}: BrandLogoProps) {
  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <BrandMark size={size} label={markLabel} />
      <div className="min-w-0 leading-none">
        <div className="truncate text-[15px] font-semibold tracking-tight text-foreground">{title}</div>
        {subtitle && (
          <div className="mt-1 truncate text-[11px] font-normal text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  )
}
