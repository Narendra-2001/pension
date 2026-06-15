import { format, parseISO } from 'date-fns'
import { FileCheck, FileUp, FileX, History, RefreshCw } from 'lucide-react'

import { DOCUMENT_AUDIT_ACTION_LABELS } from '@/lib/documents'
import type { DocumentAuditEntry } from '@/types/documents'
import { cn } from '@/lib/utils'

interface DocumentAuditTimelineProps {
  entries: DocumentAuditEntry[]
  className?: string
}

const actionIcon: Record<DocumentAuditEntry['action'], typeof FileUp> = {
  document_uploaded: FileUp,
  document_updated: RefreshCw,
  document_approved: FileCheck,
  document_rejected: FileX,
  document_reupload_requested: RefreshCw,
  new_version_uploaded: FileUp,
  status_changed: History,
}

export function DocumentAuditTimeline({ entries, className }: DocumentAuditTimelineProps) {
  if (!entries.length) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>No audit entries recorded.</p>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {entries.map((entry) => {
        const Icon = actionIcon[entry.action] ?? History
        return (
          <div
            key={entry.id}
            className="flex gap-3 rounded-xl border bg-card p-4 text-sm"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{DOCUMENT_AUDIT_ACTION_LABELS[entry.action]}</p>
                <time className="text-xs text-muted-foreground">
                  {format(parseISO(entry.timestamp), 'dd MMM yyyy, HH:mm')}
                </time>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {entry.user} · {entry.documentId}
                {entry.version ? ` · v${entry.version}` : ''}
              </p>
              {(entry.oldStatus || entry.newStatus) && (
                <p className="mt-1 text-xs">
                  {entry.oldStatus && (
                    <span className="text-muted-foreground">{entry.oldStatus.replace(/_/g, ' ')}</span>
                  )}
                  {entry.oldStatus && entry.newStatus && <span className="mx-1">→</span>}
                  {entry.newStatus && (
                    <span className="font-medium">{entry.newStatus.replace(/_/g, ' ')}</span>
                  )}
                </p>
              )}
              {entry.remarks && (
                <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">{entry.remarks}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
