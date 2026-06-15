import { DOCUMENT_TYPE_LABELS, formatFileSize, getDocumentCurrentVersion } from '@/lib/documents'
import type { PensionDocument } from '@/types/documents'

import { DocumentPreviewRenderer } from './previews/document-preview-renderer'

interface DocumentPreviewPanelProps {
  document: PensionDocument
  className?: string
}

export function DocumentPreviewPanel({ document, className }: DocumentPreviewPanelProps) {
  const version = getDocumentCurrentVersion(document)

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{DOCUMENT_TYPE_LABELS[document.documentType]}</span>
        <span>·</span>
        <span>v{version.version}</span>
        <span>·</span>
        <span>{formatFileSize(version.fileSize)}</span>
      </div>
      <DocumentPreviewRenderer document={document} variant="full" showCaption />
    </div>
  )
}
