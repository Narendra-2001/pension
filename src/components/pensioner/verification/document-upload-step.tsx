import { motion } from 'framer-motion'
import { FileText, Trash2, Upload } from 'lucide-react'
import { useCallback, useState, type ChangeEvent, type DragEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import type { VerificationUploadedDocument } from '@/types/verification-submission'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_FILE_SIZE_MB = 5

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(fileName: string) {
  if (fileName.endsWith('.pdf')) return '📄'
  return '🖼️'
}

interface DocumentUploadStepProps {
  documents: VerificationUploadedDocument[]
  onDocumentsChange: (documents: VerificationUploadedDocument[]) => void
  onContinue: () => void
}

export function DocumentUploadStep({
  documents,
  onDocumentsChange,
  onContinue,
}: DocumentUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false)

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const valid: VerificationUploadedDocument[] = []
      const rejected: string[] = []

      for (const file of fileArray) {
        if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
          rejected.push(`${file.name} — unsupported format`)
          continue
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          rejected.push(`${file.name} — exceeds ${MAX_FILE_SIZE_MB}MB`)
          continue
        }
        valid.push({
          name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString().split('T')[0],
        })
      }

      if (rejected.length) {
        toast.error(rejected[0])
      }
      if (valid.length) {
        onDocumentsChange([...documents, ...valid])
        toast.success(`${valid.length} document(s) uploaded`)
      }
    },
    [documents, onDocumentsChange],
  )

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removeDocument = (fileName: string) => {
    onDocumentsChange(documents.filter((d) => d.fileName !== fileName))
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Upload Documents</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload Aadhaar, photo ID, or other supporting proof (PDF, JPG, PNG — max {MAX_FILE_SIZE_MB}MB each)
        </p>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-primary/25 bg-muted/20 hover:border-primary/40 hover:bg-muted/30'
        }`}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleInputChange}
        />
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Upload className="size-7 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">
            {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG up to {MAX_FILE_SIZE_MB}MB</p>
        </div>
      </label>

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Uploaded ({documents.length})
          </p>
          <ul className="space-y-2">
            {documents.map((doc, i) => (
              <motion.li
                key={doc.fileName}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
              >
                <span className="text-xl">{getFileIcon(doc.fileName)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.fileName)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${doc.fileName}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/20 p-4 text-xs text-muted-foreground">
        <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Accepted documents include Aadhaar card, PAN card, voter ID, passport, or any government-issued photo ID.
          Ensure documents are clear and all corners are visible.
        </p>
      </div>

      <Button
        className="w-full rounded-xl"
        onClick={onContinue}
        disabled={!documents.length}
      >
        Continue to Declaration
      </Button>
    </div>
  )
}
