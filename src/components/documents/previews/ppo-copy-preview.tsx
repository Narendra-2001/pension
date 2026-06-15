import type { DocumentPreviewContext } from '@/lib/document-preview-data'
import { cn } from '@/lib/utils'

import { DocField, formatDocDate, OfficialStamp, type DocumentPreviewVariant } from './shared'

interface PpoCopyPreviewProps {
  context: DocumentPreviewContext
  variant?: DocumentPreviewVariant
  className?: string
}

export function PpoCopyPreview({ context, variant = 'full', className }: PpoCopyPreviewProps) {
  const compact = variant === 'compact' || variant === 'thumbnail'

  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-xl border-2 border-[#7c2d12]/20 bg-[#fffdf8] shadow-lg',
        compact ? 'max-w-none' : 'w-full max-w-[520px]',
        className,
      )}
      style={{ aspectRatio: '1 / 1.414' }}
    >
      <div
        className={cn(
          'border-b-2 border-[#7c2d12]/25 bg-[linear-gradient(180deg,#fef3c7_0%,#fff7ed_100%)]',
          compact ? 'px-2 py-1.5' : 'px-5 py-4',
        )}
      >
        <p className={cn('text-center text-[#92400e]', compact ? 'text-[4px]' : 'text-[10px]')}>
          Government of India · Controller of Pension Accounts
        </p>
        <p className={cn('text-center font-bold uppercase tracking-wider text-[#7c2d12]', compact ? 'text-[6px]' : 'text-base')}>
          Pension Payment Order
        </p>
      </div>

      <div className={cn(compact ? 'space-y-1 p-2' : 'space-y-3 p-5')}>
        <div className={cn('rounded-lg border border-amber-200 bg-amber-50/80', compact ? 'p-1.5' : 'p-3')}>
          <p className={cn('text-amber-800/70', compact ? 'text-[4px]' : 'text-[8px]')}>PPO Number</p>
          <p
            className={cn('font-bold text-[#7c2d12]', compact ? 'text-[8px]' : 'text-xl')}
            style={{ fontFamily: 'ui-monospace, monospace' }}
          >
            {context.ppoNumber}
          </p>
        </div>

        <DocField label="Name of Pensioner" value={context.holderName} compact={compact} />

        <div className={cn('grid grid-cols-2 gap-2', compact ? 'gap-1' : 'gap-3')}>
          <DocField label="Pension Type" value={context.pensionType} compact={compact} />
          <DocField label="Retirement Date" value={formatDocDate(context.retirementDate)} compact={compact} />
          <DocField label="Designation" value={context.designation} compact={compact} />
          <DocField label="Department" value={context.department} compact={compact} />
        </div>

        <div className={cn('rounded-lg border border-slate-200 bg-white', compact ? 'p-1.5' : 'p-3')}>
          <p className={cn('mb-1 font-semibold text-slate-700', compact ? 'text-[5px]' : 'text-[10px]')}>
            Pension Details (Monthly)
          </p>
          <div className={cn('grid grid-cols-2 gap-1', compact ? 'text-[5px]' : 'text-xs')}>
            <span className="text-slate-500">Gross Pension</span>
            <span className="text-right font-semibold">{context.grossPension}</span>
            <span className="text-slate-500">Net Pension</span>
            <span className="text-right font-bold text-emerald-700">{context.netPension}</span>
          </div>
        </div>

        <div className={cn('flex items-end justify-between', compact ? 'pt-0.5' : 'pt-2')}>
          <DocField label="Sanction Order" value={context.sanctionOrderNumber} compact={compact} mono />
          <OfficialStamp compact={compact} label="PPO" />
        </div>
      </div>
    </div>
  )
}
