import { format, parseISO } from 'date-fns'
import { CheckCircle2, Clock, FileUp, RefreshCw, XCircle } from 'lucide-react'

import { DocumentStatusBadge } from '@/components/documents/document-status-badge'
import { DOCUMENT_REJECTION_REASON_LABELS } from '@/lib/documents'
import type { DocumentVersion } from '@/types/documents'
import { cn } from '@/lib/utils'

interface DocumentHistoryTimelineProps {
  versions: DocumentVersion[]
  className?: string
}

const statusIcon = {
  verified: CheckCircle2,
  rejected: XCircle,
  pending_verification: Clock,
  under_review: Clock,
  uploaded: FileUp,
  expired: XCircle,
} as const

export function DocumentHistoryTimeline({ versions, className }: DocumentHistoryTimelineProps) {
  const sorted = [...versions].sort((a, b) => b.version - a.version)

  return (
    <div className={cn('space-y-0', className)}>
      {sorted.map((version, index) => {
        const Icon = statusIcon[version.status] ?? RefreshCw
        const isLast = index === sorted.length - 1

        return (
          <div key={version.version} className="relative flex gap-4 pb-6">
            {!isLast && (
              <div className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-border" />
            )}
            <div
              className={cn(
                'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-background',
                version.status === 'verified' && 'border-emerald-500 text-emerald-600',
                version.status === 'rejected' && 'border-red-500 text-red-600',
                (version.status === 'pending_verification' || version.status === 'under_review') &&
                  'border-amber-500 text-amber-600',
                version.status === 'uploaded' && 'border-blue-500 text-blue-600',
                version.status === 'expired' && 'border-slate-400 text-slate-500',
              )}
            >
              <Icon className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1 rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Version {version.version}</p>
                  <p className="text-xs text-muted-foreground">{version.fileName}</p>
                </div>
                <DocumentStatusBadge status={version.status} />
              </div>
              <div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                <p>
                  <span className="font-medium text-foreground">Uploaded:</span>{' '}
                  {format(parseISO(version.uploadDate), 'dd MMM yyyy')}
                </p>
                <p>
                  <span className="font-medium text-foreground">By:</span> {version.uploadedBy}
                </p>
                {version.verifiedBy && (
                  <p>
                    <span className="font-medium text-foreground">Verified by:</span> {version.verifiedBy}
                  </p>
                )}
                {version.verificationDate && (
                  <p>
                    <span className="font-medium text-foreground">Verified on:</span>{' '}
                    {format(parseISO(version.verificationDate), 'dd MMM yyyy')}
                  </p>
                )}
                {version.rejectionReason && (
                  <p className="sm:col-span-2">
                    <span className="font-medium text-foreground">Rejection:</span>{' '}
                    {DOCUMENT_REJECTION_REASON_LABELS[version.rejectionReason]}
                    {version.rejectionNotes ? ` — ${version.rejectionNotes}` : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
