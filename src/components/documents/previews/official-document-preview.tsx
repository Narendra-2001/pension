import type { DocumentPreviewContext } from '@/lib/document-preview-data'
import { DOCUMENT_TYPE_LABELS } from '@/lib/documents'
import type { DocumentType } from '@/types/documents'
import { cn } from '@/lib/utils'

import { DocField, formatDocDate, OfficialStamp, type DocumentPreviewVariant } from './shared'

interface OfficialDocumentPreviewProps {
  documentType: DocumentType
  context: DocumentPreviewContext
  variant?: DocumentPreviewVariant
  className?: string
}

const DOCUMENT_SUBTITLES: Partial<Record<DocumentType, string>> = {
  pension_sanction_order: 'Sanction of pension entitlement',
  retirement_order: 'Retirement from government service',
  cancelled_cheque: 'Cancelled cheque leaf for bank verification',
  relationship_proof: 'Proof of relationship with nominee',
  restoration_supporting: 'Supporting document for pension restoration',
  death_certificate: 'Official record of demise',
  legal_heir_certificate: 'Legal heir / succession certificate',
  recovery_notice: 'Notice of excess payment recovery',
  recovery_evidence: 'Supporting evidence for recovery case',
  passport_photo: 'Passport-size photograph',
  signature: 'Specimen signature on record',
}

export function OfficialDocumentPreview({
  documentType,
  context,
  variant = 'full',
  className,
}: OfficialDocumentPreviewProps) {
  const compact = variant === 'compact' || variant === 'thumbnail'
  const title = DOCUMENT_TYPE_LABELS[documentType]
  const subtitle = DOCUMENT_SUBTITLES[documentType] ?? 'Official record on file'

  if (documentType === 'passport_photo') {
    return (
      <div
        className={cn(
          'relative mx-auto overflow-hidden rounded-xl border border-slate-300 bg-white shadow-md',
          compact ? 'max-w-none' : 'w-full max-w-[280px]',
          className,
        )}
        style={{ aspectRatio: '3 / 4' }}
      >
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 p-4">
          <div
            className={cn(
              'rounded-full bg-slate-400',
              compact ? 'mb-1 size-8' : 'mb-3 size-16',
            )}
          />
          <div className={cn('rounded-t-full bg-slate-400', compact ? 'h-10 w-12' : 'h-24 w-28')} />
          <p className={cn('mt-2 text-center text-slate-600', compact ? 'text-[5px]' : 'text-[10px]')}>
            {context.holderName}
          </p>
        </div>
      </div>
    )
  }

  if (documentType === 'signature') {
    return (
      <div
        className={cn(
          'relative mx-auto overflow-hidden rounded-xl border border-slate-300 bg-[#fffef8] shadow-md',
          compact ? 'max-w-none' : 'w-full max-w-[420px]',
          className,
        )}
        style={{ aspectRatio: '2.5 / 1' }}
      >
        <div className={cn('flex h-full flex-col justify-center', compact ? 'px-2 py-1' : 'px-6 py-4')}>
          <p className={cn('text-slate-500', compact ? 'text-[4px]' : 'text-[8px]')}>Specimen Signature</p>
          <p
            className={cn(
              'font-serif italic text-[#1e3a5f]',
              compact ? 'text-sm' : 'text-3xl',
            )}
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {context.holderName.split(' ')[0]}
          </p>
          <p className={cn('text-slate-400', compact ? 'text-[3px]' : 'text-[8px]')}>{context.holderName}</p>
        </div>
      </div>
    )
  }

  if (documentType === 'cancelled_cheque') {
    return (
      <div
        className={cn(
          'relative mx-auto overflow-hidden rounded-xl border border-slate-300 bg-[#fff8f0] shadow-md',
          compact ? 'max-w-none' : 'w-full max-w-[520px]',
          className,
        )}
        style={{ aspectRatio: '2 / 1' }}
      >
        <div className={cn(compact ? 'p-2' : 'p-4')}>
          <p className={cn('font-semibold text-[#1e3a5f]', compact ? 'text-[6px]' : 'text-sm')}>{context.bankName}</p>
          <div className={cn('mt-2 grid grid-cols-2 gap-2', compact ? 'gap-1' : '')}>
            <DocField label="Pay" value={context.holderName} compact={compact} />
            <DocField label="A/c No." value={context.accountNumber} compact={compact} mono />
          </div>
          <DocField label="IFSC" value={context.ifscCode} compact={compact} mono />
          <div
            className={cn(
              'mt-2 flex items-center justify-center rounded border-2 border-dashed border-red-400 font-bold uppercase text-red-500',
              compact ? 'py-1 text-[6px]' : 'py-2 text-sm',
            )}
          >
            Cancelled
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative mx-auto overflow-hidden rounded-xl border-2 border-slate-300/80 bg-[#fffef8] shadow-lg',
        compact ? 'max-w-none' : 'w-full max-w-[520px]',
        className,
      )}
      style={{ aspectRatio: '1 / 1.414' }}
    >
      <div className={cn('border-b border-slate-300 bg-slate-100', compact ? 'px-2 py-1.5' : 'px-5 py-3')}>
        <p className={cn('text-center text-slate-500', compact ? 'text-[4px]' : 'text-[10px]')}>
          Government of India
        </p>
        <p className={cn('text-center font-bold uppercase text-slate-800', compact ? 'text-[6px]' : 'text-sm')}>
          {title}
        </p>
        <p className={cn('text-center text-slate-500', compact ? 'text-[4px]' : 'text-[9px]')}>{subtitle}</p>
      </div>

      <div className={cn(compact ? 'space-y-1 p-2' : 'space-y-2.5 p-5')}>
        <DocField label="PPO Number" value={context.ppoNumber} compact={compact} mono />
        <DocField label="Pensioner Name" value={context.holderName} compact={compact} />
        <DocField label="Reference" value={context.sanctionOrderNumber} compact={compact} mono />

        <div
          className={cn(
            'rounded border border-slate-200 bg-white leading-relaxed text-slate-600',
            compact ? 'p-1.5 text-[5px]' : 'p-3 text-[10px]',
          )}
        >
          This is to certify that the above-named pensioner is registered in the pension system under{' '}
          {context.pensionType}. Document issued for official pension administration purposes.
        </div>

        <div className={cn('flex items-end justify-between', compact ? 'pt-0.5' : 'pt-2')}>
          <DocField label="Date" value={formatDocDate(context.retirementDate)} compact={compact} />
          <OfficialStamp compact={compact} />
        </div>
      </div>
    </div>
  )
}
