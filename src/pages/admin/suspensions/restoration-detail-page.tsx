import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileSearch,
  FileText,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  AdminActionBar,
  AdminDetailCard,
  AdminDetailGrid,
  AdminDetailHero,
  AdminDetailRow,
  AdminPageShell,
  AdminProcessStepper,
  AdminTextBlock,
  AdminWorkflowTimeline,
  type WorkflowTimelineEvent,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { RestorationStatusBadge } from '@/components/suspension/restoration-status-badge'
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
  adminProcessRestoration,
  fetchRestorationRequest,
  fetchSuspensionCase,
} from '@/data/suspension-api'
import { adminRemarksSchema } from '@/lib/suspension-schema'
import { useAuth } from '@/providers/auth-provider'
import type { AdminRestorationAction } from '@/types/suspension'

const RESTORATION_WORKFLOW_STEPS = [
  { id: 'submitted', label: 'Submitted', description: 'Request filed' },
  { id: 'review', label: 'Under Review', description: 'Documents checked' },
  { id: 'decision', label: 'Decision', description: 'Approve or reject' },
  { id: 'restored', label: 'Restored', description: 'Pension resumed' },
]

function restorationStepIndex(status: string): number {
  switch (status) {
    case 'submitted':
      return 1
    case 'under_review':
      return 2
    case 'approved':
    case 'rejected':
      return 3
    default:
      return 1
  }
}

const TIMELINE_ICONS: Record<string, typeof Clock> = {
  submitted: Clock,
  under_review: FileSearch,
  approved: CheckCircle2,
  rejected: XCircle,
  restored: RotateCcw,
}

const TIMELINE_TONES: Record<string, WorkflowTimelineEvent['tone']> = {
  submitted: 'slate',
  under_review: 'violet',
  approved: 'green',
  rejected: 'rose',
  restored: 'green',
  reminder: 'amber',
  suspended: 'rose',
}

interface RestorationDetailPageProps {
  requestId: string
}

export function RestorationDetailPage({ requestId }: RestorationDetailPageProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [action, setAction] = useState<AdminRestorationAction | null>(null)

  const { data: request, isLoading } = useQuery({
    queryKey: ['restoration-request', requestId],
    queryFn: () => fetchRestorationRequest(requestId),
  })

  const { data: suspensionCase } = useQuery({
    queryKey: ['suspension-case', request?.suspensionCaseId],
    queryFn: () => fetchSuspensionCase(request!.suspensionCaseId),
    enabled: !!request?.suspensionCaseId,
  })

  const form = useForm({
    resolver: zodResolver(adminRemarksSchema),
    defaultValues: { remarks: '' },
  })

  const mutation = useMutation({
    mutationFn: ({ act, remarks }: { act: AdminRestorationAction; remarks: string }) =>
      adminProcessRestoration(requestId, act, remarks, user?.name),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['restoration-request', requestId] })
      queryClient.invalidateQueries({ queryKey: ['admin-restoration-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-suspension-cases'] })
      queryClient.invalidateQueries({ queryKey: ['suspension-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      toast.success(
        `Restoration ${vars.act === 'approve' ? 'approved' : vars.act === 'reject' ? 'rejected' : 'updated'}`,
      )
      setAction(null)
      form.reset()
      if (vars.act === 'approve' || vars.act === 'reject') {
        navigate({ to: '/admin/suspensions/restoration' })
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const onAction = form.handleSubmit((values) => {
    if (!action) return
    mutation.mutate({ act: action, remarks: values.remarks })
  })

  const actionLabels: Record<AdminRestorationAction, string> = {
    approve: 'Approve Restoration',
    reject: 'Reject Restoration',
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
        title={request.id}
        subtitle={`${request.pensionerName} · Suspension ${request.suspensionCaseId}`}
        badges={
          <>
            <RestorationStatusBadge status={request.status} />
            {request.reviewedBy && (
              <span className="text-sm text-muted-foreground">Reviewed by {request.reviewedBy}</span>
            )}
          </>
        }
        actions={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/suspensions/restoration">
              <ArrowLeft className="size-4" /> Back to Requests
            </Link>
          </Button>
        }
      />

      <AdminProcessStepper
        steps={RESTORATION_WORKFLOW_STEPS}
        currentStep={restorationStepIndex(request.status)}
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
        </AdminActionBar>
      )}

      <AdminDetailGrid columns={3}>
        <div className="space-y-5 lg:col-span-2">
          <AdminDetailCard title="Request Information" icon={FileText} tone="blue">
            <AdminDetailRow label="Request ID" value={request.id} mono />
            <AdminDetailRow label="Request Date" value={request.requestDate} />
            <AdminDetailRow label="PPO Number" value={request.ppoNumber} mono />
            <AdminDetailRow label="Suspension Case ID" value={request.suspensionCaseId} mono />
            <AdminDetailRow label="Suspension Reason" value={request.suspensionReason} />
          </AdminDetailCard>

          <AdminTextBlock
            title="Reason For Restoration"
            content={request.reasonForRestoration}
            icon={RotateCcw}
            tone="violet"
          />

          {request.remarks && (
            <AdminTextBlock title="Pensioner Remarks" content={request.remarks} icon={FileText} tone="slate" />
          )}

          {request.rejectionReason && (
            <AdminTextBlock
              title="Rejection Reason"
              content={request.rejectionReason}
              icon={XCircle}
              tone="rose"
            />
          )}

          <AdminDetailCard title="Supporting Documents" icon={FileSearch} tone="amber">
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

          {suspensionCase && (
            <AdminDetailCard
              title="Linked Suspension Case"
              icon={FileText}
              tone="rose"
              headerAction={
                <Button variant="outline" size="sm" className="rounded-full" asChild>
                  <Link to="/admin/suspensions/$id" params={{ id: suspensionCase.id }}>
                    View Case
                  </Link>
                </Button>
              }
            >
              <AdminDetailRow label="Suspension Date" value={suspensionCase.suspensionDate} />
              <AdminDetailRow
                label="Status"
                value={suspensionCase.status.replace(/_/g, ' ')}
              />
            </AdminDetailCard>
          )}
        </div>

        <AdminDetailCard title="Request Timeline" icon={Clock} tone="violet" className="h-fit">
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
                <Button
                  type="submit"
                  className="rounded-xl"
                  variant={action === 'reject' ? 'destructive' : 'default'}
                  disabled={mutation.isPending}
                >
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
