import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'

export type DocumentPreviewVariant = 'full' | 'compact' | 'thumbnail'

export function formatDocDate(date?: string, pattern = 'dd/MM/yyyy') {
  if (!date) return '—'
  try {
    return format(parseISO(date), pattern)
  } catch {
    return date
  }
}

export function maskAadhaar(value?: string) {
  if (!value) return 'XXXX XXXX 2345'
  const digits = value.replace(/\s/g, '')
  if (digits.length < 4) return value
  return `XXXX XXXX ${digits.slice(-4)}`
}

export function formatAadhaarDisplay(value?: string) {
  if (!value) return '4567 8901 2345'
  const digits = value.replace(/\s/g, '')
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export function DocField({
  label,
  value,
  compact,
  mono,
}: {
  label: string
  value: string
  compact?: boolean
  mono?: boolean
}) {
  return (
    <div>
      <p
        className={cn(
          'font-medium uppercase tracking-wide text-slate-500',
          compact ? 'text-[4px]' : 'text-[7px]',
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'font-semibold leading-tight text-slate-900',
          compact ? 'text-[6px]' : 'text-[11px] sm:text-xs',
          mono && 'font-mono tracking-wide',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function PhotoPlaceholder({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-sm border border-slate-400 bg-gradient-to-b from-slate-200 to-slate-300',
        compact ? 'h-10 w-8' : 'h-24 w-[4.5rem] sm:h-28 sm:w-20',
        className,
      )}
    >
      <div className="flex h-full flex-col items-center justify-end pb-1">
        <div className={cn('rounded-full bg-slate-500', compact ? 'mb-0.5 size-2.5' : 'mb-1 size-6')} />
        <div className={cn('rounded-t-full bg-slate-500', compact ? 'h-2 w-3' : 'h-5 w-8')} />
      </div>
    </div>
  )
}

export function QrPlaceholder({ compact }: { compact?: boolean }) {
  return (
    <div className={cn('rounded border border-slate-300 bg-white/80', compact ? 'size-5' : 'size-10')}>
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-px p-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className={cn(i % 2 === 0 ? 'bg-slate-900' : 'bg-white', compact ? 'rounded-[1px]' : 'rounded-[2px]')}
          />
        ))}
      </div>
    </div>
  )
}

export function OfficialStamp({ compact, label = 'VERIFIED' }: { compact?: boolean; label?: string }) {
  return (
    <div
      className={cn(
        'flex rotate-[-12deg] items-center justify-center rounded-full border-2 border-dashed border-emerald-600/70 text-emerald-700',
        compact ? 'size-8 text-[4px]' : 'size-16 text-[7px]',
      )}
    >
      <span className="font-bold uppercase tracking-wider">{label}</span>
    </div>
  )
}
