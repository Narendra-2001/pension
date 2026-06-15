import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ArrowLeft, Download, RefreshCw, Send } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { CommunicationAuditTimeline } from '@/components/communication/communication-audit-timeline'
import { useCommunicationPortal } from '@/components/communication/communication-portal-context'
import { NoticeDocument, printNoticeDocument } from '@/components/communication/notice-document'
import { NoticePdfPreviewDialog } from '@/components/communication/notice-pdf-preview-dialog'
import { NoticeStatusBadge } from '@/components/communication/notice-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  downloadNoticeApi,
  fetchCommunicationAuditLog,
  fetchNoticeById,
  resendNoticeApi,
  sendNoticeApi,
} from '@/data/communication-api'
import { NOTICE_TYPE_LABELS, formatNoticeCurrency } from '@/lib/communication'
import { useAuth } from '@/providers/auth-provider'

interface NoticeDetailPageProps {
  noticeId: string
}

export function NoticeDetailPage({ noticeId }: NoticeDetailPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { basePath, permissions } = useCommunicationPortal()
  const [previewOpen, setPreviewOpen] = useState(false)

  const { data: notice, isLoading } = useQuery({
    queryKey: ['notice', noticeId],
    queryFn: () => fetchNoticeById(noticeId),
  })

  const { data: auditLog } = useQuery({
    queryKey: ['communication-audit', noticeId],
    queryFn: fetchCommunicationAuditLog,
    select: (entries) => entries.filter((e) => e.entityId === noticeId),
  })

  const sendMutation = useMutation({
    mutationFn: () => sendNoticeApi(noticeId, user?.name ?? 'Admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice', noticeId] })
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      queryClient.invalidateQueries({ queryKey: ['notice-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['system-notifications'] })
      toast.success('Notice sent successfully')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const resendMutation = useMutation({
    mutationFn: () => resendNoticeApi(noticeId, user?.name ?? 'Admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice', noticeId] })
      toast.success('Notice resent')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const downloadMutation = useMutation({
    mutationFn: () => downloadNoticeApi(noticeId, user?.name ?? 'Admin'),
    onSuccess: () => {
      printNoticeDocument()
      toast.success('Notice downloaded')
    },
  })

  if (isLoading || !notice) return <PageLoadingSkeleton />

  const canSend = permissions.canSendNotice && (notice.status === 'draft' || notice.status === 'generated')

  return (
    <div>
      <PageHeader
        variant="admin"
        title={notice.id}
        description={`${NOTICE_TYPE_LABELS[notice.noticeType]} · ${notice.ppoNumber}`}
        action={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/notices` })}>
            <ArrowLeft className="mr-1.5 size-4" /> Back
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <NoticeStatusBadge status={notice.status} />
        {canSend && (
          <Button className="rounded-full" disabled={sendMutation.isPending} onClick={() => sendMutation.mutate()}>
            <Send className="mr-1.5 size-4" /> Send Notice
          </Button>
        )}
        <Button variant="outline" className="rounded-full" onClick={() => setPreviewOpen(true)}>
          Preview PDF
        </Button>
        <Button variant="outline" className="rounded-full" disabled={downloadMutation.isPending} onClick={() => downloadMutation.mutate()}>
          <Download className="mr-1.5 size-4" /> Download PDF
        </Button>
        {permissions.canSendNotice && notice.status !== 'draft' && (
          <Button variant="outline" className="rounded-full" disabled={resendMutation.isPending} onClick={() => resendMutation.mutate()}>
            <RefreshCw className="mr-1.5 size-4" /> Resend
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="admin-card overflow-hidden p-0">
            <NoticeDocument notice={notice} className="shadow-none" />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">Notice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Pensioner</span>
                <span className="text-right font-medium">{notice.pensionerName}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">PPO Number</span>
                <span className="font-mono text-xs">{notice.ppoNumber}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Template</span>
                <span className="text-right">{notice.templateName}</span>
              </div>
              {notice.amount != null && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Amount</span>
                  <span>{formatNoticeCurrency(notice.amount)}</span>
                </div>
              )}
              {notice.dueDate && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{format(new Date(notice.dueDate), 'dd MMM yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Generated By</span>
                <span>{notice.generatedBy}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Generated Date</span>
                <span>{format(new Date(notice.generatedAt), 'dd MMM yyyy, hh:mm a')}</span>
              </div>
              {notice.failureReason && (
                <div className="rounded-xl bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400">
                  {notice.failureReason}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <CommunicationAuditTimeline entries={auditLog ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>

      <NoticePdfPreviewDialog
        notice={notice}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onDownload={() => downloadMutation.mutate()}
      />
    </div>
  )
}
