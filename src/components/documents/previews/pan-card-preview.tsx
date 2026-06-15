import { format, parseISO } from 'date-fns'

import { cn } from '@/lib/utils'

export interface PanCardHolderDetails {
  holderName: string
  panNumber: string
  dateOfBirth?: string
  fatherName?: string
}

interface PanCardPreviewProps extends PanCardHolderDetails {
  variant?: 'full' | 'compact' | 'thumbnail'
  className?: string
}

function formatPanDob(dateOfBirth?: string) {
  if (!dateOfBirth) return '—'
  try {
    return format(parseISO(dateOfBirth), 'dd/MM/yyyy')
  } catch {
    return dateOfBirth
  }
}

function PanField({
  label,
  value,
  compact,
}: {
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div>
      <p
        className={cn(
          'font-medium uppercase tracking-wide text-slate-500',
          compact ? 'text-[5px]' : 'text-[7px]',
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'font-semibold leading-tight text-slate-900',
          compact ? 'text-[7px]' : 'text-[11px] sm:text-xs',
        )}
      >
        {value}
      </p>
    </div>
  )
}

export function PanCardPreview({
  holderName,
  panNumber,
  dateOfBirth,
  fatherName = '—',
  variant = 'full',
  className,
}: PanCardPreviewProps) {
  const compact = variant === 'compact' || variant === 'thumbnail'
  const isThumbnail = variant === 'thumbnail'

  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-xl border border-[#9ec9e8]/80 shadow-[0_8px_32px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]',
        'bg-[linear-gradient(135deg,#edf6fc_0%,#d8ebf8_38%,#f7f2ea_100%)]',
        isThumbnail ? 'max-w-none' : 'w-full max-w-[520px]',
        className,
      )}
      style={{ aspectRatio: '1.586 / 1' }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 9px)',
        }}
      />

      <div className="relative flex h-full flex-col">
        <div className={cn('flex items-start justify-between', compact ? 'px-2 pt-1.5' : 'px-4 pt-3')}>
          <div className="flex items-start gap-2">
            <div
              className={cn(
                'flex shrink-0 items-center justify-center rounded-full border border-[#c9a227]/50 bg-[#f5e6b8]',
                compact ? 'size-5' : 'size-8',
              )}
            >
              <div
                className={cn(
                  'rounded-full border border-[#c9a227]',
                  compact ? 'size-3' : 'size-5',
                )}
                style={{
                  background:
                    'conic-gradient(from 180deg, #1e3a5f 0deg, #1e3a5f 120deg, #fff 120deg, #1e5f3a 240deg, #fff 240deg, #1e3a5f 360deg)',
                }}
              />
            </div>
            <div>
              <p className={cn('font-semibold text-[#1e3a5f]', compact ? 'text-[5px]' : 'text-[8px]')}>
                आयकर विभाग
              </p>
              <p
                className={cn(
                  'font-bold tracking-[0.08em] text-[#0f2744]',
                  compact ? 'text-[5px]' : 'text-[7px]',
                )}
              >
                INCOME TAX DEPARTMENT
              </p>
              <p className={cn('text-[#334155]', compact ? 'text-[4px]' : 'text-[6px]')}>GOVT. OF INDIA</p>
            </div>
          </div>
          <div className={cn('text-right text-[#334155]', compact ? 'text-[4px]' : 'text-[6px]')}>
            <p>स्थायी लेखा संख्या कार्ड</p>
            <p className="font-semibold text-[#0f2744]">Permanent Account Number Card</p>
          </div>
        </div>

        <div className={cn(compact ? 'px-2 py-0.5' : 'px-4 py-1')}>
          <p className={cn('text-[#475569]', compact ? 'text-[4px]' : 'text-[7px]')}>
            Permanent Account Number
          </p>
          <p
            className={cn(
              'font-bold tracking-[0.18em] text-[#0f172a]',
              compact ? 'text-[9px]' : 'text-lg sm:text-xl',
            )}
            style={{ fontFamily: 'ui-monospace, monospace' }}
          >
            {panNumber}
          </p>
        </div>

        <div className={cn('flex flex-1 gap-2', compact ? 'px-2 pb-1' : 'gap-3 px-4 pb-2')}>
          <div className={cn('flex min-w-0 flex-1 flex-col justify-center', compact ? 'gap-0.5' : 'gap-2')}>
            <PanField label="Name" value={holderName} compact={compact} />
            <PanField label="Father's Name" value={fatherName} compact={compact} />
            <PanField label="Date of Birth" value={formatPanDob(dateOfBirth)} compact={compact} />
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <div
              className={cn(
                'overflow-hidden rounded-sm border border-[#94a3b8] bg-[linear-gradient(180deg,#e2e8f0_0%,#cbd5e1_100%)]',
                compact ? 'h-10 w-8' : 'h-24 w-[4.5rem] sm:h-28 sm:w-20',
              )}
            >
              <div className="flex h-full flex-col items-center justify-end pb-1">
                <div
                  className={cn(
                    'rounded-full bg-[#64748b]',
                    compact ? 'mb-0.5 size-2.5' : 'mb-1 size-6',
                  )}
                />
                <div
                  className={cn(
                    'rounded-t-full bg-[#64748b]',
                    compact ? 'h-2 w-3' : 'h-5 w-8',
                  )}
                />
              </div>
            </div>
            {!isThumbnail && (
              <div
                className={cn(
                  'rounded border border-[#cbd5e1] bg-white/70',
                  compact ? 'size-5' : 'size-10',
                )}
              >
                <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-px p-0.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        i % 2 === 0 ? 'bg-[#0f172a]' : 'bg-white',
                        compact ? 'rounded-[1px]' : 'rounded-[2px]',
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            'mt-auto border-t border-[#9ec9e8]/50',
            compact ? 'h-1.5' : 'h-3',
          )}
          style={{
            background:
              'linear-gradient(90deg, rgba(251,191,36,0.55) 0%, rgba(52,211,153,0.45) 35%, rgba(56,189,248,0.45) 70%, rgba(251,191,36,0.55) 100%)',
          }}
        />

        {!compact && (
          <p className="absolute bottom-3 left-4 text-[6px] text-slate-400/80">
            Sample document preview · Not for official use
          </p>
        )}
      </div>
    </div>
  )
}
