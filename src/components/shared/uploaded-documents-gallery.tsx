import { AnimatePresence, motion } from 'framer-motion'
import { Download, Eye, FileImage, FileText, FolderOpen } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatFileSize } from '@/lib/documents'
import { getFileTypeIcon, getFileTypeLabel, isImageFile, isPdfFile } from '@/lib/file-utils'
import { cn } from '@/lib/utils'

export interface GalleryDocument {
  id?: string
  name: string
  fileName: string
  fileSize?: number
  mimeType?: string
  previewUrl?: string
  uploadedAt?: string
}

interface UploadedDocumentsGalleryProps {
  documents: GalleryDocument[]
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

function DocumentPreviewVisual({ doc }: { doc: GalleryDocument }) {
  const Icon = getFileTypeIcon(doc.fileName, doc.mimeType)

  if (doc.previewUrl && isImageFile(doc.fileName, doc.mimeType)) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-muted/30">
        <img
          src={doc.previewUrl}
          alt={doc.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br transition-colors duration-300',
        isPdfFile(doc.fileName, doc.mimeType)
          ? 'from-red-50/80 via-card to-card dark:from-red-950/20'
          : 'from-sky-50/80 via-card to-card dark:from-sky-950/20',
      )}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className={cn(
          'flex size-14 items-center justify-center rounded-2xl shadow-sm ring-1 ring-border/50',
          isPdfFile(doc.fileName, doc.mimeType)
            ? 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
            : 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
        )}
      >
        <Icon className="size-7" strokeWidth={1.5} />
      </motion.div>
      <p className="text-xs font-medium text-muted-foreground">{getFileTypeLabel(doc.fileName, doc.mimeType)}</p>
    </div>
  )
}

function DocumentPreviewDialog({
  doc,
  open,
  onOpenChange,
}: {
  doc: GalleryDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!doc) return null

  const isImage = isImageFile(doc.fileName, doc.mimeType)
  const isPdf = isPdfFile(doc.fileName, doc.mimeType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-border/50 px-6 py-4">
          <DialogTitle className="text-left text-base">{doc.name}</DialogTitle>
          <p className="text-left text-xs text-muted-foreground">{doc.fileName}</p>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {doc.previewUrl && isImage ? (
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              src={doc.previewUrl}
              alt={doc.name}
              className="mx-auto max-h-[50vh] rounded-xl border border-border/50 object-contain shadow-sm"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
            >
              <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
                {isPdf ? (
                  <FileText className="size-4 text-red-600" />
                ) : (
                  <FileImage className="size-4 text-sky-600" />
                )}
                <span className="text-sm font-medium">{doc.fileName}</span>
              </div>
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 bg-gradient-to-br from-muted/20 to-muted/40 p-8">
                {isPdf ? (
                  <>
                    <div className="w-full max-w-sm space-y-2 rounded-xl border border-border/40 bg-background/80 p-6 shadow-inner">
                      <div className="h-2.5 w-3/4 rounded bg-muted" />
                      <div className="h-2.5 w-full rounded bg-muted" />
                      <div className="h-2.5 w-5/6 rounded bg-muted" />
                      <div className="mt-4 h-20 w-full rounded-lg bg-muted/60" />
                      <div className="h-2.5 w-2/3 rounded bg-muted" />
                      <div className="h-2.5 w-full rounded bg-muted" />
                    </div>
                    <p className="text-xs text-muted-foreground">PDF preview (demo)</p>
                  </>
                ) : (
                  <>
                    <FileImage className="size-16 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Preview not available for this file</p>
                  </>
                )}
              </div>
            </motion.div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {doc.fileSize != null && <span>{formatFileSize(doc.fileSize)}</span>}
            {doc.uploadedAt && (
              <>
                <span>·</span>
                <span>Uploaded {doc.uploadedAt}</span>
              </>
            )}
          </div>
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

export function UploadedDocumentsGallery({
  documents,
  emptyTitle = 'No documents attached',
  emptyDescription = 'Supporting documents will appear here once uploaded.',
  className,
}: UploadedDocumentsGalleryProps) {
  const [previewDoc, setPreviewDoc] = useState<GalleryDocument | null>(null)

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
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground"
        >
          <FolderOpen className="size-6" />
        </motion.div>
        <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{emptyDescription}</p>
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
          show: { opacity: 1, transition: { staggerChildren: 0.06 } },
        }}
        className={cn('grid gap-4 sm:grid-cols-2', className)}
      >
        <AnimatePresence mode="popLayout">
          {documents.map((doc) => {
            const Icon = getFileTypeIcon(doc.fileName, doc.mimeType)
            return (
              <motion.article
                key={doc.id ?? doc.fileName}
                layout
                variants={{
                  hidden: { opacity: 0, y: 16, scale: 0.98 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <div className="relative h-36 overflow-hidden border-b border-border/40">
                  <DocumentPreviewVisual doc={doc} />
                  <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm">
                    {getFileTypeLabel(doc.fileName, doc.mimeType)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-4" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{doc.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{doc.fileName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {doc.fileSize != null && <span>{formatFileSize(doc.fileSize)}</span>}
                        {doc.uploadedAt && (
                          <>
                            <span>·</span>
                            <span>{doc.uploadedAt}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
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
        </AnimatePresence>
      </motion.div>

      <DocumentPreviewDialog
        doc={previewDoc}
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
      />
    </>
  )
}
