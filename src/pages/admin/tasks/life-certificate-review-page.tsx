import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileSearch,
  MapPin,
  ScanFace,
  Shield,
  Smartphone,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  AdminActionBar,
  AdminDetailCard,
  AdminDetailGrid,
  AdminDetailHero,
  AdminDetailRow,
  AdminFacePreview,
  AdminPageShell,
  AdminProcessStepper,
  AdminVerificationStepGrid,
  AdminWorkflowTimeline,
  PensionerAvatar,
  type WorkflowTimelineEvent,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { TaskTypeBadge } from '@/components/admin/tasks/task-type-badge'
import { TaskStatusBadge } from '@/components/admin/tasks/task-status-badge'
import featureLifeVerification from '@/assets/features/feature-life-verification.png'
import passportPhotoImage from '@/assets/documents/previews/passport-photo.png'
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
import { adminProcessLifeCertificate, fetchLifeCertificateById } from '@/data/life-certificate-api'
import { formatCaptureTimestamp } from '@/lib/verification-capture'
import { formatVerificationDisplayDate } from '@/lib/verification-dates'
import { getPensionerAvatarSrc } from '@/lib/user-avatars'
import { useAuth } from '@/providers/auth-provider'

const remarksSchema = z.object({
  remarks: z.string().min(10, 'Remarks must be at least 10 characters'),
})

const LC_WORKFLOW_STEPS = [
  { id: 'capture', label: 'Capture', description: 'Face & liveness' },
  { id: 'verify', label: 'Verify', description: 'OTP & checks' },
  { id: 'review', label: 'Admin Review', description: 'Pending approval' },
  { id: 'complete', label: 'Complete', description: 'Approved' },
]

function lifeCertStepIndex(status: string, stepsDone: number): number {
  if (status === 'approved') return 4
  if (status === 'rejected') return 3
  if (stepsDone >= 4) return 3
  return Math.min(stepsDone + 1, 3)
}

const TIMELINE_ICONS: Record<string, typeof Clock> = {
  submitted: Clock,
  pending_review: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
}

const TIMELINE_TONES: Record<string, WorkflowTimelineEvent['tone']> = {
  submitted: 'slate',
  pending_review: 'amber',
  approved: 'green',
  rejected: 'rose',
}

interface LifeCertificateReviewPageProps {
  submissionId: string
}

export function LifeCertificateReviewPage({ submissionId }: LifeCertificateReviewPageProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [action, setAction] = useState<'verify' | 'approve' | 'reject' | null>(null)

  const { data: submission, isLoading } = useQuery({
    queryKey: ['life-certificate', submissionId],
    queryFn: () => fetchLifeCertificateById(submissionId),
  })

  const form = useForm({
    resolver: zodResolver(remarksSchema),
    defaultValues: { remarks: '' },
  })

  const mutation = useMutation({
    mutationFn: ({ act, remarks }: { act: 'verify' | 'approve' | 'reject'; remarks: string }) =>
      adminProcessLifeCertificate(submissionId, act, remarks, user?.name),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['life-certificate', submissionId] })
      queryClient.invalidateQueries({ queryKey: ['life-certificate-submissions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
      queryClient.invalidateQueries({ queryKey: ['admin-task-counts'] })
      queryClient.invalidateQueries({ queryKey: ['pending-admin-task-count'] })
      toast.success(
        `Life certificate ${vars.act === 'approve' ? 'approved' : vars.act === 'reject' ? 'rejected' : 'verified'}`,
      )
      setAction(null)
      form.reset()
      if (vars.act === 'approve') {
        navigate({ to: '/admin/verification/approved' })
      } else if (vars.act === 'reject') {
        navigate({ to: '/admin/verification/rejected' })
      }
    },
  })

  const onAction = form.handleSubmit((values) => {
    if (!action) return
    mutation.mutate({ act: action, remarks: values.remarks })
  })

  const actionLabels = {
    verify: 'Verify Documents',
    approve: 'Approve Life Certificate',
    reject: 'Reject Life Certificate',
  }

  if (isLoading || !submission) return <PageLoadingSkeleton />

  const isFinal = submission.status === 'approved' || submission.status === 'rejected'
  const verificationSteps = [
    { label: 'Face Capture', done: submission.faceCaptureVerified },
    { label: 'Liveness', done: submission.livenessPassed },
    { label: 'OTP', done: submission.otpVerified },
    { label: 'Declaration', done: submission.declarationAccepted },
  ]
  const stepsDone = verificationSteps.filter((s) => s.done).length
  const faceImage = getPensionerAvatarSrc(submission.ppoNumber) ?? passportPhotoImage

  const timelineEvents: WorkflowTimelineEvent[] = submission.timeline.map((event) => ({
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
        avatar={<PensionerAvatar name={submission.pensionerName} ppo={submission.ppoNumber} />}
        title={submission.id}
        subtitle={`${submission.pensionerName} · ${submission.ppoNumber}`}
        badges={
          <>
            <TaskTypeBadge type="life_certificate" />
            <TaskStatusBadge label={submission.status.replace(/_/g, ' ')} isPending={!isFinal} />
          </>
        }
        actions={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/tasks" search={{ type: 'life_certificate' }}>
              <ArrowLeft className="size-4" /> Back to Work Queue
            </Link>
          </Button>
        }
        illustration={
          <div className="mt-5 overflow-hidden rounded-xl border border-border/50">
            <img
              src={featureLifeVerification}
              alt="Life certificate verification"
              className="h-24 w-full object-cover object-top opacity-90"
            />
          </div>
        }
      />

      <AdminProcessStepper
        steps={LC_WORKFLOW_STEPS}
        currentStep={lifeCertStepIndex(submission.status, stepsDone)}
      />

      {!isFinal && (
        <AdminActionBar>
          <Button variant="outline" className="rounded-full" onClick={() => setAction('verify')}>
            <FileSearch className="size-4" /> Verify Documents
          </Button>
          <Button className="rounded-full" onClick={() => setAction('approve')}>
            <CheckCircle2 className="size-4" /> Approve
          </Button>
          <Button variant="destructive" className="rounded-full" onClick={() => setAction('reject')}>
            <XCircle className="size-4" /> Reject
          </Button>
        </AdminActionBar>
      )}

      <AdminDetailGrid columns={3}>
        <div className="space-y-5 lg:col-span-2">
          <AdminDetailCard title="Verification Steps" icon={ScanFace} tone="green">
            <AdminVerificationStepGrid steps={verificationSteps} />
          </AdminDetailCard>

          <div className="grid gap-5 sm:grid-cols-2">
            <AdminDetailCard title="Face Capture Preview" icon={ScanFace} tone="blue">
              <AdminFacePreview
                imageSrc={faceImage}
                alt={submission.pensionerName}
                score={submission.faceMatchScore ?? 94}
                capturedAt={
                  submission.faceCaptureTimestamp
                    ? formatCaptureTimestamp(submission.faceCaptureTimestamp)
                    : undefined
                }
              />
            </AdminDetailCard>

            <AdminDetailCard title="Verification Details" icon={Shield} tone="violet">
              <AdminDetailRow label="Method" value={submission.method} />
              <AdminDetailRow label="OTP" value="Verified" />
              <AdminDetailRow
                label="Liveness"
                value={
                  submission.livenessPassed
                    ? `Passed (${submission.livenessScore ?? '—'}%)`
                    : 'Failed'
                }
              />
              {submission.livenessTimestamp && (
                <AdminDetailRow
                  label="Liveness at"
                  value={formatCaptureTimestamp(submission.livenessTimestamp)}
                />
              )}
              <AdminDetailRow label="Submitted" value={submission.submittedAt} />
              {submission.status === 'approved' && submission.nextVerificationDueDate && (
                <AdminDetailRow
                  label="Next Verification Due"
                  value={formatVerificationDisplayDate(submission.nextVerificationDueDate)}
                />
              )}
            </AdminDetailCard>
          </div>

          {(submission.geoLocation || submission.deviceInfo || submission.uploadedDocuments?.length) && (
            <AdminDetailCard title="Security & Location" icon={MapPin} tone="amber">
              <div className="grid gap-4 sm:grid-cols-2">
                {submission.geoLocation && (
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
                    <p className="font-medium">Geo-location</p>
                    <p className="mt-1 text-muted-foreground">
                      {submission.geoLocation.latitude.toFixed(4)},{' '}
                      {submission.geoLocation.longitude.toFixed(4)}
                    </p>
                    {submission.geoLocation.accuracy && (
                      <p className="text-muted-foreground">
                        Accuracy: ±{Math.round(submission.geoLocation.accuracy)}m
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      {formatCaptureTimestamp(submission.geoLocation.capturedAt)}
                    </p>
                  </div>
                )}
                {submission.deviceInfo && (
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
                    <p className="flex items-center gap-1.5 font-medium">
                      <Smartphone className="size-3.5" /> Device Info
                    </p>
                    <p className="mt-1 text-muted-foreground">{submission.deviceInfo.platform}</p>
                    <p className="text-muted-foreground">{submission.deviceInfo.screenResolution}</p>
                    <p className="text-muted-foreground">{submission.deviceInfo.timezone}</p>
                  </div>
                )}
                {submission.uploadedDocuments && submission.uploadedDocuments.length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm sm:col-span-2">
                    <p className="font-medium">Uploaded Documents</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      {submission.uploadedDocuments.map((doc) => (
                        <li key={doc.fileName}>
                          {doc.fileName} ({(doc.fileSize / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AdminDetailCard>
          )}

          {submission.verificationNotes && (
            <AdminDetailCard title="Verification Notes" icon={FileSearch} tone="slate">
              <p className="text-sm text-muted-foreground">{submission.verificationNotes}</p>
            </AdminDetailCard>
          )}

          {submission.adminRemarks && (
            <AdminDetailCard title="Admin Remarks" icon={FileSearch} tone="rose">
              <p className="text-sm text-muted-foreground">{submission.adminRemarks}</p>
            </AdminDetailCard>
          )}
        </div>

        <AdminDetailCard title="Timeline" icon={Clock} tone="amber" className="h-fit">
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
                      <Textarea {...field} className="min-h-[100px] rounded-xl" />
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
