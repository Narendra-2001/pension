import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Paperclip,
  Send,
  TrendingUp,
  UserCheck,
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
  PensionerAvatar,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { GrievanceCommentThread } from '@/components/grievance/grievance-comment-thread'
import { GrievancePriorityBadge } from '@/components/grievance/grievance-priority-badge'
import { GrievanceStatusBadge } from '@/components/grievance/grievance-status-badge'
import { GrievanceTimeline } from '@/components/grievance/grievance-timeline'
import { useGrievancePortal } from '@/components/grievance/grievance-portal-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  addGrievanceCommentApi,
  assignGrievanceTicketApi,
  escalateGrievanceTicketApi,
  fetchGrievanceAuditLogs,
  fetchGrievanceTicket,
  fetchHelpdeskOfficers,
  resolveGrievanceTicketApi,
  updateGrievanceStatusApi,
} from '@/data/grievance-api'
import {
  ESCALATION_LEVEL_LABELS,
  formatGrievanceDateTime,
  GRIEVANCE_AUDIT_ACTION_LABELS,
  GRIEVANCE_CATEGORY_LABELS,
  GRIEVANCE_STATUS_LABELS,
} from '@/lib/grievance'
import {
  addGrievanceCommentSchema,
  assignGrievanceSchema,
  escalateGrievanceSchema,
  resolveGrievanceSchema,
  updateGrievanceStatusSchema,
  type AddGrievanceCommentFormValues,
  type AssignGrievanceFormValues,
  type EscalateGrievanceFormValues,
  type ResolveGrievanceFormValues,
  type UpdateGrievanceStatusFormValues,
} from '@/lib/grievance-schema'
import { useAuth } from '@/providers/auth-provider'
import type { GrievanceTicketStatus } from '@/types/grievance'

const GRIEVANCE_WORKFLOW_STEPS = [
  { id: 'received', label: 'Received', description: 'Ticket logged' },
  { id: 'assigned', label: 'Assigned', description: 'Officer assigned' },
  { id: 'progress', label: 'In Progress', description: 'Under investigation' },
  { id: 'resolved', label: 'Resolved', description: 'Case closed' },
]

function grievanceStepIndex(status: GrievanceTicketStatus): number {
  switch (status) {
    case 'open':
      return 1
    case 'assigned':
      return 2
    case 'in_progress':
    case 'escalated':
      return 3
    case 'resolved':
    case 'closed':
      return 4
    default:
      return 1
  }
}

interface GrievanceTicketDetailPageProps {
  ticketId: string
}

export function GrievanceTicketDetailPage({ ticketId }: GrievanceTicketDetailPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { basePath, permissions } = useGrievancePortal()

  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showResolveDialog, setShowResolveDialog] = useState(false)
  const [showEscalateDialog, setShowEscalateDialog] = useState(false)

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['grievance-ticket', ticketId],
    queryFn: () => fetchGrievanceTicket(ticketId),
  })

  const { data: officers } = useQuery({
    queryKey: ['helpdesk-officers'],
    queryFn: fetchHelpdeskOfficers,
  })

  const { data: auditLogs } = useQuery({
    queryKey: ['grievance-audit', ticketId],
    queryFn: () => fetchGrievanceAuditLogs(ticketId),
    enabled: !!ticketId,
  })

  const assignForm = useForm<AssignGrievanceFormValues>({
    resolver: zodResolver(assignGrievanceSchema),
    defaultValues: { officerId: '', remarks: '' },
  })

  const statusForm = useForm<UpdateGrievanceStatusFormValues>({
    resolver: zodResolver(updateGrievanceStatusSchema),
    defaultValues: { status: 'in_progress', remarks: '' },
  })

  const resolveForm = useForm<ResolveGrievanceFormValues>({
    resolver: zodResolver(resolveGrievanceSchema),
    defaultValues: { notes: '', rootCause: '', correctiveAction: '' },
  })

  const escalateForm = useForm<EscalateGrievanceFormValues>({
    resolver: zodResolver(escalateGrievanceSchema),
    defaultValues: { reason: '' },
  })

  const commentForm = useForm<AddGrievanceCommentFormValues>({
    resolver: zodResolver(addGrievanceCommentSchema),
    defaultValues: { message: '', isInternal: false },
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['grievance-ticket', ticketId] })
    queryClient.invalidateQueries({ queryKey: ['grievance-audit', ticketId] })
    queryClient.invalidateQueries({ queryKey: ['grievance-tickets'] })
    queryClient.invalidateQueries({ queryKey: ['grievance-dashboard-stats'] })
    queryClient.invalidateQueries({ queryKey: ['pensioner-grievances'] })
  }

  const assignMutation = useMutation({
    mutationFn: assignGrievanceTicketApi,
    onSuccess: () => {
      toast.success('Ticket assigned successfully')
      setShowAssignDialog(false)
      assignForm.reset()
      invalidateAll()
    },
  })

  const statusMutation = useMutation({
    mutationFn: updateGrievanceStatusApi,
    onSuccess: () => {
      toast.success('Status updated')
      setShowStatusDialog(false)
      invalidateAll()
    },
  })

  const resolveMutation = useMutation({
    mutationFn: resolveGrievanceTicketApi,
    onSuccess: () => {
      toast.success('Resolution added — pensioner notified')
      setShowResolveDialog(false)
      resolveForm.reset()
      invalidateAll()
    },
  })

  const escalateMutation = useMutation({
    mutationFn: escalateGrievanceTicketApi,
    onSuccess: () => {
      toast.success('Ticket escalated')
      setShowEscalateDialog(false)
      escalateForm.reset()
      invalidateAll()
    },
  })

  const commentMutation = useMutation({
    mutationFn: addGrievanceCommentApi,
    onSuccess: () => {
      toast.success('Comment added')
      commentForm.reset()
      invalidateAll()
    },
  })

  if (isLoading || !ticket) return <PageLoadingSkeleton />

  const canTakeAction = !permissions.viewOnly

  return (
    <AdminPageShell>
      <AdminDetailHero
        avatar={<PensionerAvatar name={ticket.pensionerName} ppo={ticket.ppoNumber} />}
        title={ticket.id}
        subtitle={ticket.subject}
        badges={
          <>
            <GrievanceStatusBadge status={ticket.status} />
            <GrievancePriorityBadge priority={ticket.priority} />
            {ticket.slaBreached && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertTriangle className="size-3.5" /> SLA Breached
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {ESCALATION_LEVEL_LABELS[ticket.escalationLevel]}
            </span>
          </>
        }
        actions={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/tickets` })}>
            <ArrowLeft className="size-4" /> Back to Queue
          </Button>
        }
      />

      <AdminProcessStepper steps={GRIEVANCE_WORKFLOW_STEPS} currentStep={grievanceStepIndex(ticket.status)} />

      {canTakeAction && (
        <AdminActionBar>
          {permissions.canAssign && (
            <Button size="sm" className="rounded-full" onClick={() => setShowAssignDialog(true)}>
              <UserCheck className="mr-1.5 size-3.5" /> Assign
            </Button>
          )}
          {permissions.canUpdateStatus && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => {
              statusForm.setValue('status', ticket.status)
              setShowStatusDialog(true)
            }}>
              <TrendingUp className="mr-1.5 size-3.5" /> Update Status
            </Button>
          )}
          {permissions.canResolve && ticket.status !== 'closed' && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowResolveDialog(true)}>
              <CheckCircle2 className="mr-1.5 size-3.5" /> Resolve
            </Button>
          )}
          {permissions.canEscalate && ticket.escalationLevel < permissions.maxEscalationLevel && (
            <Button size="sm" variant="destructive" className="rounded-full" onClick={() => setShowEscalateDialog(true)}>
              <AlertTriangle className="mr-1.5 size-3.5" /> Escalate
            </Button>
          )}
        </AdminActionBar>
      )}

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="rounded-full">
          <TabsTrigger value="details" className="rounded-full">Details</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-full">Timeline</TabsTrigger>
          <TabsTrigger value="comments" className="rounded-full">Comments</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-full">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <AdminDetailGrid>
            <AdminDetailCard title="Ticket Information" icon={FileText} tone="blue">
              <AdminDetailRow label="Ticket ID" value={ticket.id} mono />
              <AdminDetailRow label="Issue Type" value={GRIEVANCE_CATEGORY_LABELS[ticket.category]} />
              <AdminDetailRow label="Created" value={formatGrievanceDateTime(ticket.createdAt)} />
              <AdminDetailRow
                label="SLA Due"
                value={formatGrievanceDateTime(ticket.slaDueAt)}
                highlight={ticket.slaBreached}
              />
              <AdminDetailRow label="Assigned To" value={ticket.assignedToName ?? 'Unassigned'} />
              <AdminDetailRow label="Contact" value={ticket.contactNumber} />
            </AdminDetailCard>

            <AdminDetailCard title="Pensioner Information" icon={UserCheck} tone="violet">
              <AdminDetailRow label="Name" value={ticket.pensionerName} />
              <AdminDetailRow label="PPO Number" value={ticket.ppoNumber} mono />
            </AdminDetailCard>
          </AdminDetailGrid>

          <AdminTextBlock
            title="Issue Details"
            content={`${ticket.subject}\n\n${ticket.description}`}
            icon={AlertTriangle}
            tone="amber"
          />

          {ticket.attachments.length > 0 && (
            <Card className="admin-card">
              <CardHeader><CardTitle className="text-base">Attachments</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {ticket.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                    <Paperclip className="size-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{att.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {att.uploadedBy} · {formatGrievanceDateTime(att.uploadedAt)}
                        {att.sizeKb ? ` · ${att.sizeKb} KB` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {ticket.resolution && (
            <Card className="admin-card border-emerald-200 dark:border-emerald-800">
              <CardHeader><CardTitle className="text-base text-emerald-800 dark:text-emerald-200">Resolution Notes</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><p className="text-muted-foreground">Resolution</p><p>{ticket.resolution.notes}</p></div>
                <div><p className="text-muted-foreground">Root Cause</p><p>{ticket.resolution.rootCause}</p></div>
                <div><p className="text-muted-foreground">Corrective Action</p><p>{ticket.resolution.correctiveAction}</p></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><p className="text-muted-foreground">Resolved By</p><p className="font-medium">{ticket.resolution.resolvedBy}</p></div>
                  <div><p className="text-muted-foreground">Resolution Date</p><p>{formatGrievanceDateTime(ticket.resolution.resolutionDate)}</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Communication Timeline</CardTitle></CardHeader>
            <CardContent>
              <GrievanceTimeline events={ticket.timeline} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Comment Thread</CardTitle></CardHeader>
            <CardContent>
              <GrievanceCommentThread comments={ticket.comments} showInternal={permissions.canAddInternalComment} />
            </CardContent>
          </Card>

          {canTakeAction && (
            <Card className="admin-card">
              <CardHeader><CardTitle className="text-base">Add Comment</CardTitle></CardHeader>
              <CardContent>
                <Form {...commentForm}>
                  <form
                    onSubmit={commentForm.handleSubmit((values) =>
                      commentMutation.mutate({
                        ticketId,
                        author: user?.name ?? 'Officer',
                        authorRole: user?.role?.replace('_', ' ') ?? 'Officer',
                        message: values.message,
                        isInternal: values.isInternal,
                      }),
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={commentForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea {...field} placeholder="Write your comment..." className="min-h-[100px] rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {permissions.canAddInternalComment && (
                      <FormField
                        control={commentForm.control}
                        name="isInternal"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <input type="checkbox" checked={field.value} onChange={field.onChange} className="rounded" />
                            </FormControl>
                            <FormLabel className="!mt-0 font-normal">Internal note (not visible to pensioner)</FormLabel>
                          </FormItem>
                        )}
                      />
                    )}
                    <Button type="submit" className="rounded-full" disabled={commentMutation.isPending}>
                      <Send className="mr-1.5 size-3.5" />
                      {commentMutation.isPending ? 'Sending...' : 'Add Comment'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audit">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Audit Trail</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {(auditLogs ?? []).map((entry) => (
                <div key={entry.id} className="flex gap-3 rounded-xl border p-3 text-sm">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{GRIEVANCE_AUDIT_ACTION_LABELS[entry.action]}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.user} · {formatGrievanceDateTime(entry.timestamp)}
                    </p>
                    {entry.oldStatus && entry.newStatus && (
                      <p className="mt-1 text-xs">
                        {GRIEVANCE_STATUS_LABELS[entry.oldStatus]} → {GRIEVANCE_STATUS_LABELS[entry.newStatus]}
                      </p>
                    )}
                    {entry.remarks && <p className="mt-1 text-muted-foreground">{entry.remarks}</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Assign Ticket</DialogTitle></DialogHeader>
          <Form {...assignForm}>
            <form
              onSubmit={assignForm.handleSubmit((values) => {
                const officer = officers?.find((o) => o.id === values.officerId)
                if (!officer) return
                assignMutation.mutate({
                  ticketId,
                  officerId: officer.id,
                  officerName: officer.name,
                  assignedBy: user?.name ?? 'Manager',
                })
              })}
              className="space-y-4"
            >
              <FormField
                control={assignForm.control}
                name="officerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Helpdesk Officer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select officer" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {officers?.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name} ({o.activeTickets} active)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="rounded-full" disabled={assignMutation.isPending}>
                  <UserCheck className="mr-1.5 size-3.5" /> Assign
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
          <Form {...statusForm}>
            <form
              onSubmit={statusForm.handleSubmit((values) =>
                statusMutation.mutate({
                  ticketId,
                  status: values.status as GrievanceTicketStatus,
                  updatedBy: user?.name ?? 'Officer',
                  remarks: values.remarks,
                }),
              )}
              className="space-y-4"
            >
              <FormField
                control={statusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(GRIEVANCE_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={statusForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (optional)</FormLabel>
                    <FormControl><Textarea {...field} className="rounded-xl" /></FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="rounded-full" disabled={statusMutation.isPending}>Update</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader><DialogTitle>Resolve Ticket</DialogTitle></DialogHeader>
          <Form {...resolveForm}>
            <form
              onSubmit={resolveForm.handleSubmit((values) =>
                resolveMutation.mutate({
                  ticketId,
                  notes: values.notes,
                  rootCause: values.rootCause,
                  correctiveAction: values.correctiveAction,
                  resolvedBy: user?.name ?? 'Officer',
                }),
              )}
              className="space-y-4"
            >
              <FormField control={resolveForm.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Resolution Notes</FormLabel><FormControl><Textarea {...field} className="rounded-xl min-h-[80px]" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={resolveForm.control} name="rootCause" render={({ field }) => (
                <FormItem><FormLabel>Root Cause</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={resolveForm.control} name="correctiveAction" render={({ field }) => (
                <FormItem><FormLabel>Corrective Action</FormLabel><FormControl><Textarea {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormItem>
                <FormLabel>Supporting Documents</FormLabel>
                <Input type="file" multiple className="rounded-xl" />
              </FormItem>
              <DialogFooter>
                <Button type="submit" className="rounded-full" disabled={resolveMutation.isPending}>
                  <CheckCircle2 className="mr-1.5 size-3.5" /> Submit Resolution
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader><DialogTitle>Escalate Ticket</DialogTitle></DialogHeader>
          <Form {...escalateForm}>
            <form
              onSubmit={escalateForm.handleSubmit((values) =>
                escalateMutation.mutate({
                  ticketId,
                  escalatedBy: user?.name ?? 'Officer',
                  reason: values.reason,
                }),
              )}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                Current level: {ESCALATION_LEVEL_LABELS[ticket.escalationLevel]}
              </p>
              <FormField control={escalateForm.control} name="reason" render={({ field }) => (
                <FormItem><FormLabel>Escalation Reason</FormLabel><FormControl><Textarea {...field} className="rounded-xl min-h-[100px]" /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" variant="destructive" className="rounded-full" disabled={escalateMutation.isPending}>
                  <AlertTriangle className="mr-1.5 size-3.5" /> Escalate
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
