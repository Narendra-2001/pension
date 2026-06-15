import type { DocumentPreviewContext } from '@/lib/document-preview-data'
import { cn } from '@/lib/utils'

import type { DocumentPreviewVariant } from './shared'

interface BankPassbookPreviewProps {
  context: DocumentPreviewContext
  variant?: DocumentPreviewVariant
  className?: string
}

export function BankPassbookPreview({ context, variant = 'full', className }: BankPassbookPreviewProps) {
  const compact = variant === 'compact' || variant === 'thumbnail'

  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-xl border border-[#1d4ed8]/30 shadow-lg',
        'bg-[linear-gradient(160deg,#1e40af_0%,#2563eb_45%,#1d4ed8_100%)]',
        compact ? 'max-w-none' : 'w-full max-w-[520px]',
        className,
      )}
      style={{ aspectRatio: '1.586 / 1' }}
    >
      <div className={cn('relative flex h-full flex-col text-white', compact ? 'p-2' : 'p-5')}>
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('font-bold uppercase tracking-wider opacity-90', compact ? 'text-[5px]' : 'text-[10px]')}>
              {context.bankName}
            </p>
            <p className={cn('font-semibold', compact ? 'text-[7px]' : 'text-lg')}>Savings Bank Passbook</p>
          </div>
          <div
            className={cn(
              'rounded-full border border-white/40 bg-white/10',
              compact ? 'size-6' : 'size-10',
            )}
          />
        </div>

        <div className={cn('mt-auto space-y-2 rounded-lg bg-white/10 backdrop-blur-sm', compact ? 'p-1.5' : 'p-3')}>
          <div>
            <p className={cn('font-medium uppercase tracking-wide text-white/70', compact ? 'text-[4px]' : 'text-[7px]')}>
              Account Holder
            </p>
            <p className={cn('font-semibold text-white', compact ? 'text-[6px]' : 'text-xs')}>{context.holderName}</p>
          </div>
          <div className={cn('grid grid-cols-2 gap-2', compact ? 'gap-1' : '')}>
            <div>
              <p className={cn('font-medium uppercase tracking-wide text-white/70', compact ? 'text-[4px]' : 'text-[7px]')}>
                Account No.
              </p>
              <p className={cn('font-mono font-semibold text-white', compact ? 'text-[6px]' : 'text-xs')}>
                {context.accountNumber}
              </p>
            </div>
            <div>
              <p className={cn('font-medium uppercase tracking-wide text-white/70', compact ? 'text-[4px]' : 'text-[7px]')}>
                IFSC Code
              </p>
              <p className={cn('font-mono font-semibold text-white', compact ? 'text-[6px]' : 'text-xs')}>
                {context.ifscCode}
              </p>
            </div>
          </div>
        </div>

        <p className={cn('mt-1 text-white/60', compact ? 'text-[3px]' : 'text-[7px]')}>
          Passbook cover · Pension credit account
        </p>
      </div>
    </div>
  )
}
