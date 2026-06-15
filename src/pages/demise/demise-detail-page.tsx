import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Heart,
  IndianRupee,
  MessageSquare,
  RotateCcw,
  ShieldCheck,
  Sparkles,
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
  PensionerAvatar,
} from '@/components/admin/shared/admin-detail-ui'
import { DataTable } from '@/components/admin/shared/data-table'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DemiseDocumentPreview } from '@/components/demise/demise-document-preview'
import { useDemisePortal } from '@/components/demise/demise-portal-context'
import { DemiseStatusBadge } from '@/components/demise/demise-status-badge'
import { DemiseTimeline } from '@/components/demise/demise-timeline'
import { FamilyPensionStatusBadge } from '@/components/demise/family-pension-status-badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  fetchDemiseAuditLogs,
  fetchDemiseIntimation,
  fetchFamilyPensionByDemiseId,
  initiateFamilyPensionApi,
  processDemiseVerificationApi,
  startDemiseVerificationApi,
} from '@/data/demise-api'
import { DEMISE_AUDIT_ACTION_LABELS, formatDemiseCurrency, getFamilyPensionDemoFormValues } from '@/lib/demise'
import { demiseVerificationSchema, familyPensionInitiationSchema } from '@/lib/demise-schema'
import { useAuth } from '@/providers/auth-provider'
import type { ColumnDef } from '@tanstack/react-table'
import type { DemiseAuditEntry, DemiseIntimationStatus } from '@/types/demise'

const DEMISE_WORKFLOW_STEPS = [
  { id: 'submitted', label: 'Submitted', description: 'Report filed' },
  { id: 'verification', label: 'Verification', description: 'Documents review' },
  { id: 'decision', label: 'Decision', description: 'Approve or reject' },
  { id: 'family', label: 'Family Pension', description: 'Benefit transfer' },
]

function demiseStepIndex(status: DemiseIntimationStatus, hasFamilyPension: boolean): number {
  if (hasFamilyPension) return 4
  if (status === 'approved') return 3
  if (status === 'rejected') return 3
  if (status === 'under_verification' || status === 'needs_clarification') return 2
  return 1
}

interface DemiseDetailPageProps {
  intimationId: string
}

export function DemiseDetailPage({ intimationId }: DemiseDetailPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { basePath, permissions } = useDemisePortal()

  const [verificationAction, setVerificationAction] = useState<
    'approve' | 'reject' | 'needs_clarification' | 'reverse' | null
  >(null)
  const [showFamilyPensionDialog, setShowFamilyPensionDialog] = useState(false)

  const { data: intimation, isLoading } = useQuery({
    queryKey: ['demise-intimation', intimationId],
    queryFn: () => fetchDemiseIntimation(intimationId),
  })

  const { data: auditLogs } = useQuery({
    queryKey: ['demise-audit', intimationId],
    queryFn: () => fetchDemiseAuditLogs(intimationId),
    enabled: !!intimationId,
  })

  const { data: familyPension } = useQuery({
    queryKey: ['family-pension-by-demise', intimationId],
    queryFn: () => fetchFamilyPensionByDemiseId(intimationId),
    enabled: !!intimationId,
  })

  const verificationForm = useForm({
    resolver: zodResolver(demiseVerificationSchema),
    defaultValues: { remarks: '' },
  })

  const familyPensionForm = useForm({
    resolver: zodResolver(familyPensionInitiationSchema),
    defaultValues: {
      nomineeName: '',
      relationship: '',
      mobileNumber: '',
      address: '',
      accountHolderName: '',
      bankName: '',
      branchName: '',
      accountNumber: '',
      ifscCode: '',
    },
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['demise-intimation', intimationId] })
    queryClient.invalidateQueries({ queryKey: ['demise-audit', intimationId] })
    queryClient.invalidateQueries({ queryKey: ['demise-intimations'] })
    queryClient.invalidateQueries({ queryKey: ['demise-dashboard-stats'] })
    queryClient.invalidateQueries({ queryKey: ['family-pension-by-demise', intimationId] })
    queryClient.invalidateQueries({ queryKey: ['family-pension-applications'] })
    queryClient.invalidateQueries({ queryKey: ['deceased-profiles'] })
    queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
    queryClient.invalidateQueries({ queryKey: ['recovery-cases'] })
  }

  const startVerificationMutation = useMutation({
    mutationFn: () => startDemiseVerificationApi(intimationId, user?.name ?? 'Pension Administrator'),
    onSuccess: () => {
      invalidateAll()
      toast.success('Verification started')
    },
  })

  const verificationMutation = useMutation({
    mutationFn: (action: 'approve' | 'reject' | 'needs_clarification' | 'reverse') =>
      processDemiseVerificationApi({
        intimationId,
        action,
        remarks: verificationForm.getValues('remarks'),
        actor: user?.name ?? 'Pension Administrator',
      }),
    onSuccess: (_, action) => {
      invalidateAll()
      setVerificationAction(null)
      verificationForm.reset()
      toast.success(`Demise ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'reverse' ? 'reversed' : 'clarification requested'}`)
    },
  })

  const familyPensionMutation = useMutation({
    mutationFn: initiateFamilyPensionApi,
    onSuccess: (app) => {
      invalidateAll()
      setShowFamilyPensionDialog(false)
      toast.success('Family pension initiated', { description: `Application ${app.id} created` })
    },
  })

  const auditColumns: ColumnDef<DemiseAuditEntry>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => format(parseISO(row.original.timestamp), 'dd MMM yyyy, hh:mm a'),
    },
    { accessorKey: 'user', header: 'User' },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => DEMISE_AUDIT_ACTION_LABELS[row.original.action],
    },
    { accessorKey: 'oldValue', header: 'Old Value', cell: ({ row }) => row.original.oldValue ?? '—' },
    { accessorKey: 'newValue', header: 'New Value', cell: ({ row }) => row.original.newValue ?? '—' },
    { accessorKey: 'remarks', header: 'Remarks', cell: ({ row }) => row.original.remarks ?? '—' },
  ]

  if (isLoading) return <PageLoadingSkeleton />

  if (!intimation) {
    return (
      <div>
        <Button variant="outline" className="mb-6 rounded-full" onClick={() => navigate({ href: `${basePath}/requests` })}>
          <ArrowLeft className="mr-1.5 size-4" /> Back
        </Button>
        <EmptyState title="Intimation not found" description="This demise intimation may have been removed." />
      </div>
    )
  }

  const canVerify =
    permissions.canVerify &&
    ['submitted', 'under_verification', 'needs_clarification'].includes(intimation.status)

  const canApprove = permissions.canApprove && intimation.status === 'under_verification'
  const canInitiateFamilyPension =
    permissions.canInitiateFamilyPension && intimation.status === 'approved' && !familyPension

  const openFamilyPensionDialog = () => {
    familyPensionForm.reset({
      nomineeName: intimation.nominee.nomineeName,
      relationship: intimation.nominee.relationship,
      mobileNumber: intimation.nominee.mobileNumber.replace(/\D/g, '').slice(-10),
      address: '',
      accountHolderName: intimation.nominee.nomineeName,
      bankName: '',
      branchName: '',
      accountNumber: '',
      ifscCode: '',
    })
    setShowFamilyPensionDialog(true)
  }

  const fillFamilyPensionDemo = () => {
    familyPensionForm.reset(
      getFamilyPensionDemoFormValues({
        nomineeName: intimation.nominee.nomineeName,
        relationship: intimation.nominee.relationship,
        mobileNumber: intimation.nominee.mobileNumber,
      }),
    )
    toast.success('Demo data filled', {
      description: 'Nominee and bank details pre-filled for review.',
    })
  }

  return (
    <AdminPageShell>
      <AdminDetailHero
        avatar={<PensionerAvatar name={intimation.pensionerName} ppo={intimation.ppoNumber} />}
        title={intimation.id}
        subtitle={`${intimation.pensionerName} · ${intimation.ppoNumber}`}
        badges={
          <>
            <DemiseStatusBadge status={intimation.status} />
            {familyPension && <FamilyPensionStatusBadge status={familyPension.status} />}
          </>
        }
        actions={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/requests` })}>
            <ArrowLeft className="size-4" /> Back to Requests
          </Button>
        }
      />

      <AdminProcessStepper
        steps={DEMISE_WORKFLOW_STEPS}
        currentStep={demiseStepIndex(intimation.status, !!familyPension)}
      />

      {!permissions.viewOnly && intimation.status === 'submitted' && permissions.canVerify && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-amber-600" />
            <p className="text-sm">This demise report is awaiting verification. Pension remains active until approved.</p>
          </div>
          <Button
            className="rounded-full"
            onClick={() => startVerificationMutation.mutate()}
            disabled={startVerificationMutation.isPending}
          >
            Start Verification
          </Button>
        </div>
      )}

      {canVerify && intimation.status !== 'submitted' && (
        <AdminActionBar>
          {canApprove && (
            <Button className="rounded-full" onClick={() => setVerificationAction('approve')}>
              <CheckCircle2 className="size-4" /> Approve
            </Button>
          )}
          {permissions.canReject && (
            <Button variant="destructive" className="rounded-full" onClick={() => setVerificationAction('reject')}>
              <XCircle className="size-4" /> Reject
            </Button>
          )}
          {permissions.canRequestClarification && (
            <Button variant="outline" className="rounded-full" onClick={() => setVerificationAction('needs_clarification')}>
              <MessageSquare className="size-4" /> Request Clarification
            </Button>
          )}
        </AdminActionBar>
      )}

      {!permissions.viewOnly &&
        intimation.status === 'approved' &&
        (canInitiateFamilyPension || permissions.canReverse) && (
        <Card className="admin-card mb-6 border-emerald-200 bg-emerald-50/30 dark:border-emerald-900 dark:bg-emerald-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Post-Approval Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canInitiateFamilyPension && (
              <p className="text-sm text-muted-foreground">
                Demise is approved. Initiate the family pension application for the nominee to continue benefit transfer.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {canInitiateFamilyPension && (
                <Button className="rounded-full" onClick={openFamilyPensionDialog}>
                  <Heart className="mr-1.5 size-4" /> Initiate Family Pension
                </Button>
              )}
              {permissions.canReverse && (
                <Button variant="outline" className="rounded-full" onClick={() => setVerificationAction('reverse')}>
                  <RotateCcw className="mr-1.5 size-4" /> Reverse Approval
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="rounded-full">
          <TabsTrigger value="details" className="rounded-full">Details</TabsTrigger>
          <TabsTrigger value="documents" className="rounded-full">Documents</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-full">Timeline</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-full">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <AdminDetailGrid>
            <AdminDetailCard title="Pensioner Information" icon={ShieldCheck} tone="blue">
              <AdminDetailRow label="PPO Number" value={intimation.ppoNumber} mono />
              <AdminDetailRow label="Pensioner Name" value={intimation.pensionerName} />
              <AdminDetailRow label="Submitted By" value={intimation.submittedBy} />
              <AdminDetailRow label="Submitted Date" value={intimation.submittedAt} />
            </AdminDetailCard>

            <AdminDetailCard title="Nominee Information" icon={Heart} tone="violet">
              <AdminDetailRow label="Nominee Name" value={intimation.nominee.nomineeName} />
              <AdminDetailRow label="Relationship" value={intimation.nominee.relationship} />
              <AdminDetailRow label="Mobile" value={intimation.nominee.mobileNumber} />
              <AdminDetailRow label="Priority" value={intimation.nominee.priority} />
              {intimation.secondaryNominee && (
                <>
                  <AdminDetailRow label="Secondary Nominee" value={intimation.secondaryNominee.nomineeName} />
                  <AdminDetailRow label="Secondary Relationship" value={intimation.secondaryNominee.relationship} />
                </>
              )}
            </AdminDetailCard>

            <AdminDetailCard title="Death Information" icon={AlertCircle} tone="rose">
              <AdminDetailRow label="Date of Death" value={intimation.dateOfDeath} />
              <AdminDetailRow label="Place of Death" value={intimation.placeOfDeath} />
              {intimation.causeOfDeath && (
                <AdminDetailRow label="Cause of Death" value={intimation.causeOfDeath} />
              )}
              <AdminDetailRow label="Remarks" value={intimation.remarks || '—'} />
            </AdminDetailCard>
          </AdminDetailGrid>

          {intimation.verificationNotes && (
            <AdminTextBlock
              title="Verification Notes"
              content={intimation.verificationNotes}
              icon={MessageSquare}
              tone="amber"
            />
          )}

          {intimation.excessPension && (
            <Card className="admin-card border-rose-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <IndianRupee className="size-4 text-rose-600" />
                  Excess Pension Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Excess Amount</p>
                    <p className="text-2xl font-bold text-rose-600">
                      {formatDemiseCurrency(intimation.excessPension.totalExcessAmount)}
                    </p>
                  </div>
                  {intimation.excessPension.excessCaseId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Excess Case</p>
                      <p className="font-mono text-sm font-medium">{intimation.excessPension.excessCaseId}</p>
                    </div>
                  )}
                  {intimation.excessPension.recoveryCaseId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Recovery Case</p>
                      <Button
                        variant="link"
                        className="h-auto p-0 font-mono text-sm"
                        onClick={() => navigate({ href: `/admin/recovery/cases/${intimation.excessPension?.recoveryCaseId}` })}
                      >
                        {intimation.excessPension.recoveryCaseId}
                      </Button>
                    </div>
                  )}
                </div>
                {intimation.excessPension.paymentsAfterDeath.length > 0 && (
                  <div className="rounded-xl border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="px-4 py-2 text-left font-medium">Month</th>
                          <th className="px-4 py-2 text-left font-medium">Paid Date</th>
                          <th className="px-4 py-2 text-right font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {intimation.excessPension.paymentsAfterDeath.map((p) => (
                          <tr key={p.month} className="border-b last:border-0">
                            <td className="px-4 py-2">{p.month}</td>
                            <td className="px-4 py-2">{p.paidDate}</td>
                            <td className="px-4 py-2 text-right">{formatDemiseCurrency(p.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {intimation.approvalHistory.length > 0 && (
            <Card className="admin-card">
              <CardHeader><CardTitle className="text-base">Approval History</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {intimation.approvalHistory.map((record, i) => (
                  <div key={i} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{record.action.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(record.timestamp), 'dd MMM yyyy')}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{record.remarks}</p>
                    <p className="mt-1 text-xs text-muted-foreground">By {record.actor}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {familyPension && (
            <Card className="admin-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Family Pension Application</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => navigate({ href: `${basePath}/family-pension/${familyPension.id}` })}
                >
                  View Application
                </Button>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div><p className="text-muted-foreground">Application ID</p><p className="font-mono font-medium">{familyPension.id}</p></div>
                <div><p className="text-muted-foreground">Status</p><FamilyPensionStatusBadge status={familyPension.status} /></div>
                <div><p className="text-muted-foreground">Nominee</p><p className="font-medium">{familyPension.nomineeName}</p></div>
                <div><p className="text-muted-foreground">Relationship</p><p className="font-medium">{familyPension.relationship}</p></div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Uploaded Documents</CardTitle></CardHeader>
            <CardContent>
              <DemiseDocumentPreview documents={intimation.documents} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <DemiseTimeline events={intimation.timeline} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Audit Trail</CardTitle></CardHeader>
            <CardContent>
              <DataTable columns={auditColumns} data={auditLogs ?? []} pageSize={10} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!verificationAction} onOpenChange={() => setVerificationAction(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {verificationAction === 'approve' && 'Approve Demise Intimation'}
              {verificationAction === 'reject' && 'Reject Demise Intimation'}
              {verificationAction === 'needs_clarification' && 'Request Clarification'}
              {verificationAction === 'reverse' && 'Reverse Demise Approval'}
            </DialogTitle>
          </DialogHeader>
          {verificationAction === 'approve' && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>Approving will change pension status to Deceased, stop payments, check excess pension, and may create a recovery case.</p>
            </div>
          )}
          <Form {...verificationForm}>
            <form
              onSubmit={verificationForm.handleSubmit(() => {
                if (verificationAction) verificationMutation.mutate(verificationAction)
              })}
              className="space-y-4"
            >
              <FormField
                control={verificationForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-xl" placeholder="Enter verification remarks..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setVerificationAction(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full" disabled={verificationMutation.isPending}>
                  Confirm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showFamilyPensionDialog} onOpenChange={setShowFamilyPensionDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <div className="flex flex-wrap items-start justify-between gap-2 pr-8">
              <DialogTitle>Initiate Family Pension</DialogTitle>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full"
                onClick={fillFamilyPensionDemo}
              >
                <Sparkles className="mr-1.5 size-3.5" /> Fill Demo Data
              </Button>
            </div>
          </DialogHeader>
          <Form {...familyPensionForm}>
            <form
              onSubmit={familyPensionForm.handleSubmit((values) => {
                familyPensionMutation.mutate({
                  demiseIntimationId: intimationId,
                  nomineeName: values.nomineeName,
                  relationship: values.relationship,
                  mobileNumber: values.mobileNumber,
                  address: values.address,
                  bankDetails: {
                    accountHolderName: values.accountHolderName,
                    bankName: values.bankName,
                    branchName: values.branchName,
                    accountNumber: values.accountNumber,
                    ifscCode: values.ifscCode,
                  },
                  documents: [
                    { type: 'identity_proof', name: 'Identity Proof', fileName: 'identity_proof.pdf', mandatory: true },
                    { type: 'legal_heir_certificate', name: 'Relationship Proof', fileName: 'relationship_proof.pdf', mandatory: true },
                  ],
                  submittedBy: user?.name ?? 'Pension Administrator',
                })
              })}
              className="space-y-3"
            >
              {([
                { name: 'nomineeName' as const, label: 'Nominee Name', multiline: false },
                { name: 'relationship' as const, label: 'Relationship', multiline: false },
                { name: 'mobileNumber' as const, label: 'Mobile Number', multiline: false },
                { name: 'address' as const, label: 'Address', multiline: true },
                { name: 'accountHolderName' as const, label: 'Account Holder Name', multiline: false },
                { name: 'bankName' as const, label: 'Bank Name', multiline: false },
                { name: 'branchName' as const, label: 'Branch Name', multiline: false },
                { name: 'accountNumber' as const, label: 'Account Number', multiline: false },
                { name: 'ifscCode' as const, label: 'IFSC Code', multiline: false },
              ]).map(({ name, label, multiline }) => (
                <FormField
                  key={name}
                  control={familyPensionForm.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        {multiline ? (
                          <Textarea {...field} className="rounded-xl" />
                        ) : (
                          <Input {...field} className="rounded-xl" />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowFamilyPensionDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full" disabled={familyPensionMutation.isPending}>
                  Initiate Application
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
