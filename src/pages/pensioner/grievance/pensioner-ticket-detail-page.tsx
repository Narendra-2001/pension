import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileUp,
  Hash,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { GrievanceCommentThread } from '@/components/grievance/grievance-comment-thread'
import { GrievancePriorityBadge } from '@/components/grievance/grievance-priority-badge'
import { GrievanceStatusBadge } from '@/components/grievance/grievance-status-badge'
import { GrievanceTimeline } from '@/components/grievance/grievance-timeline'
import { PensionerPageShell } from '@/components/pensioner/shared/pensioner-page-ui'
import { Badge } from '@/components/ui/badge'
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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  acceptGrievanceResolutionApi,
  addGrievanceAttachmentsApi,
  addGrievanceCommentApi,
  fetchGrievanceTicket,
  rejectGrievanceResolutionApi,
} from '@/data/grievance-api'
import { formatGrievanceDateTime } from '@/lib/grievance'
import {
  getGrievanceCategoryVisual,
  getTicketAgeDays,
  getTicketStatusSteps,
  getTicketStatusTone,
} from '@/lib/grievance-ticket-ui'
import {
  addGrievanceCommentSchema,
  rejectResolutionSchema,
  type AddGrievanceCommentFormValues,
  type RejectResolutionFormValues,
} from '@/lib/grievance-schema'
import { useAuth } from '@/providers/auth-provider'
import type { GrievanceTicket } from '@/types/grievance'
import { cn } from '@/lib/utils'

interface PensionerTicketDetailPageProps {
  ticketId: string
}

function TicketStatusTrack({ ticket }: { ticket: GrievanceTicket }) {
  const steps = getTicketStatusSteps(ticket.status)

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[640px] items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.key} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  step.state === 'complete' &&
                    'border-emerald-500 bg-emerald-500 text-white',
                  step.state === 'current' &&
                    'border-primary bg-primary/10 text-primary',
                  step.state === 'upcoming' &&
                    'border-border bg-muted/40 text-muted-foreground',
                )}
              >
                {step.state === 'complete' ? <CheckCircle2 className="size-4" /> : index + 1}
              </div>
              <p
                className={cn(
                  'text-center text-[11px] font-semibold',
                  step.state === 'current' ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mb-5 h-0.5 flex-1 rounded-full',
                  step.state === 'complete' ? 'bg-emerald-400' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TicketSummaryHero({ ticket }: { ticket: GrievanceTicket }) {
  const category = getGrievanceCategoryVisual(ticket.category)
  const statusTone = getTicketStatusTone(ticket.status)
  const StatusIcon = statusTone.icon
  const CategoryIcon = category.icon
  const ageDays = getTicketAgeDays(ticket)

  return (
    <motion.div
      variants={adminStaggerItem}
      className={cn(
        'relative mb-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] sm:p-6',
        category.tone,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                category.badge,
              )}
            >
              <CategoryIcon className="size-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md border-border/70 bg-card/80 font-mono text-[10px]">
                  {ticket.id}
                </Badge>
                <Badge className={cn('rounded-md border-0 text-[10px] font-semibold', category.badge)}>
                  {category.label}
                </Badge>
              </div>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                {ticket.subject}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {ticket.description}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
            <GrievanceStatusBadge status={ticket.status} />
            <GrievancePriorityBadge priority={ticket.priority} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Submitted on',
              value: format(parseISO(ticket.createdAt), 'dd MMM yyyy'),
              icon: CalendarDays,
            },
            {
              label: 'Assigned to',
              value: ticket.assignedToName ?? 'Pending assignment',
              icon: User,
            },
            {
              label: 'Last updated',
              value: format(parseISO(ticket.updatedAt), 'dd MMM yyyy'),
              icon: Clock3,
            },
            {
              label: 'Ticket age',
              value: `${ageDays} day${ageDays === 1 ? '' : 's'}`,
              icon: Hash,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/50 bg-card/70 px-3.5 py-3 ring-1 ring-border/40 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="size-3.5 shrink-0" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">
                  {item.label}
                </span>
              </div>
              <p className="mt-1.5 truncate text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className={cn('rounded-xl border px-4 py-3', statusTone.banner)}>
          <div className="flex items-start gap-3">
            <StatusIcon className={cn('mt-0.5 size-4 shrink-0', statusTone.text)} />
            <div>
              <p className={cn('text-sm font-semibold', statusTone.text)}>{statusTone.label}</p>
              {ticket.status === 'closed' && ticket.resolution && (
                <p className="mt-1 text-sm text-muted-foreground">{ticket.resolution.notes}</p>
              )}
            </div>
          </div>
        </div>

        <TicketStatusTrack ticket={ticket} />
      </div>
    </motion.div>
  )
}

function ResolutionOutcomeCard({ ticket }: { ticket: GrievanceTicket }) {
  if (!ticket.resolution) return null

  return (
    <motion.div
      variants={adminStaggerItem}
      className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-card dark:border-emerald-900/50"
    >
      <div className="border-b border-emerald-200/60 bg-emerald-50/70 px-5 py-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-700 dark:text-emerald-300" />
          <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
            Resolution Outcome
          </h2>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="rounded-xl bg-emerald-50/60 px-4 py-3.5 dark:bg-emerald-950/20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700/80 dark:text-emerald-300/80">
            What was done
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground">{ticket.resolution.notes}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Root cause
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{ticket.resolution.rootCause}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Corrective action
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">{ticket.resolution.correctiveAction}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4 text-sm">
          <span className="text-muted-foreground">
            Resolved by <span className="font-medium text-foreground">{ticket.resolution.resolvedBy}</span>
          </span>
          <span className="font-medium text-foreground">
            {formatGrievanceDateTime(ticket.resolution.resolutionDate)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function PensionerTicketDetailPage({ ticketId }: PensionerTicketDetailPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['grievance-ticket', ticketId],
    queryFn: () => fetchGrievanceTicket(ticketId),
  })

  const commentForm = useForm<AddGrievanceCommentFormValues>({
    resolver: zodResolver(addGrievanceCommentSchema),
    defaultValues: { message: '' },
  })

  const rejectForm = useForm<RejectResolutionFormValues>({
    resolver: zodResolver(rejectResolutionSchema),
    defaultValues: { reason: '' },
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['grievance-ticket', ticketId] })
    queryClient.invalidateQueries({ queryKey: ['pensioner-grievances'] })
  }

  const commentMutation = useMutation({
    mutationFn: addGrievanceCommentApi,
    onSuccess: () => {
      toast.success('Comment added')
      commentForm.reset()
      invalidate()
    },
  })

  const attachmentMutation = useMutation({
    mutationFn: ({ fileNames }: { fileNames: string[] }) =>
      addGrievanceAttachmentsApi(ticketId, fileNames, user?.name ?? 'Pensioner'),
    onSuccess: () => {
      toast.success('Documents uploaded')
      invalidate()
    },
  })

  const acceptMutation = useMutation({
    mutationFn: () => acceptGrievanceResolutionApi(ticketId, user?.name ?? 'Pensioner'),
    onSuccess: () => {
      toast.success('Resolution accepted — ticket closed')
      invalidate()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) =>
      rejectGrievanceResolutionApi(ticketId, user?.name ?? 'Pensioner', reason),
    onSuccess: () => {
      toast.success('Resolution rejected — ticket reopened')
      setShowRejectDialog(false)
      rejectForm.reset()
      invalidate()
    },
  })

  if (isLoading || !ticket) return <PageLoadingSkeleton />

  const canRespondToResolution = ticket.status === 'resolved' && ticket.resolution

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).map((f) => f.name)
    if (files.length > 0) attachmentMutation.mutate({ fileNames: files })
  }

  return (
    <PensionerPageShell>
      <motion.div variants={adminStaggerItem} className="mb-5">
        <Button
          variant="outline"
          className="rounded-xl border-border/70 bg-card"
          onClick={() => navigate({ href: '/pensioner/grievance/tickets' })}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to My Tickets
        </Button>
      </motion.div>

      <TicketSummaryHero ticket={ticket} />

      {canRespondToResolution && (
        <motion.div
          variants={adminStaggerItem}
          className="mb-6 overflow-hidden rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-50/80 to-card dark:border-sky-900/50 dark:from-sky-950/20"
        >
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                <Sparkles className="size-4" />
              </div>
              <div>
                <p className="font-semibold text-sky-900 dark:text-sky-100">
                  Resolution ready for your review
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{ticket.resolution?.notes}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-full"
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending}
              >
                <CheckCircle2 className="mr-1.5 size-3.5" />
                Accept resolution
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="mr-1.5 size-3.5" />
                Reject
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <ResolutionOutcomeCard ticket={ticket} />

          {ticket.attachments.length > 0 && (
            <motion.div
              variants={adminStaggerItem}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card"
            >
              <div className="border-b border-border/50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Paperclip className="size-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold">Attachments</h2>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {ticket.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted/50">
                      <Paperclip className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{att.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {formatGrievanceDateTime(att.uploadedAt)} · {att.uploadedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {ticket.status !== 'closed' && (
            <motion.div
              variants={adminStaggerItem}
              className="overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/10"
            >
              <div className="border-b border-border/50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FileUp className="size-4 text-muted-foreground" />
                  <h2 className="text-base font-semibold">Upload supporting documents</h2>
                </div>
              </div>
              <div className="p-5">
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-border/70 bg-card px-4 py-8 text-center transition-colors hover:border-primary/30 hover:bg-primary/[0.02]">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileUp className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Choose files to upload</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Bank statements, payment proofs, or other supporting documents
                    </p>
                  </div>
                  <Input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={adminStaggerItem}
            className="overflow-hidden rounded-2xl border border-border/60 bg-card"
          >
            <div className="border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">Conversation</h2>
              </div>
            </div>
            <div className="space-y-5 p-5">
              <GrievanceCommentThread comments={ticket.comments} variant="chat" />

              {ticket.status !== 'closed' && (
                <div className="border-t border-border/50 pt-5">
                  <Form {...commentForm}>
                    <form
                      onSubmit={commentForm.handleSubmit((values) =>
                        commentMutation.mutate({
                          ticketId,
                          author: user?.name ?? 'Pensioner',
                          authorRole: 'Pensioner',
                          message: values.message,
                        }),
                      )}
                      className="space-y-3"
                    >
                      <FormField
                        control={commentForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Write an update or ask a follow-up question..."
                                className="min-h-[100px] rounded-xl border-border/70 bg-muted/20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="rounded-full"
                        disabled={commentMutation.isPending}
                      >
                        <Send className="mr-1.5 size-3.5" />
                        Send comment
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            variants={adminStaggerItem}
            className="overflow-hidden rounded-2xl border border-border/60 bg-card xl:sticky xl:top-6"
          >
            <div className="border-b border-border/50 px-5 py-4">
              <h2 className="text-base font-semibold">Ticket details</h2>
            </div>
            <div className="space-y-3 p-5 text-sm">
              {[
                { label: 'Ticket ID', value: ticket.id, mono: true },
                { label: 'PPO Number', value: ticket.ppoNumber, mono: true },
                { label: 'Contact', value: ticket.contactNumber },
                { label: 'Created', value: formatGrievanceDateTime(ticket.createdAt) },
                {
                  label: 'SLA due',
                  value: format(parseISO(ticket.slaDueAt), 'dd MMM yyyy, h:mm a'),
                },
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
          </motion.div>

          <motion.div
            variants={adminStaggerItem}
            className="overflow-hidden rounded-2xl border border-border/60 bg-card"
          >
            <div className="border-b border-border/50 px-5 py-4">
              <h2 className="text-base font-semibold">Activity timeline</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Latest updates first</p>
            </div>
            <div className="p-5">
              <GrievanceTimeline events={ticket.timeline} variant="rich" animated />
            </div>
          </motion.div>

          <motion.div variants={adminStaggerItem}>
            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link to="/pensioner/grievance/history">View ticket history</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject resolution</DialogTitle>
          </DialogHeader>
          <Form {...rejectForm}>
            <form
              onSubmit={rejectForm.handleSubmit((values) => rejectMutation.mutate(values.reason))}
              className="space-y-4"
            >
              <FormField
                control={rejectForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Explain why the resolution is not satisfactory..."
                        className="min-h-[100px] rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  variant="destructive"
                  className="rounded-full"
                  disabled={rejectMutation.isPending}
                >
                  Reject resolution
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </PensionerPageShell>
  )
}
