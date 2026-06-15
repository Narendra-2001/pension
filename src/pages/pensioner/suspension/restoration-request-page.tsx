import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Hash,
  Loader2,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react'
import { useCallback, useState, type ChangeEvent, type DragEvent } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { AdminSectionHeading } from '@/components/admin/shared/admin-analytics-ui'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import {
  PensionerPageShell,
  PensionerStatCard,
  StepTransition,
} from '@/components/pensioner/shared/pensioner-page-ui'
import { WizardStepper } from '@/components/pensioner/shared/wizard-stepper'
import { SuspensionStatusBadge } from '@/components/suspension/suspension-status-badge'
import { TriggerTypeBadge } from '@/components/suspension/trigger-type-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
  fetchPensionerActiveSuspension,
  submitPensionerRestorationRequest,
} from '@/data/suspension-api'
import { TRIGGER_TYPE_LABELS } from '@/lib/suspension'
import {
  restorationRequestSchema,
  type RestorationRequestFormValues,
} from '@/lib/suspension-schema'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import type { SuspensionDocument, SuspensionTriggerType } from '@/types/suspension'

const STEPS = [
  { id: 1, label: 'Review Case' },
  { id: 2, label: 'Explanation' },
  { id: 3, label: 'Documents' },
  { id: 4, label: 'Confirm' },
]

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_FILE_SIZE_MB = 5
const MIN_REASON_LENGTH = 20

const RECOMMENDED_DOCS: Record<SuspensionTriggerType, string[]> = {
  no_verification: ['Digital Life Certificate', 'Aadhaar Card', 'Photo ID Proof'],
  invalid_documents: ['Corrected Documents', 'Aadhaar Card', 'PAN Card'],
  fraud: ['Identity Proof', 'Affidavit', 'Supporting Correspondence'],
  duplicate: ['Identity Proof', 'Service Records', 'Clarification Letter'],
  deceased: ['Death Certificate', 'Legal Heir Proof'],
  administrative_hold: ['Requested Documents', 'Identity Proof', 'Office Correspondence'],
  other: ['Life Certificate', 'Identity Proof', 'Supporting Documents'],
}

function EmptyStateCard({
  icon: Icon,
  iconClassName,
  title,
  description,
  action,
}: {
  icon: typeof AlertTriangle
  iconClassName: string
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <PensionerPageShell>
      <PageHeader title="Restoration Request" description="Submit a request to restore your pension" />
      <Card className="admin-card overflow-hidden">
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <div className={cn('mb-5 flex size-16 items-center justify-center rounded-2xl', iconClassName)}>
            <Icon className="size-8" strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
          <div className="mt-6">{action}</div>
        </CardContent>
      </Card>
    </PensionerPageShell>
  )
}

export function RestorationRequestPage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(1)
  const [documents, setDocuments] = useState<SuspensionDocument[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const { data: suspensionCase, isLoading } = useQuery({
    queryKey: ['pensioner-active-suspension', pensionerId],
    queryFn: () => fetchPensionerActiveSuspension(pensionerId),
    enabled: !!pensionerId,
  })

  const form = useForm<RestorationRequestFormValues>({
    resolver: zodResolver(restorationRequestSchema),
    defaultValues: {
      reasonForRestoration: '',
      remarks: '',
      declarationAccepted: false,
    },
    mode: 'onChange',
  })

  const reasonValue = form.watch('reasonForRestoration') ?? ''
  const reasonLength = reasonValue.trim().length
  const reasonProgress = Math.min(100, (reasonLength / MIN_REASON_LENGTH) * 100)

  const mutation = useMutation({
    mutationFn: submitPensionerRestorationRequest,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['pensioner-active-suspension', pensionerId] })
      queryClient.invalidateQueries({ queryKey: ['pensioner-restoration-requests', pensionerId] })
      queryClient.invalidateQueries({ queryKey: ['admin-restoration-requests'] })
      toast.success('Restoration request submitted', {
        description: `Request ${created.id} is now pending admin review.`,
      })
      navigate({ to: '/pensioner/suspension/requests' })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const valid: SuspensionDocument[] = []
      const rejected: string[] = []

      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
          rejected.push(`${file.name} — unsupported format`)
          continue
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          rejected.push(`${file.name} — exceeds ${MAX_FILE_SIZE_MB}MB`)
          continue
        }
        valid.push({
          name: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          fileName: file.name,
        })
      }

      if (rejected.length) toast.error(rejected[0])
      if (valid.length) {
        setDocuments((prev) => [...prev, ...valid])
        toast.success(`${valid.length} document(s) added`)
      }
    },
    [],
  )

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files)
      e.target.value = ''
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    if (!suspensionCase) return
    mutation.mutate({
      suspensionCaseId: suspensionCase.id,
      pensionerId,
      reasonForRestoration: values.reasonForRestoration,
      remarks: values.remarks,
      declarationAccepted: values.declarationAccepted,
      documents,
    })
  })

  const goToNextStep = async () => {
    if (currentStep === 2) {
      const valid = await form.trigger('reasonForRestoration')
      if (!valid) return
    }
    setCurrentStep((s) => Math.min(s + 1, STEPS.length))
  }

  if (isLoading) return <PageLoadingSkeleton />

  if (!suspensionCase) {
    return (
      <EmptyStateCard
        icon={CheckCircle2}
        iconClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
        title="No Active Suspension"
        description="Your pension account is active. Restoration requests can only be submitted when a suspension case is linked to your profile."
        action={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/pensioner/suspension">View Suspension Status</Link>
          </Button>
        }
      />
    )
  }

  const canSubmit =
    suspensionCase.status === 'suspended' || suspensionCase.status === 'rejected'

  if (!canSubmit) {
    return (
      <EmptyStateCard
        icon={ClipboardList}
        iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
        title="Request Already Pending"
        description={`A restoration request for case ${suspensionCase.id} is already under review. You will be notified once an admin decision is made.`}
        action={
          <Button className="rounded-full" asChild>
            <Link to="/pensioner/suspension/requests">View My Requests</Link>
          </Button>
        }
      />
    )
  }

  const recommendedDocs = RECOMMENDED_DOCS[suspensionCase.triggerType]

  return (
    <PensionerPageShell>
      <PageHeader
        title="Submit Restoration Request"
        description="Follow the guided steps to request reinstatement of your pension"
        action={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/pensioner/suspension">
              <ArrowLeft className="mr-1.5 size-4" /> Back
            </Link>
          </Button>
        }
      />

      <div className="mb-8 overflow-hidden rounded-2xl border border-destructive/25 bg-gradient-to-r from-destructive/5 via-destructive/[0.03] to-transparent">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-destructive">Pension payments are currently suspended</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Complete all steps below to submit your restoration request for admin review.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <SuspensionStatusBadge status={suspensionCase.status} />
            <TriggerTypeBadge triggerType={suspensionCase.triggerType} />
          </div>
        </div>
      </div>

      <WizardStepper steps={STEPS} currentStep={currentStep} className="mb-8" />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <div className="grid gap-6 lg:grid-cols-5">
            <aside className="space-y-4 lg:col-span-2">
              <PensionerStatCard
                label="Suspension Case"
                value={<span className="font-mono">{suspensionCase.id}</span>}
                icon={Hash}
                tone="rose"
              />
              <PensionerStatCard
                label="PPO Number"
                value={suspensionCase.ppoNumber}
                icon={FileText}
                tone="blue"
              />
              <PensionerStatCard
                label="Suspended On"
                value={suspensionCase.suspensionDate}
                icon={Calendar}
                tone="amber"
              />

              <Card className="admin-card overflow-hidden border-primary/10">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck className="size-4" />
                    </div>
                    <p className="text-sm font-semibold">Before you submit</p>
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    {[
                      'Explain clearly how you resolved the suspension issue',
                      'Upload documents that support your claim',
                      'Ensure all information is accurate and verifiable',
                      'Review the summary carefully before submitting',
                    ].map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {suspensionCase.rejectionReason && (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <p className="font-semibold text-destructive">Previous rejection reason</p>
                  <p className="mt-1 text-muted-foreground">{suspensionCase.rejectionReason}</p>
                </div>
              )}
            </aside>

            <div className="lg:col-span-3">
              <Card className="admin-card overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <StepTransition stepKey={1}>
                        <AdminSectionHeading
                          title="Review your suspension case"
                          description="Confirm the details below before proceeding with your restoration request"
                        />

                        <dl className="mt-6 space-y-4 rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm">
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">Suspension Reason</dt>
                            <dd className="font-medium sm:text-right">{suspensionCase.suspensionReason}</dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">Trigger Type</dt>
                            <dd className="font-medium sm:text-right">
                              {TRIGGER_TYPE_LABELS[suspensionCase.triggerType]}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">Suspension Date</dt>
                            <dd className="font-medium sm:text-right">{suspensionCase.suspensionDate}</dd>
                          </div>
                          {suspensionCase.remarks && (
                            <div className="flex flex-col gap-1 border-t border-border/40 pt-4 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">Admin Remarks</dt>
                              <dd className="sm:max-w-[60%] sm:text-right">{suspensionCase.remarks}</dd>
                            </div>
                          )}
                        </dl>

                        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
                          <p className="text-sm font-medium">What happens next?</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            After submission, your request will be reviewed by the pension authority.
                            You can track progress from the My Restoration Requests section.
                          </p>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <Button type="button" className="rounded-xl px-6" onClick={goToNextStep}>
                            Continue <ArrowRight className="ml-2 size-4" />
                          </Button>
                        </div>
                      </StepTransition>
                    )}

                    {currentStep === 2 && (
                      <StepTransition stepKey={2}>
                        <AdminSectionHeading
                          title="Explain your restoration request"
                          description="Describe the corrective actions you have taken and why your pension should be restored"
                        />

                        <div className="mt-6 space-y-5">
                          <FormField
                            control={form.control}
                            name="reasonForRestoration"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Reason for Restoration</FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    className="min-h-[140px] rounded-xl resize-y"
                                    placeholder="Example: I have submitted my digital life certificate for FY 2025-26 via the portal on 10 May 2026. The certificate reference number is DLC-2026-XXXX..."
                                  />
                                </FormControl>
                                <div className="flex items-center justify-between gap-2">
                                  <FormMessage />
                                  <span
                                    className={cn(
                                      'ml-auto text-xs tabular-nums',
                                      reasonLength >= MIN_REASON_LENGTH
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-muted-foreground',
                                    )}
                                  >
                                    {reasonLength}/{MIN_REASON_LENGTH} min
                                  </span>
                                </div>
                                <div className="h-1 overflow-hidden rounded-full bg-muted">
                                  <div
                                    className={cn(
                                      'h-full rounded-full transition-all duration-300',
                                      reasonLength >= MIN_REASON_LENGTH ? 'bg-emerald-500' : 'bg-primary/60',
                                    )}
                                    style={{ width: `${reasonProgress}%` }}
                                  />
                                </div>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Additional Remarks{' '}
                                  <span className="font-normal text-muted-foreground">(optional)</span>
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    {...field}
                                    className="min-h-[90px] rounded-xl resize-y"
                                    placeholder="Any other context that may help the reviewing officer..."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="mt-6 flex justify-between gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setCurrentStep(1)}
                          >
                            <ArrowLeft className="mr-2 size-4" /> Back
                          </Button>
                          <Button type="button" className="rounded-xl px-6" onClick={goToNextStep}>
                            Continue <ArrowRight className="ml-2 size-4" />
                          </Button>
                        </div>
                      </StepTransition>
                    )}

                    {currentStep === 3 && (
                      <StepTransition stepKey={3}>
                        <AdminSectionHeading
                          title="Upload supporting documents"
                          description="Attach proof that supports your restoration request"
                        />

                        <div className="mt-4 flex flex-wrap gap-2">
                          {recommendedDocs.map((doc) => (
                            <Badge key={doc} variant="secondary" className="rounded-full font-normal">
                              {doc}
                            </Badge>
                          ))}
                        </div>

                        <label
                          onDragOver={(e) => {
                            e.preventDefault()
                            setIsDragging(true)
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={cn(
                            'relative mt-5 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-colors',
                            isDragging
                              ? 'border-primary bg-primary/5'
                              : 'border-primary/25 bg-muted/20 hover:border-primary/40 hover:bg-muted/30',
                          )}
                        >
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                            className="absolute inset-0 cursor-pointer opacity-0"
                            onChange={handleInputChange}
                          />
                          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                            <Upload className="size-7 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold">
                              {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              PDF, JPG, PNG — up to {MAX_FILE_SIZE_MB}MB each
                            </p>
                          </div>
                        </label>

                        {documents.length > 0 ? (
                          <ul className="mt-5 space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Attached ({documents.length})
                            </p>
                            {documents.map((doc) => (
                              <li
                                key={doc.fileName}
                                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
                              >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                  <FileText className="size-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">{doc.name}</p>
                                  <p className="truncate text-xs text-muted-foreground">{doc.fileName}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                                  onClick={() =>
                                    setDocuments((prev) => prev.filter((d) => d.fileName !== doc.fileName))
                                  }
                                  aria-label={`Remove ${doc.fileName}`}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-4 text-center text-sm text-muted-foreground">
                            No documents attached yet. You can continue without documents, but uploads
                            help speed up review.
                          </p>
                        )}

                        <div className="mt-6 flex justify-between gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setCurrentStep(2)}
                          >
                            <ArrowLeft className="mr-2 size-4" /> Back
                          </Button>
                          <Button type="button" className="rounded-xl px-6" onClick={goToNextStep}>
                            Continue <ArrowRight className="ml-2 size-4" />
                          </Button>
                        </div>
                      </StepTransition>
                    )}

                    {currentStep === 4 && (
                      <StepTransition stepKey={4}>
                        <AdminSectionHeading
                          title="Review and submit"
                          description="Verify your request details before final submission"
                        />

                        <div className="mt-6 space-y-4">
                          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Restoration Reason
                            </p>
                            <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                              {form.getValues('reasonForRestoration') || '—'}
                            </p>
                          </div>

                          {form.getValues('remarks') && (
                            <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm">
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Additional Remarks
                              </p>
                              <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                                {form.getValues('remarks')}
                              </p>
                            </div>
                          )}

                          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Documents
                            </p>
                            {documents.length > 0 ? (
                              <ul className="mt-2 space-y-1">
                                {documents.map((doc) => (
                                  <li key={doc.fileName} className="flex items-center gap-2">
                                    <FileText className="size-3.5 text-primary" />
                                    <span>{doc.fileName}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-muted-foreground">No documents attached</p>
                            )}
                          </div>

                          <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4">
                            <FormField
                              control={form.control}
                              name="declarationAccepted"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start gap-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value === true}
                                      onCheckedChange={(checked) => field.onChange(checked === true)}
                                      className="mt-0.5"
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-snug">
                                    <FormLabel className="text-sm font-normal">
                                      I declare that the information and documents submitted are true and
                                      correct to the best of my knowledge. I understand that providing false
                                      information may lead to further action.
                                    </FormLabel>
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => setCurrentStep(3)}
                          >
                            <ArrowLeft className="mr-2 size-4" /> Back
                          </Button>
                          <Button
                            type="submit"
                            className="rounded-xl px-6"
                            disabled={mutation.isPending || !form.watch('declarationAccepted')}
                          >
                            {mutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 size-4 animate-spin" /> Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 size-4" /> Submit Restoration Request
                              </>
                            )}
                          </Button>
                        </div>
                      </StepTransition>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </PensionerPageShell>
  )
}
