import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, CheckCircle2, Clock, Download, FileSearch, FileText, Info, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  AdminActionBar,
  AdminComparisonPanel,
  AdminDetailCard,
  AdminDetailGrid,
  AdminDetailHero,
  AdminDetailRow,
  AdminPageShell,
  AdminProcessStepper,
  AdminTextBlock,
  AdminWorkflowTimeline,
  PensionerAvatar,
  type WorkflowTimelineEvent,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ProfileUpdateStatusBadge } from '@/components/profile-update/request-status-badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import {
  fetchProfileUpdateRequest,
  fetchRequestAuditLogs,
  adminProcessProfileUpdate,
} from '@/data/profile-update-api'
import { REQUEST_TYPE_LABELS } from '@/lib/profile-update'
import { useAuth } from '@/providers/auth-provider'
import type { AdminProfileUpdateAction, ProfileUpdateRequestStatus } from '@/types/profile-update-request'

const remarksSchema = z.object({
  remarks: z.string().min(10, 'Remarks must be at least 10 characters'),
})

const PROFILE_UPDATE_STEPS = [
  { id: 'submitted', label: 'Submitted', description: 'Request filed' },
  { id: 'review', label: 'Under Review', description: 'Admin review' },
  { id: 'verified', label: 'Verified', description: 'Documents checked' },
  { id: 'decision', label: 'Decision', description: 'Approve or reject' },
]

function profileUpdateStepIndex(status: ProfileUpdateRequestStatus): number {
  switch (status) {
    case 'pending_review':
      return 2
    case 'under_verification':
    case 'more_info_required':
      return 3
    case 'approved':
    case 'rejected':
      return 4
    default:
      return 1
  }
}

const TIMELINE_ICONS: Record<string, typeof Clock> = {
  submitted: Clock,
  pending_review: Clock,
  under_verification: FileSearch,
  document_verified: FileSearch,
  approved: CheckCircle2,
  rejected: XCircle,
  more_info_required: Info,
}

const TIMELINE_TONES: Record<string, WorkflowTimelineEvent['tone']> = {
  submitted: 'slate',
  pending_review: 'amber',
  under_verification: 'blue',
  document_verified: 'blue',
  approved: 'green',
  rejected: 'rose',
  more_info_required: 'violet',
}

interface ProfileUpdateDetailPageProps {
  requestId: string
}

export function ProfileUpdateDetailPage({ requestId }: ProfileUpdateDetailPageProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [action, setAction] = useState<AdminProfileUpdateAction | null>(null)

  const { data: request, isLoading } = useQuery({
    queryKey: ['profile-update-request', requestId],
    queryFn: () => fetchProfileUpdateRequest(requestId),
  })

  const { data: auditLogs } = useQuery({
    queryKey: ['profile-update-audit', requestId],
    queryFn: () => fetchRequestAuditLogs(requestId),
    enabled: !!requestId,
  })

  const form = useForm({
    resolver: zodResolver(remarksSchema),
    defaultValues: { remarks: '' },
  })

  const mutation = useMutation({
    mutationFn: ({ act, remarks }: { act: AdminProfileUpdateAction; remarks: string }) =>
      adminProcessProfileUpdate(requestId, act, remarks, user?.name),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-task-counts'] })
      queryClient.invalidateQueries({ queryKey: ['pending-admin-task-count'] })
      queryClient.invalidateQueries({ queryKey: ['profile-update-request', requestId] })
      queryClient.invalidateQueries({ queryKey: ['profile-update-audit', requestId] })
      queryClient.invalidateQueries({ queryKey: ['admin-profile-updates'] })
      queryClient.invalidateQueries({ queryKey: ['pensioner-profile'] })
      toast.success(
        `Request ${vars.act === 'approve' ? 'approved' : vars.act === 'reject' ? 'rejected' : 'updated'} successfully`,
      )
      setAction(null)
      form.reset()
      if (vars.act === 'approve' || vars.act === 'reject') {
        navigate({ to: '/admin/profile-updates' })
      }
    },
  })

  const onAction = form.handleSubmit((values) => {
    if (!action) return
    mutation.mutate({ act: action, remarks: values.remarks })
  })

  const actionLabels: Record<AdminProfileUpdateAction, string> = {
    approve: 'Approve Request',
    reject: 'Reject Request',
    more_info: 'Request More Information',
    verify: 'Verify Documents',
  }

  if (isLoading || !request) return <PageLoadingSkeleton />

  const isFinal = request.status === 'approved' || request.status === 'rejected'
  const timelineEvents: WorkflowTimelineEvent[] = request.timeline.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    actor: event.actor,
    timestamp: format(parseISO(event.timestamp), 'dd MMM yyyy, hh:mm a'),
    icon: TIMELINE_ICONS[event.status] ?? Clock,
    tone: TIMELINE_TONES[event.status] ?? 'slate',
  }))

  return (
    <AdminPageShell>
      <AdminDetailHero
        avatar={<PensionerAvatar name={request.pensionerName} ppo={request.ppoNumber} />}
        title={request.id}
        subtitle={`${request.pensionerName} · ${REQUEST_TYPE_LABELS[request.requestType]}`}
        badges={
          <>
            <ProfileUpdateStatusBadge status={request.status} />
            {request.reviewedBy && (
              <span className="text-sm text-muted-foreground">Reviewed by {request.reviewedBy}</span>
            )}
          </>
        }
        actions={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/profile-updates">
              <ArrowLeft className="size-4" /> Back to Profile Update Requests
            </Link>
          </Button>
        }
      />

      <AdminProcessStepper
        steps={PROFILE_UPDATE_STEPS}
        currentStep={profileUpdateStepIndex(request.status)}
      />

      {!isFinal && (
        <AdminActionBar>
          <Button className="rounded-full" variant="outline" onClick={() => setAction('verify')}>
            <FileSearch className="size-4" /> Verify Documents
          </Button>
          <Button className="rounded-full" onClick={() => setAction('approve')}>
            <CheckCircle2 className="size-4" /> Approve
          </Button>
          <Button className="rounded-full" variant="destructive" onClick={() => setAction('reject')}>
            <XCircle className="size-4" /> Reject
          </Button>
          <Button className="rounded-full" variant="secondary" onClick={() => setAction('more_info')}>
            <Info className="size-4" /> Request More Info
          </Button>
        </AdminActionBar>
      )}

      <AdminDetailGrid columns={3}>
        <div className="space-y-5 lg:col-span-2">
          <AdminDetailCard title="Request Information" icon={FileText} tone="blue">
            <AdminDetailRow label="PPO Number" value={request.ppoNumber} mono />
            <AdminDetailRow label="Pensioner Name" value={request.pensionerName} />
            <AdminDetailRow label="Request Type" value={REQUEST_TYPE_LABELS[request.requestType]} />
            <AdminDetailRow label="Submitted" value={request.submittedAt} />
          </AdminDetailCard>

          <AdminDetailCard title="Change Comparison" icon={FileSearch} tone="violet">
            <AdminComparisonPanel current={request.currentValue} requested={request.newValue} />
          </AdminDetailCard>

          <AdminTextBlock title="Reason" content={request.reason} icon={Info} tone="amber" />

          {request.verificationNotes && (
            <AdminTextBlock
              title="Verification Notes"
              content={request.verificationNotes}
              icon={FileSearch}
              tone="blue"
            />
          )}

          <AdminDetailCard title="Uploaded Documents" icon={FileText} tone="slate">
            {request.documents.map((doc) => (
              <div
                key={doc.fileName}
                className="flex items-center justify-between rounded-xl border border-border/50 p-3 transition-colors hover:border-primary/20 hover:bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="rounded-full">
                  <Download className="size-3.5" /> Preview
                </Button>
              </div>
            ))}
          </AdminDetailCard>

          {auditLogs && auditLogs.length > 0 && (
            <AdminDetailCard title="Audit Trail" icon={Clock} tone="slate">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-border/50 p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{log.id}</span>
                    <span className="text-xs text-muted-foreground">{log.approvedAt}</span>
                  </div>
                  <p className="mt-1 font-medium">{log.field}</p>
                  <p className="text-muted-foreground">
                    <span className="line-through">{log.oldValue}</span>
                    {' → '}
                    <span className="font-medium text-foreground">{log.newValue}</span>
                  </p>
                  <p className="mt-1 text-xs">Approved by {log.approvedBy}</p>
                </div>
              ))}
            </AdminDetailCard>
          )}
        </div>

        <AdminDetailCard title="Request Timeline" icon={Clock} tone="amber" className="h-fit">
          <AdminWorkflowTimeline events={timelineEvents} />
        </AdminDetailCard>
      </AdminDetailGrid>

      <Dialog
        open={!!action}
        onOpenChange={() => {
          setAction(null)
          form.reset()
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{action ? actionLabels[action] : ''}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onAction} className="space-y-4">
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (Required)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[100px] rounded-xl"
                        placeholder="Enter verification notes or decision remarks..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setAction(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Processing...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
