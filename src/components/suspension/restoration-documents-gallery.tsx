import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { Download, Eye, FolderOpen } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DocumentPreviewRenderer } from '@/components/documents/previews/document-preview-renderer'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DOCUMENT_TYPE_LABELS, formatFileSize, getDocumentCurrentVersion } from '@/lib/documents'
import { hasRealisticDocumentPreview } from '@/lib/document-preview-data'
import { toRestorationPreviewDocument } from '@/lib/restoration-documents'
import { cn } from '@/lib/utils'
import type { PensionDocument } from '@/types/documents'
import type { RestorationRequest, SuspensionDocument } from '@/types/suspension'

interface RestorationDocumentsGalleryProps {
  request: Pick<
    RestorationRequest,
    'id' | 'pensionerId' | 'ppoNumber' | 'pensionerName' | 'requestDate'
  >
  documents: SuspensionDocument[]
  className?: string
}

function DocumentThumbnail({ document }: { document: PensionDocument }) {
  const isPortrait =
    document.documentType === 'life_certificate' ||
    document.documentType === 'ppo_copy' ||
    document.documentType === 'passport_photo'

  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]',
        isPortrait ? 'h-52 p-3' : 'h-44 p-2.5',
      )}
    >
      <div className={cn('w-full', isPortrait ? 'max-w-[200px]' : 'max-w-[240px]')}>
        <DocumentPreviewRenderer document={document} variant="thumbnail" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-card to-transparent" />
    </div>
  )
}

function DocumentPreviewDialog({
  document,
  open,
  onOpenChange,
}: {
  document: PensionDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!document) return null

  const version = getDocumentCurrentVersion(document)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-border/50 px-6 py-4">
          <DialogTitle className="text-left text-base">
            {DOCUMENT_TYPE_LABELS[document.documentType]}
          </DialogTitle>
          <p className="text-left text-xs text-muted-foreground">
            {version.fileName} · {formatFileSize(version.fileSize)}
          </p>
        </DialogHeader>
        <div className="max-h-[calc(92vh-8rem)] overflow-y-auto bg-muted/15 p-6">
          <DocumentPreviewRenderer document={document} variant="full" showCaption />
        </div>
        <div className="flex justify-end gap-2 border-t border-border/50 px-6 py-4">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button className="rounded-xl">
            <Download className="mr-1.5 size-4" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function RestorationDocumentsGallery({
  request,
  documents,
  className,
}: RestorationDocumentsGalleryProps) {
  const [previewDoc, setPreviewDoc] = useState<PensionDocument | null>(null)

  const previewDocuments = useMemo(
    () => documents.map((doc, index) => toRestorationPreviewDocument(request, doc, index)),
    [documents, request],
  )

  if (!documents.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-12 text-center',
          className,
        )}
      >
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
          <FolderOpen className="size-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">No documents attached</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Supporting documents uploaded with this restoration request will appear here.
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.07 } },
        }}
        className={cn('grid gap-4 sm:grid-cols-2', className)}
      >
        {previewDocuments.map((doc, index) => {
          const version = getDocumentCurrentVersion(doc)
          const sourceDoc = documents[index]!
          const hasPreview = hasRealisticDocumentPreview(doc.documentType)

          return (
            <motion.article
              key={doc.id}
              variants={{
                hidden: { opacity: 0, y: 16, scale: 0.98 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="relative overflow-hidden border-b border-border/40">
                <DocumentThumbnail document={doc} />
                <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm">
                  {hasPreview ? 'Official preview' : 'Document'}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/55 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100"
                >
                  <Button size="sm" className="rounded-full shadow-md" onClick={() => setPreviewDoc(doc)}>
                    <Eye className="mr-1.5 size-3.5" /> Quick View
                  </Button>
                </motion.div>
              </div>

              <div className="p-4">
                <p className="truncate text-sm font-semibold text-foreground">{sourceDoc.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {DOCUMENT_TYPE_LABELS[doc.documentType]}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-xl border border-border/50 bg-muted/20 px-2.5 py-2">
                    <p className="text-muted-foreground">Uploaded</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {format(parseISO(doc.uploadDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/50 bg-muted/20 px-2.5 py-2">
                    <p className="text-muted-foreground">File size</p>
                    <p className="mt-0.5 truncate font-medium text-foreground">
                      {formatFileSize(version.fileSize)}
                    </p>
                  </div>
                </div>

                <p className="mt-2 truncate text-[11px] text-muted-foreground">{version.fileName}</p>

                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <Eye className="mr-1.5 size-3.5" /> View
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-xl">
                    <Download className="size-3.5" />
                  </Button>
                </div>
              </div>
            </motion.article>
          )
        })}
      </motion.div>

      <DocumentPreviewDialog
        document={previewDoc}
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
      />
    </>
  )
}
