import type { DocumentPreviewContext } from '@/lib/document-preview-data'
import { cn } from '@/lib/utils'

import {
  DocField,
  formatAadhaarDisplay,
  formatDocDate,
  PhotoPlaceholder,
  QrPlaceholder,
  type DocumentPreviewVariant,
} from './shared'

interface AadhaarCardPreviewProps {
  context: DocumentPreviewContext
  variant?: DocumentPreviewVariant
  className?: string
}

export function AadhaarCardPreview({
  context,
  variant = 'full',
  className,
}: AadhaarCardPreviewProps) {
  const compact = variant === 'compact' || variant === 'thumbnail'

  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg',
        compact ? 'max-w-none' : 'w-full max-w-[520px]',
        className,
      )}
      style={{ aspectRatio: '1.586 / 1' }}
    >
      <div className="flex h-1.5">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <div className={cn('relative flex h-[calc(100%-6px)] flex-col', compact ? 'px-2 py-1.5' : 'px-4 py-3')}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'rounded-full bg-gradient-to-br from-amber-400 via-white to-emerald-600 p-0.5',
                  compact ? 'size-4' : 'size-6',
                )}
              >
                <div className="size-full rounded-full bg-white" />
              </div>
              <div>
                <p className={cn('font-bold text-[#1e3a5f]', compact ? 'text-[5px]' : 'text-[8px]')}>
                  भारत सरकार
                </p>
                <p className={cn('font-semibold text-[#334155]', compact ? 'text-[4px]' : 'text-[7px]')}>
                  Government of India
                </p>
              </div>
            </div>
            <p className={cn('mt-1 font-bold text-[#0f172a]', compact ? 'text-[6px]' : 'text-[10px]')}>
              Unique Identification Authority of India
            </p>
          </div>
          <PhotoPlaceholder compact={compact} />
        </div>

        <div className={cn('mt-2', compact ? 'space-y-0.5' : 'space-y-1.5')}>
          <p className={cn('text-slate-500', compact ? 'text-[4px]' : 'text-[7px]')}>Aadhaar No. / आधार संख्या</p>
          <p
            className={cn(
              'font-bold tracking-[0.12em] text-[#0f172a]',
              compact ? 'text-[8px]' : 'text-lg sm:text-xl',
            )}
            style={{ fontFamily: 'ui-monospace, monospace' }}
          >
            {formatAadhaarDisplay(context.aadhaarNumber)}
          </p>
        </div>

        <div className={cn('mt-auto flex gap-2', compact ? 'pt-1' : 'pt-2')}>
          <div className={cn('min-w-0 flex-1 space-y-1', compact ? 'space-y-0.5' : 'space-y-1.5')}>
            <DocField label="Name / नाम" value={context.holderName} compact={compact} />
            <DocField label="DOB / जन्म तिथि" value={formatDocDate(context.dateOfBirth)} compact={compact} />
            <DocField label="Gender / लिंग" value={context.gender} compact={compact} />
            {!compact && (
              <DocField
                label="Address / पता"
                value={context.address.length > 48 ? `${context.address.slice(0, 48)}…` : context.address}
                compact={compact}
              />
            )}
          </div>
          <QrPlaceholder compact={compact} />
        </div>

        <p className={cn('text-slate-400', compact ? 'mt-0.5 text-[3px]' : 'mt-1 text-[6px]')}>
          Aadhaar is proof of identity, not of citizenship
        </p>
      </div>
    </div>
  )
}
