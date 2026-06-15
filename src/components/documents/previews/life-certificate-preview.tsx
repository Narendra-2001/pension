import type { DocumentPreviewContext } from '@/lib/document-preview-data'
import { cn } from '@/lib/utils'

import { DocField, formatDocDate, OfficialStamp, type DocumentPreviewVariant } from './shared'

interface LifeCertificatePreviewProps {
  context: DocumentPreviewContext
  certificateDate?: string
  variant?: DocumentPreviewVariant
  className?: string
}

export function LifeCertificatePreview({
  context,
  certificateDate,
  variant = 'full',
  className,
}: LifeCertificatePreviewProps) {
  const compact = variant === 'compact' || variant === 'thumbnail'
  const certDate = formatDocDate(certificateDate ?? new Date().toISOString().split('T')[0])

  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-xl border-2 border-[#1e3a5f]/20 bg-[#fffef8] shadow-lg',
        compact ? 'max-w-none' : 'w-full max-w-[520px]',
        className,
      )}
      style={{ aspectRatio: '1 / 1.414' }}
    >
      <div className={cn('border-b-2 border-[#1e3a5f]/30 bg-[#f0f4f8]', compact ? 'px-2 py-1.5' : 'px-5 py-4')}>
        <p className={cn('text-center font-bold uppercase tracking-[0.15em] text-[#1e3a5f]', compact ? 'text-[6px]' : 'text-sm')}>
          Life Certificate
        </p>
        <p className={cn('text-center text-[#475569]', compact ? 'text-[4px]' : 'text-[10px]')}>
          Form for pensioners · To be submitted annually
        </p>
      </div>

      <div className={cn('relative', compact ? 'space-y-1 p-2' : 'space-y-3 p-5')}>
        <div className={cn('grid grid-cols-2 gap-2', compact ? 'gap-1' : 'gap-3')}>
          <DocField label="PPO Number" value={context.ppoNumber} compact={compact} mono />
          <DocField label="Certificate Date" value={certDate} compact={compact} />
        </div>

        <DocField label="Name of Pensioner" value={context.holderName} compact={compact} />

        <div
          className={cn(
            'rounded-lg border border-[#cbd5e1] bg-white/80 leading-relaxed text-[#334155]',
            compact ? 'p-1.5 text-[5px]' : 'p-3 text-[10px] sm:text-xs',
          )}
        >
          Certified that <span className="font-semibold text-[#0f172a]">{context.holderName}</span>, holder of
          PPO No. <span className="font-mono font-semibold">{context.ppoNumber}</span>, was alive on the date
          mentioned above and is drawing pension under the {context.pensionType} scheme.
        </div>

        <div className={cn('grid grid-cols-2 gap-2', compact ? 'gap-1' : 'gap-3')}>
          <DocField label="Department" value={context.department} compact={compact} />
          <DocField label="Net Pension" value={context.netPension} compact={compact} />
        </div>

        <div className={cn('flex items-end justify-between border-t border-dashed border-slate-300', compact ? 'pt-1' : 'pt-3')}>
          <div>
            <p className={cn('text-slate-500', compact ? 'text-[4px]' : 'text-[8px]')}>Signature of Pensioner</p>
            <div className={cn('border-b border-slate-400 italic text-slate-600', compact ? 'mt-2 w-16 text-[6px]' : 'mt-4 w-32 text-xs')}>
              {context.holderName.split(' ')[0]}
            </div>
          </div>
          <OfficialStamp compact={compact} label="ALIVE" />
        </div>
      </div>
    </div>
  )
}
