import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  FileText,
  History,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DocumentPreviewRenderer } from '@/components/documents/previews/document-preview-renderer'
import { DocumentStatusBadge } from '@/components/documents/document-status-badge'
import { PensionerPageShell } from '@/components/pensioner/shared/pensioner-page-ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { downloadDocumentApi, fetchDocumentById } from '@/data/documents-api'
import {
  DOCUMENT_INTEGRATION_LABELS,
  DOCUMENT_REJECTION_REASON_LABELS,
  DOCUMENT_TYPE_LABELS,
  formatFileSize,
  getDocumentCurrentVersion,
} from '@/lib/documents'
import { getDocumentPreviewContext } from '@/lib/document-preview-data'
import { cn } from '@/lib/utils'

interface PensionerDocumentDetailPageProps {
  documentId: string
}

export function PensionerDocumentDetailPage({ documentId }: PensionerDocumentDetailPageProps) {
  const navigate = useNavigate()

  const { data: document, isLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => fetchDocumentById(documentId),
  })

  if (isLoading || !document) return <PageLoadingSkeleton />

  const version = getDocumentCurrentVersion(document)
  const context = getDocumentPreviewContext(document)
  const showReupload = document.status === 'rejected' || document.status === 'expired'

  const handleDownload = async () => {
    const result = await downloadDocumentApi(documentId)
    toast.success('Download started', { description: result.fileName })
  }

  const extraFields = (() => {
    switch (document.documentType) {
      case 'pan_card':
        return [
          { label: 'PAN number', value: context.panNumber, mono: true },
          { label: "Father's name", value: context.fatherName },
        ]
      case 'aadhaar_card':
      case 'nominee_aadhaar':
        return [{ label: 'Aadhaar number', value: context.aadhaarNumber, mono: true }]
      case 'bank_passbook':
      case 'cancelled_cheque':
        return [
          { label: 'Bank', value: context.bankName },
          { label: 'Account number', value: context.accountNumber, mono: true },
        ]
      case 'ppo_copy':
      case 'life_certificate':
        return [{ label: 'Net pension', value: context.netPension }]
      default:
        return []
    }
  })()

  return (
    <PensionerPageShell>
      <motion.div variants={adminStaggerItem} className="mb-5">
        <Button
          variant="outline"
          className="rounded-xl border-border/70 bg-card"
          onClick={() => navigate({ href: '/pensioner/documents' })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to My Documents
        </Button>
      </motion.div>

      <motion.div
        variants={adminStaggerItem}
        className="relative mb-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-slate-500/[0.05] via-card to-primary/[0.04] p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                {document.id}
              </Badge>
              <DocumentStatusBadge status={document.status} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {DOCUMENT_TYPE_LABELS[document.documentType]}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {document.ppoNumber} · Version {document.currentVersion} ·{' '}
              {formatFileSize(version.fileSize)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full" onClick={handleDownload}>
              <Download className="mr-1.5 size-4" />
              Download
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => navigate({ href: `/pensioner/documents/${documentId}/history` })}
            >
              <History className="mr-1.5 size-4" />
              History
            </Button>
            {showReupload && (
              <Button className="rounded-full" onClick={() => navigate({ href: '/pensioner/documents/upload' })}>
                <Upload className="mr-1.5 size-4" />
                Upload New Version
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-5">
        <motion.div variants={adminStaggerItem} className="xl:col-span-3">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            <div className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Document Preview</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Realistic preview with your registered pensioner details
              </p>
            </div>
            <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-5 sm:p-8">
              <DocumentPreviewRenderer document={document} variant="full" showCaption />
            </div>
          </div>

          {document.rejectionReason && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-rose-200/70 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20">
              <div className="border-b border-rose-200/60 px-5 py-3 dark:border-rose-900/40">
                <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">Rejection details</p>
              </div>
              <div className="space-y-2 p-5 text-sm">
                <p>
                  <span className="font-medium">Reason:</span>{' '}
                  {DOCUMENT_REJECTION_REASON_LABELS[document.rejectionReason]}
                </p>
                {document.rejectionNotes && <p className="text-muted-foreground">{document.rejectionNotes}</p>}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={adminStaggerItem} className="space-y-4 xl:col-span-2">
          {document.status === 'verified' && (
            <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex items-start gap-3 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">Verified document</p>
                  <p className="mt-1 text-sm text-emerald-800/80 dark:text-emerald-200/80">
                    Approved by {document.verifiedBy} on{' '}
                    {document.verificationDate
                      ? format(parseISO(document.verificationDate), 'dd MMM yyyy')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            <div className="border-b border-border/50 px-5 py-4">
              <h2 className="text-base font-semibold">Document information</h2>
            </div>
            <div className="space-y-2 p-5 text-sm">
              {[
                { label: 'Document ID', value: document.id, mono: true },
                { label: 'PPO Number', value: document.ppoNumber, mono: true },
                { label: 'Holder name', value: context.holderName },
                { label: 'Upload date', value: format(parseISO(document.uploadDate), 'dd MMM yyyy') },
                { label: 'File name', value: version.fileName },
                { label: 'Source', value: DOCUMENT_INTEGRATION_LABELS[document.integrationSource] },
                ...extraFields,
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4 rounded-xl bg-muted/20 px-3.5 py-2.5"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={cn('text-right font-medium', item.mono && 'font-mono text-xs')}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {showReupload && (
            <Button className="w-full rounded-xl" onClick={() => navigate({ href: '/pensioner/documents/upload' })}>
              <RefreshCw className="mr-1.5 size-4" />
              Upload corrected document
            </Button>
          )}
        </motion.div>
      </div>
    </PensionerPageShell>
  )
}
