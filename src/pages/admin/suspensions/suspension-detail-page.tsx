import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileSearch,
  FileText,
  RotateCcw,
  ScrollText,
  ShieldAlert,
  User,
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
  AdminWorkflowTimeline,
  PensionerAvatar,
  type WorkflowTimelineEvent,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { SuspensionStatusBadge } from '@/components/suspension/suspension-status-badge'
import { SuspensionSourceBadge, TriggerTypeBadge } from '@/components/suspension/trigger-type-badge'
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
  adminProcessSuspension,
  fetchSuspensionAuditLogs,
  fetchSuspensionCase,
} from '@/data/suspension-api'
import { adminRemarksSchema } from '@/lib/suspension-schema'
import { TRIGGER_TYPE_LABELS } from '@/lib/suspension'
import { useAuth } from '@/providers/auth-provider'
import type { AdminSuspensionAction } from '@/types/suspension'

const TIMELINE_ICONS: Record<string, typeof AlertTriangle> = {
  reminder: AlertTriangle,
  suspended: ShieldAlert,
  restoration_pending: RotateCcw,
  restored: CheckCircle2,
  rejected: XCircle,
  submitted: FileText,
  under_review: FileSearch,
  approved: CheckCircle2,
  alert: AlertTriangle,
}

const TIMELINE_TONES: Record<string, WorkflowTimelineEvent['tone']> = {
  reminder: 'amber',
  suspended: 'rose',
  restoration_pending: 'blue',
  restored: 'green',
  rejected: 'rose',
  submitted: 'slate',
  under_review: 'violet',
  approved: 'green',
  alert: 'amber',
}

interface SuspensionDetailPageProps {
  caseId: string
}

export function SuspensionDetailPage({ caseId }: SuspensionDetailPageProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [action, setAction] = useState<AdminSuspensionAction | null>(null)

  const { data: suspensionCase, isLoading } = useQuery({
    queryKey: ['suspension-case', caseId],
    queryFn: () => fetchSuspensionCase(caseId),
  })

  const { data: auditLogs } = useQuery({
    queryKey: ['suspension-audit', caseId],
    queryFn: () => fetchSuspensionAuditLogs(caseId),
    enabled: !!caseId,
  })

  const form = useForm({
    resolver: zodResolver(adminRemarksSchema),
    defaultValues: { remarks: '' },
  })

  const mutation = useMutation({
    mutationFn: ({ act, remarks }: { act: AdminSuspensionAction; remarks: string }) =>
      adminProcessSuspension(caseId, act, remarks, user?.name),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['suspension-case', caseId] })
      queryClient.invalidateQueries({ queryKey: ['suspension-audit', caseId] })
      queryClient.invalidateQueries({ queryKey: ['admin-suspension-cases'] })
      queryClient.invalidateQueries({ queryKey: ['suspension-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-restoration-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      toast.success(`Action completed: ${vars.act.replace(/_/g, ' ')}`)
      setAction(null)
      form.reset()
      if (vars.act === 'restore' || vars.act === 'reject_restoration') {
        navigate({ to: '/admin/suspensions' })
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const onAction = form.handleSubmit((values) => {
    if (!action) return
    mutation.mutate({ act: action, remarks: values.remarks })
  })

  const actionLabels: Record<AdminSuspensionAction, string> = {
    restore: 'Restore Pension',
    reject_restoration: 'Reject Restoration',
    verify_documents: 'Verify Documents',
  }

  if (isLoading || !suspensionCase) return <PageLoadingSkeleton />

  const isFinal = suspensionCase.status === 'restored'
  const canAct =
    suspensionCase.status === 'suspended' ||
    suspensionCase.status === 'restoration_pending' ||
    suspensionCase.status === 'rejected'

  const timelineEvents: WorkflowTimelineEvent[] = suspensionCase.timeline.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    actor: event.actor,
    timestamp: format(parseISO(event.timestamp), 'dd MMM yyyy, hh:mm a'),
    icon: TIMELINE_ICONS[event.status] ?? AlertTriangle,
    tone: TIMELINE_TONES[event.status] ?? 'slate',
  }))

  return (
    <AdminPageShell>
      <AdminDetailHero
        avatar={<PensionerAvatar name={suspensionCase.pensionerName} ppo={suspensionCase.ppoNumber} />}
        title={suspensionCase.id}
        subtitle={`${suspensionCase.pensionerName} · ${TRIGGER_TYPE_LABELS[suspensionCase.triggerType]}`}
        badges={
          <>
            <SuspensionStatusBadge status={suspensionCase.status} />
            <TriggerTypeBadge triggerType={suspensionCase.triggerType} />
            <SuspensionSourceBadge source={suspensionCase.source} />
          </>
        }
        actions={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/suspensions">
              <ArrowLeft className="size-4" /> Back to Suspensions
            </Link>
          </Button>
        }
      />

      {canAct && !isFinal && (
        <AdminActionBar>
          <Button className="rounded-full" variant="outline" onClick={() => setAction('verify_documents')}>
            <FileSearch className="size-4" /> View Documents
          </Button>
          <Button className="rounded-full" onClick={() => setAction('restore')}>
            <RotateCcw className="size-4" /> Restore Pension
          </Button>
          <Button className="rounded-full" variant="destructive" onClick={() => setAction('reject_restoration')}>
            <XCircle className="size-4" /> Reject Restoration
          </Button>
          {auditLogs && auditLogs.length > 0 && (
            <Button className="rounded-full" variant="secondary" asChild>
              <a href="#audit-log">
                <ScrollText className="size-4" /> View Audit Log
              </a>
            </Button>
          )}
        </AdminActionBar>
      )}

      {isFinal && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-4 text-sm">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
          <span>Pension restored on {suspensionCase.restoredAt}</span>
        </div>
      )}

      <AdminDetailGrid columns={3}>
        <div className="space-y-5 lg:col-span-2">
          <AdminDetailCard title="Pensioner Information" icon={User} tone="blue">
            <AdminDetailRow label="PPO Number" value={suspensionCase.ppoNumber} mono />
            <AdminDetailRow label="Name" value={suspensionCase.pensionerName} />
            <AdminDetailRow label="Mobile Number" value={suspensionCase.pensionerMobile ?? '—'} />
            <AdminDetailRow
              label="Pension Type"
              value={suspensionCase.pensionType ? suspensionCase.pensionType.replace(/_/g, ' ') : '—'}
            />
            <AdminDetailRow
              label="Current Pension Status"
              value={suspensionCase.status === 'restored' ? 'Active' : 'Suspended'}
            />
          </AdminDetailCard>

          <AdminDetailCard title="Suspension Information" icon={ShieldAlert} tone="rose">
            <AdminDetailRow label="Suspension ID" value={suspensionCase.id} mono />
            <AdminDetailRow label="Suspension Date" value={suspensionCase.suspensionDate} />
            <AdminDetailRow
              label="Trigger Type"
              value={TRIGGER_TYPE_LABELS[suspensionCase.triggerType]}
            />
            <AdminDetailRow label="Created By" value={suspensionCase.createdBy} />
            <AdminDetailRow label="Suspension Reason" value={suspensionCase.suspensionReason} />
            {suspensionCase.remarks && (
              <AdminDetailRow label="Remarks" value={suspensionCase.remarks} />
            )}
            {suspensionCase.rejectionReason && (
              <AdminDetailRow label="Rejection Reason" value={suspensionCase.rejectionReason} highlight />
            )}
          </AdminDetailCard>

          <AdminDetailCard title="Supporting Documents" icon={FileText} tone="amber">
            {suspensionCase.documents.map((doc) => (
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
            <div id="audit-log" className="scroll-mt-6">
              <AdminDetailCard title="Audit Timeline" icon={ScrollText} tone="slate">
              {auditLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-border/50 p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">By {log.user}</p>
                  {(log.oldStatus || log.newStatus) && (
                    <p className="mt-1">
                      {log.oldStatus && (
                        <span className="text-muted-foreground line-through">{log.oldStatus}</span>
                      )}
                      {log.oldStatus && log.newStatus && ' → '}
                      {log.newStatus && <span className="font-medium">{log.newStatus}</span>}
                    </p>
                  )}
                  {log.remarks && <p className="mt-1 text-muted-foreground">{log.remarks}</p>}
                </div>
              ))}
              </AdminDetailCard>
            </div>
          )}
        </div>

        <AdminDetailCard title="Case Timeline" icon={AlertTriangle} tone="violet" className="h-fit">
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
                        placeholder="Enter decision remarks for audit trail..."
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
                  variant={action === 'reject_restoration' ? 'destructive' : 'default'}
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
