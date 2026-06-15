import { format } from 'date-fns'
import {
  Bell,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  Send,
  Settings,
  XCircle,
} from 'lucide-react'

import type { CommunicationAuditEntry } from '@/types/communication'

const actionIcons: Record<CommunicationAuditEntry['action'], typeof FileText> = {
  notice_generated: FileText,
  notice_sent: Send,
  notice_downloaded: Download,
  notice_resend: RefreshCw,
  notification_sent: Bell,
  notification_failed: XCircle,
  notification_read: CheckCircle2,
  template_activated: Settings,
  template_updated: Settings,
}

const actionLabels: Record<CommunicationAuditEntry['action'], string> = {
  notice_generated: 'Notice Generated',
  notice_sent: 'Notice Sent',
  notice_downloaded: 'Notice Downloaded',
  notice_resend: 'Notice Resent',
  notification_sent: 'Notification Sent',
  notification_failed: 'Notification Failed',
  notification_read: 'Notification Read',
  template_activated: 'Template Activated',
  template_updated: 'Template Updated',
}

export function CommunicationAuditTimeline({ entries }: { entries: CommunicationAuditEntry[] }) {
  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">No audit entries yet.</p>
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, index) => {
        const Icon = actionIcons[entry.action]
        const isLast = index === entries.length - 1
        return (
          <div key={entry.id} className="relative flex gap-4 pb-6">
            {!isLast && (
              <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-border" />
            )}
            <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
              <Icon className="size-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{actionLabels[entry.action]}</p>
                {entry.channel && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">
                    {entry.channel}
                  </span>
                )}
                {entry.status && (
                  <span className="text-[10px] text-muted-foreground">{entry.status}</span>
                )}
              </div>
              {entry.details && (
                <p className="mt-0.5 text-sm text-muted-foreground">{entry.details}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {entry.user} · {format(new Date(entry.timestamp), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
