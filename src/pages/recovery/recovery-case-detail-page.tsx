import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  IndianRupee,
  RotateCcw,
  Send,
  Settings2,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  AdminActionBar,
  AdminDetailCard,
  AdminDetailGrid,
  AdminDetailHero,
  AdminDetailRow,
  AdminInstallmentProgress,
  AdminMetricGrid,
  AdminPageShell,
  AdminProcessStepper,
  AdminProgressCard,
  AdminWorkflowTimeline,
  PensionerAvatar,
  type WorkflowTimelineEvent,
} from '@/components/admin/shared/admin-detail-ui'
import { DataTable } from '@/components/admin/shared/data-table'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import showcaseRecoveryCases from '@/assets/showcase/showcase-recovery-cases.png'
import { InstallmentStatusBadge } from '@/components/recovery/installment-status-badge'
import { useRecoveryPortal } from '@/components/recovery/recovery-portal-context'
import { RecoveryStatusBadge } from '@/components/recovery/recovery-status-badge'
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
  closeRecoveryCaseApi,
  configureInstallmentsApi,
  fetchCalculationBreakdown,
  fetchRecoveryAuditLogs,
  fetchRecoveryCase,
  processRecoveryApprovalApi,
  recordRecoveryPaymentApi,
  submitRecoveryCaseApi,
} from '@/data/recovery-api'
import {
  approvalRemarksSchema,
  configureInstallmentsSchema,
  recordPaymentSchema,
  type ConfigureInstallmentsFormValues,
  type RecordPaymentFormValues,
} from '@/lib/recovery-schema'
import {
  formatRecoveryCurrency,
  PAYMENT_MODE_LABELS,
  RECOVERY_AUDIT_ACTION_LABELS,
  RECOVERY_FREQUENCY_LABELS,
  RECOVERY_REASON_LABELS,
  RECOVERY_TYPE_LABELS,
} from '@/lib/recovery'
import { useAuth } from '@/providers/auth-provider'
import type { CalculationBreakdownRow, RecoveryCaseStatus, RecoveryInstallment, RecoveryPayment } from '@/types/recovery'
import { format, parseISO } from 'date-fns'

const RECOVERY_WORKFLOW_STEPS = [
  { id: 'draft', label: 'Draft', description: 'Case created' },
  { id: 'approval', label: 'Approval', description: 'Pending review' },
  { id: 'approved', label: 'Approved', description: 'Schedule setup' },
  { id: 'active', label: 'Active Recovery', description: 'Installments' },
  { id: 'complete', label: 'Completed', description: 'Fully recovered' },
]

function recoveryStepIndex(status: RecoveryCaseStatus): number {
  switch (status) {
    case 'draft':
      return 1
    case 'pending_approval':
      return 2
    case 'approved':
      return 3
    case 'active_recovery':
      return 4
    case 'recovery_completed':
    case 'closed':
      return 5
    case 'cancelled':
      return 2
    default:
      return 1
  }
}

const TIMELINE_TONES: Record<string, WorkflowTimelineEvent['tone']> = {
  case_created: 'slate',
  case_submitted: 'blue',
  case_approved: 'green',
  case_rejected: 'rose',
  installment_configured: 'violet',
  payment_recorded: 'green',
  status_changed: 'amber',
  recovery_completed: 'green',
  case_closed: 'slate',
}

interface RecoveryCaseDetailPageProps {
  caseId: string
}

export function RecoveryCaseDetailPage({ caseId }: RecoveryCaseDetailPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { basePath, permissions } = useRecoveryPortal()

  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  const [showInstallmentDialog, setShowInstallmentDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const { data: recoveryCase, isLoading } = useQuery({
    queryKey: ['recovery-case', caseId],
    queryFn: () => fetchRecoveryCase(caseId),
  })

  const { data: auditLogs } = useQuery({
    queryKey: ['recovery-audit', caseId],
    queryFn: () => fetchRecoveryAuditLogs(caseId),
    enabled: !!caseId,
  })

  const { data: breakdown } = useQuery({
    queryKey: ['recovery-breakdown', caseId],
    queryFn: () => fetchCalculationBreakdown(caseId),
    enabled: !!caseId,
  })

  const approvalForm = useForm({
    resolver: zodResolver(approvalRemarksSchema),
    defaultValues: { remarks: '' },
  })

  const installmentForm = useForm<ConfigureInstallmentsFormValues>({
    resolver: zodResolver(configureInstallmentsSchema),
    defaultValues: {
      installmentCount: 10,
      recoveryStartDate: new Date().toISOString().split('T')[0],
      paymentMode: 'pension_deduction',
      recoveryFrequency: 'monthly',
      autoGenerateSchedule: true,
    },
  })

  const paymentForm = useForm<RecordPaymentFormValues>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      installmentId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paidAmount: 0,
      paymentReference: '',
      paymentMode: 'pension_deduction',
      remarks: '',
    },
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['recovery-case', caseId] })
    queryClient.invalidateQueries({ queryKey: ['recovery-audit', caseId] })
    queryClient.invalidateQueries({ queryKey: ['recovery-breakdown', caseId] })
    queryClient.invalidateQueries({ queryKey: ['recovery-cases'] })
    queryClient.invalidateQueries({ queryKey: ['recovery-dashboard-stats'] })
    queryClient.invalidateQueries({ queryKey: ['pensioner-recovery'] })
  }

  const submitMutation = useMutation({
    mutationFn: () => submitRecoveryCaseApi(caseId, user?.name),
    onSuccess: () => {
      invalidateAll()
      toast.success('Case submitted for approval')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const approvalMutation = useMutation({
    mutationFn: ({ action, remarks }: { action: 'approve' | 'reject'; remarks: string }) =>
      processRecoveryApprovalApi(caseId, action, remarks, user?.name),
    onSuccess: (_, vars) => {
      invalidateAll()
      toast.success(vars.action === 'approve' ? 'Case approved' : 'Case rejected')
      setApprovalAction(null)
      approvalForm.reset()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const installmentMutation = useMutation({
    mutationFn: (values: ConfigureInstallmentsFormValues) =>
      configureInstallmentsApi({ recoveryCaseId: caseId, ...values }),
    onSuccess: () => {
      invalidateAll()
      toast.success('Installment schedule configured')
      setShowInstallmentDialog(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const paymentMutation = useMutation({
    mutationFn: (values: RecordPaymentFormValues) =>
      recordRecoveryPaymentApi({
        recoveryCaseId: caseId,
        ...values,
        recordedBy: user?.name,
      }),
    onSuccess: () => {
      invalidateAll()
      toast.success('Payment recorded')
      setShowPaymentDialog(false)
      paymentForm.reset()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const closeMutation = useMutation({
    mutationFn: () => closeRecoveryCaseApi(caseId, user?.name),
    onSuccess: () => {
      invalidateAll()
      toast.success('Case closed')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const breakdownColumns = useMemo<ColumnDef<CalculationBreakdownRow>[]>(
    () => [
      { accessorKey: 'period', header: 'Period' },
      {
        accessorKey: 'openingBalance',
        header: 'Opening Balance',
        cell: ({ row }) => formatRecoveryCurrency(row.original.openingBalance),
      },
      {
        accessorKey: 'installmentAmount',
        header: 'Installment',
        cell: ({ row }) => formatRecoveryCurrency(row.original.installmentAmount),
      },
      {
        accessorKey: 'recoveredAmount',
        header: 'Recovered',
        cell: ({ row }) => formatRecoveryCurrency(row.original.recoveredAmount),
      },
      {
        accessorKey: 'closingBalance',
        header: 'Closing Balance',
        cell: ({ row }) => formatRecoveryCurrency(row.original.closingBalance),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <InstallmentStatusBadge status={row.original.status} />,
      },
    ],
    [],
  )

  const installmentColumns = useMemo<ColumnDef<RecoveryInstallment>[]>(
    () => [
      { accessorKey: 'installmentNumber', header: '#' },
      { accessorKey: 'dueDate', header: 'Due Date' },
      {
        accessorKey: 'installmentAmount',
        header: 'Amount',
        cell: ({ row }) => formatRecoveryCurrency(row.original.installmentAmount),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <InstallmentStatusBadge status={row.original.status} />,
      },
    ],
    [],
  )

  const paymentColumns = useMemo<ColumnDef<RecoveryPayment>[]>(
    () => [
      {
        accessorKey: 'installmentNumber',
        header: 'Installment',
        cell: ({ row }) => row.original.installmentNumber ?? '—',
      },
      { accessorKey: 'paymentDate', header: 'Paid Date' },
      {
        accessorKey: 'paidAmount',
        header: 'Paid Amount',
        cell: ({ row }) => formatRecoveryCurrency(row.original.paidAmount),
      },
      {
        accessorKey: 'paymentMode',
        header: 'Mode',
        cell: ({ row }) => PAYMENT_MODE_LABELS[row.original.paymentMode],
      },
      { accessorKey: 'paymentReference', header: 'Reference' },
    ],
    [],
  )

  if (isLoading || !recoveryCase) return <PageLoadingSkeleton />

  const calc = recoveryCase.calculation
  const paidInstallments = recoveryCase.installments.filter((i) => i.status === 'paid').length
  const remainingInstallments = recoveryCase.installments.filter(
    (i) => i.status === 'pending' || i.status === 'overdue' || i.status === 'partially_paid',
  ).length
  const progressPercent =
    calc.remainingAmount > 0
      ? Math.min(100, Math.round((calc.recoveredAmount / calc.remainingAmount) * 100))
      : 0

  const timelineEvents: WorkflowTimelineEvent[] = recoveryCase.timeline.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    actor: event.actor,
    timestamp: format(parseISO(event.timestamp), 'dd MMM yyyy, hh:mm a'),
    tone: TIMELINE_TONES[event.status] ?? 'slate',
  }))

  return (
    <AdminPageShell>
      <AdminDetailHero
        avatar={<PensionerAvatar name={recoveryCase.pensionerName} ppo={recoveryCase.ppoNumber} />}
        title={recoveryCase.id}
        subtitle={`${recoveryCase.pensionerName} · ${recoveryCase.ppoNumber}`}
        badges={<RecoveryStatusBadge status={recoveryCase.status} />}
        actions={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/cases` })}>
            <ArrowLeft className="size-4" /> Back to Cases
          </Button>
        }
        illustration={
          <div className="mt-5 overflow-hidden rounded-xl border border-border/50">
            <img
              src={showcaseRecoveryCases}
              alt="Recovery case management"
              className="h-24 w-full object-cover object-top opacity-90"
            />
          </div>
        }
      />

      <AdminProcessStepper
        steps={RECOVERY_WORKFLOW_STEPS}
        currentStep={recoveryStepIndex(recoveryCase.status)}
      />

      {!permissions.viewOnly && (
        <AdminActionBar>
          {recoveryCase.status === 'draft' && permissions.canSubmit && (
            <Button className="rounded-full" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
              <Send className="size-4" /> Submit for Approval
            </Button>
          )}
          {recoveryCase.status === 'pending_approval' && permissions.canApprove && (
            <>
              <Button className="rounded-full" onClick={() => setApprovalAction('approve')}>
                <CheckCircle2 className="size-4" /> Approve
              </Button>
              <Button className="rounded-full" variant="destructive" onClick={() => setApprovalAction('reject')}>
                <XCircle className="size-4" /> Reject
              </Button>
            </>
          )}
          {['approved', 'active_recovery'].includes(recoveryCase.status) && permissions.canConfigureInstallments && (
            <Button className="rounded-full" variant="outline" onClick={() => setShowInstallmentDialog(true)}>
              <Settings2 className="size-4" /> Configure Installments
            </Button>
          )}
          {recoveryCase.status === 'active_recovery' && permissions.canRecordPayment && (
            <Button className="rounded-full" onClick={() => setShowPaymentDialog(true)}>
              <IndianRupee className="size-4" /> Record Payment
            </Button>
          )}
          {recoveryCase.status === 'recovery_completed' && permissions.canClose && (
            <Button className="rounded-full" variant="secondary" onClick={() => closeMutation.mutate()}>
              <RotateCcw className="size-4" /> Close Case
            </Button>
          )}
        </AdminActionBar>
      )}

      {permissions.viewOnly && recoveryCase.status === 'active_recovery' && permissions.canRecordPayment && (
        <AdminActionBar>
          <Button className="rounded-full" onClick={() => setShowPaymentDialog(true)}>
            <IndianRupee className="size-4" /> Record Payment
          </Button>
        </AdminActionBar>
      )}

      <AdminMetricGrid
        metrics={[
          { label: 'Total Recovery', value: formatRecoveryCurrency(calc.remainingAmount), icon: IndianRupee, tone: 'blue' },
          { label: 'Recovered', value: formatRecoveryCurrency(calc.recoveredAmount), icon: CheckCircle2, tone: 'green' },
          { label: 'Outstanding', value: formatRecoveryCurrency(calc.outstandingBalance), icon: RotateCcw, tone: 'amber' },
          {
            label: 'Installments',
            value: `${paidInstallments} / ${recoveryCase.installments.length || calc.installmentCount}`,
            icon: Settings2,
            tone: 'violet',
          },
        ]}
      />

      <AdminProgressCard
        title="Recovery Progress"
        percent={progressPercent}
        footer={
          calc.expectedCompletionDate
            ? `Expected completion: ${calc.expectedCompletionDate}${remainingInstallments > 0 ? ` · ${remainingInstallments} installments remaining` : ''}`
            : undefined
        }
      >
        <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Recovered: <strong className="text-foreground">{formatRecoveryCurrency(calc.recoveredAmount)}</strong>
          </span>
          <span>
            Outstanding: <strong className="text-foreground">{formatRecoveryCurrency(calc.outstandingBalance)}</strong>
          </span>
        </div>
        {recoveryCase.installments.length > 0 && (
          <AdminInstallmentProgress
            paidCount={paidInstallments}
            totalCount={recoveryCase.installments.length}
            className="mt-2 border-0 bg-transparent p-0"
          />
        )}
      </AdminProgressCard>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="calculation" className="rounded-lg">Calculation</TabsTrigger>
          <TabsTrigger value="installments" className="rounded-lg">Installments</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg">Payment Ledger</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-lg">Timeline</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminDetailGrid>
            <AdminDetailCard title="Recovery Case Information" icon={FileText} tone="blue">
              <AdminDetailRow label="Case ID" value={recoveryCase.id} mono />
              <AdminDetailRow label="Excess Case" value={recoveryCase.excessCaseId} mono />
              <AdminDetailRow label="Recovery Type" value={RECOVERY_TYPE_LABELS[recoveryCase.recoveryType]} />
              <AdminDetailRow label="Recovery Reason" value={RECOVERY_REASON_LABELS[recoveryCase.recoveryReason]} />
              <AdminDetailRow label="Start Date" value={recoveryCase.recoveryStartDate} />
              <AdminDetailRow label="Created By" value={recoveryCase.createdBy} />
              <AdminDetailRow label="Created Date" value={recoveryCase.createdAt} />
              {recoveryCase.approvedBy && (
                <AdminDetailRow label="Approved By" value={recoveryCase.approvedBy} />
              )}
            </AdminDetailCard>

            <AdminDetailCard title="Pensioner Information" icon={IndianRupee} tone="violet">
              <AdminDetailRow label="PPO Number" value={recoveryCase.ppoNumber} mono />
              <AdminDetailRow label="Name" value={recoveryCase.pensionerName} />
              <AdminDetailRow label="Pension Type" value={recoveryCase.pensionType} />
              <AdminDetailRow label="Department" value={recoveryCase.department} />
            </AdminDetailCard>
          </AdminDetailGrid>

          {recoveryCase.remarks && (
            <AdminDetailCard title="Remarks" icon={FileText} tone="slate" className="mt-5">
              <p className="text-sm text-muted-foreground">{recoveryCase.remarks}</p>
            </AdminDetailCard>
          )}
        </TabsContent>

        <TabsContent value="calculation">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">Calculation Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Total Excess</p>
                  <p className="font-semibold">{formatRecoveryCurrency(calc.totalExcessAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Arrear Adjustment</p>
                  <p className="font-semibold">{formatRecoveryCurrency(calc.arrearAdjustment)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Installment Amount</p>
                  <p className="font-semibold">{formatRecoveryCurrency(calc.installmentAmount)}</p>
                </div>
              </div>
              <DataTable columns={breakdownColumns} data={breakdown ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="installments">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">Installment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {recoveryCase.installmentConfig && (
                <div className="mb-4 grid gap-2 rounded-xl border border-border/50 bg-muted/20 p-4 text-sm sm:grid-cols-2">
                  <AdminDetailRow label="Count" value={String(recoveryCase.installmentConfig.installmentCount)} />
                  <AdminDetailRow
                    label="Frequency"
                    value={RECOVERY_FREQUENCY_LABELS[recoveryCase.installmentConfig.recoveryFrequency]}
                  />
                  <AdminDetailRow
                    label="Payment Mode"
                    value={PAYMENT_MODE_LABELS[recoveryCase.installmentConfig.paymentMode]}
                  />
                  <AdminDetailRow label="Start Date" value={recoveryCase.installmentConfig.recoveryStartDate} />
                </div>
              )}
              {recoveryCase.installments.length > 0 ? (
                <DataTable columns={installmentColumns} data={recoveryCase.installments} />
              ) : (
                <p className="text-sm text-muted-foreground">No installments configured yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="admin-card">
            <CardHeader><CardTitle className="text-base">Payment Ledger</CardTitle></CardHeader>
            <CardContent>
              {recoveryCase.payments.length > 0 ? (
                <DataTable columns={paymentColumns} data={recoveryCase.payments} />
              ) : (
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <AdminDetailCard title="Recovery Timeline" icon={RotateCcw} tone="amber">
            <AdminWorkflowTimeline events={timelineEvents} />
          </AdminDetailCard>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="admin-card" id="audit-log">
            <CardHeader><CardTitle className="text-base">Audit Trail</CardTitle></CardHeader>
            <CardContent>
              {auditLogs && auditLogs.length > 0 ? (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border px-4 py-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium">{RECOVERY_AUDIT_ACTION_LABELS[log.action] ?? log.action}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(log.timestamp), 'dd MMM yyyy, hh:mm a')}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{log.user}</p>
                      {(log.oldValue || log.newValue) && (
                        <p className="mt-1 text-xs">
                          {log.oldValue && <span className="text-muted-foreground">{log.oldValue} → </span>}
                          {log.newValue && <span className="font-medium">{log.newValue}</span>}
                        </p>
                      )}
                      {log.remarks && <p className="mt-1 text-xs text-muted-foreground">{log.remarks}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No audit entries for this case yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!approvalAction} onOpenChange={() => setApprovalAction(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{approvalAction === 'approve' ? 'Approve Recovery Case' : 'Reject Recovery Case'}</DialogTitle>
          </DialogHeader>
          <Form {...approvalForm}>
            <form
              onSubmit={approvalForm.handleSubmit((values) => {
                if (!approvalAction) return
                approvalMutation.mutate({ action: approvalAction, remarks: values.remarks })
              })}
            >
              <FormField
                control={approvalForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-24 rounded-lg" placeholder="Enter approval remarks..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setApprovalAction(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full" disabled={approvalMutation.isPending}>
                  Confirm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showInstallmentDialog} onOpenChange={setShowInstallmentDialog}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Configure Installments</DialogTitle>
          </DialogHeader>
          <Form {...installmentForm}>
            <form onSubmit={installmentForm.handleSubmit((v) => installmentMutation.mutate(v))} className="space-y-4">
              <FormField
                control={installmentForm.control}
                name="installmentCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installment Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-lg"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={installmentForm.control}
                name="recoveryStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Start Date</FormLabel>
                    <FormControl><Input type="date" className="rounded-lg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={installmentForm.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Mode</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {Object.entries(PAYMENT_MODE_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={installmentForm.control}
                name="recoveryFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recovery Frequency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {Object.entries(RECOVERY_FREQUENCY_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="rounded-full" disabled={installmentMutation.isPending}>
                  Generate Schedule
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit((v) => paymentMutation.mutate(v))} className="space-y-4">
              <FormField
                control={paymentForm.control}
                name="installmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installment (optional)</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select installment" /></SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {recoveryCase.installments
                          .filter((i) => i.status !== 'paid')
                          .map((inst) => (
                            <SelectItem key={inst.id} value={inst.id}>
                              #{inst.installmentNumber} — {inst.dueDate} ({formatRecoveryCurrency(inst.installmentAmount)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl><Input type="date" className="rounded-lg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paidAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paid Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="rounded-lg"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paymentReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Reference</FormLabel>
                    <FormControl><Input className="rounded-lg" placeholder="DD-2026-01-001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Mode</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {Object.entries(PAYMENT_MODE_LABELS).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={paymentForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl><Textarea className="rounded-lg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" className="rounded-full" disabled={paymentMutation.isPending}>
                  Record Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
