import { DOCUMENT_TYPE_LABELS } from '@/lib/documents'
import type { PensionDocument } from '@/types/documents'
import { cn } from '@/lib/utils'

import { DocumentImagePreview } from './document-image-preview'
import type { DocumentPreviewVariant } from './shared'

interface DocumentPreviewRendererProps {
  document: PensionDocument
  variant?: DocumentPreviewVariant
  className?: string
  showCaption?: boolean
}

export function DocumentPreviewRenderer({
  document,
  variant = 'full',
  className,
  showCaption = false,
}: DocumentPreviewRendererProps) {
  const version = document.versions.find((v) => v.version === document.currentVersion)

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <DocumentImagePreview documentType={document.documentType} variant={variant} />
      {showCaption && version && variant === 'full' && (
        <p className="text-center text-xs text-muted-foreground">
          {version.fileName} · {DOCUMENT_TYPE_LABELS[document.documentType]} on file
        </p>
      )}
    </div>
  )
}
