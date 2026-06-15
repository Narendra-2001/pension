import { DOCUMENT_TYPE_LABELS } from '@/lib/documents'
import { getDocumentPreviewImage } from '@/lib/document-preview-images'
import type { DocumentType } from '@/types/documents'
import { cn } from '@/lib/utils'

import type { DocumentPreviewVariant } from './shared'

interface DocumentImagePreviewProps {
  documentType: DocumentType
  variant?: DocumentPreviewVariant
  className?: string
}

export function DocumentImagePreview({
  documentType,
  variant = 'full',
  className,
}: DocumentImagePreviewProps) {
  const src = getDocumentPreviewImage(documentType)
  const label = DOCUMENT_TYPE_LABELS[documentType]
  const isThumbnail = variant === 'thumbnail'

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white',
        isThumbnail
          ? 'h-full w-full rounded-none border-0 shadow-none'
          : 'mx-auto w-full max-w-[560px] rounded-xl border border-border/50 shadow-[0_8px_32px_rgba(15,23,42,0.12)]',
        variant === 'compact' && 'max-w-[360px]',
        className,
      )}
    >
      <img
        src={src}
        alt={`${label} document`}
        className={cn(
          'block w-full',
          isThumbnail ? 'h-full object-cover object-top' : 'h-auto object-contain',
        )}
        loading="lazy"
        draggable={false}
      />
      {variant === 'full' && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-4 py-3">
          <p className="text-[10px] font-medium text-white/90">{label} · Scanned document on file</p>
        </div>
      )}
    </div>
  )
}
