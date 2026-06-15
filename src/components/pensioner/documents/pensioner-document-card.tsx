import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { Download, Eye, Upload } from 'lucide-react'

import { DocumentStatusBadge } from '@/components/documents/document-status-badge'
import { DocumentPreviewRenderer } from '@/components/documents/previews/document-preview-renderer'
import { Button } from '@/components/ui/button'
import { DOCUMENT_TYPE_LABELS, formatFileSize, getDocumentCurrentVersion } from '@/lib/documents'
import { cn } from '@/lib/utils'
import type { PensionDocument } from '@/types/documents'

interface PensionerDocumentCardProps {
  document: PensionDocument
  index: number
  onView: (doc: PensionDocument) => void
  onDownload: (doc: PensionDocument) => void
  onReupload?: (doc: PensionDocument) => void
}

function DocumentThumbnail({ doc }: { doc: PensionDocument }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-100">
      <DocumentPreviewRenderer document={doc} variant="thumbnail" />
    </div>
  )
}

export function PensionerDocumentCard({
  document,
  index,
  onView,
  onDownload,
  onReupload,
}: PensionerDocumentCardProps) {
  const version = getDocumentCurrentVersion(document)
  const showReupload = document.status === 'rejected' || document.status === 'expired'
  const isPortraitDoc =
    document.documentType === 'life_certificate' ||
    document.documentType === 'ppo_copy' ||
    document.documentType === 'passport_photo' ||
    document.documentType === 'pension_sanction_order' ||
    document.documentType === 'retirement_order'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 360, damping: 28 }}
      whileHover={{ y: -4 }}
      className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div
        className={cn(
          'relative overflow-hidden border-b border-border/40',
          isPortraitDoc ? 'h-56' : 'h-44',
        )}
      >
        <DocumentThumbnail doc={document} />
        <div className="absolute left-3 top-3 z-10">
          <DocumentStatusBadge status={document.status} />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100"
        >
          <Button size="sm" className="rounded-full shadow-md" onClick={() => onView(document)}>
            <Eye className="mr-1.5 size-3.5" /> Quick View
          </Button>
        </motion.div>
      </div>

      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {DOCUMENT_TYPE_LABELS[document.documentType]}
        </h3>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{document.ppoNumber}</p>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-xl border border-border/50 bg-muted/20 px-2.5 py-2">
            <p className="text-muted-foreground">Uploaded</p>
            <p className="mt-0.5 font-medium text-foreground">
              {format(parseISO(document.uploadDate), 'dd MMM yyyy')}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-muted/20 px-2.5 py-2">
            <p className="text-muted-foreground">File</p>
            <p className="mt-0.5 truncate font-medium text-foreground">
              v{document.currentVersion} · {formatFileSize(version.fileSize)}
            </p>
          </div>
        </div>

        <p className="mt-2 truncate text-[11px] text-muted-foreground">{version.fileName}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="flex-1 rounded-xl" onClick={() => onView(document)}>
            <Eye className="mr-1 size-3.5" /> View
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onDownload(document)}>
            <Download className="size-3.5" />
          </Button>
          {showReupload && onReupload && (
            <Button size="sm" className="w-full rounded-xl" onClick={() => onReupload(document)}>
              <Upload className="mr-1.5 size-3.5" /> Upload New Version
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
