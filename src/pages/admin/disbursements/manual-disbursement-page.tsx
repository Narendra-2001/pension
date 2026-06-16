import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  Minus,
  PenLine,
  Upload,
  User,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PensionerSearchCombobox } from '@/components/communication/pensioner-search-combobox'
import {
  AdminDetailCard,
  AdminDetailRow,
  AdminPageShell,
  AdminDetailHero,
  AdminProcessStepper,
  PensionerAvatar,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { createManualDisbursement, fetchPensionerById } from '@/data/admin-api'
import { fetchPensionerOptions } from '@/data/communication-api'
import { formatCurrency } from '@/data/pensioner-mock-data'
import {
  buildPaymentMonthOptions,
  manualDisbursementSchema,
  type ManualDisbursementFormValues,
} from '@/lib/disbursement-schema'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'

const MANUAL_PAYMENT_STEPS = [
  { id: 'pensioner', label: 'Pensioner', description: 'Select recipient' },
  { id: 'amounts', label: 'Amounts', description: 'Verify payment' },
  { id: 'bank', label: 'Bank Credit', description: 'UTR & date' },
  { id: 'post', label: 'Post', description: 'Submit entry' },
]

const STATUS_OPTIONS = [
  {
    value: 'paid' as const,
    label: 'Paid',
    description: 'Credited to bank account',
    icon: CheckCircle2,
    tone: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
  },
  {
    value: 'pending' as const,
    label: 'Pending',
    description: 'Awaiting NEFT confirmation',
    icon: Clock,
    tone: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
  },
  {
    value: 'failed' as const,
    label: 'Failed',
    description: 'Credit rejected by bank',
    icon: XCircle,
    tone: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800',
  },
]

function AmountInput({
  value,
  onChange,
  className,
}: {
  value: number
  onChange: (value: number) => void
  className?: string
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        ₹
      </span>
      <Input
        type="number"
        min={0}
        step="1"
        className={cn('pl-7 tabular-nums', className)}
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber || 0)}
      />
    </div>
  )
}

function PaymentBreakdown({
  gross,
  recovery,
  deductions,
  net,
}: {
  gross: number
  recovery: number
  deductions: number
  net: number
}) {
  const rows = [
    { label: 'Gross Pension', value: gross, tone: 'text-foreground' },
    { label: 'Recovery', value: recovery, tone: 'text-amber-600', prefix: '−' },
    { label: 'Deductions', value: deductions, tone: 'text-rose-600', prefix: '−' },
  ]

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{row.label}</span>
          <span className={cn('font-medium tabular-nums', row.tone)}>
            {row.prefix ? `${row.prefix} ` : ''}
            {formatCurrency(row.value)}
          </span>
        </div>
      ))}
      <Separator className="my-3" />
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Net Credit</span>
        <span className="text-lg font-bold tabular-nums text-primary">{formatCurrency(net)}</span>
      </div>
    </div>
  )
}

function pensionerFullName(personal: { firstName: string; middleName?: string; lastName: string }) {
  return [personal.firstName, personal.middleName, personal.lastName].filter(Boolean).join(' ')
}

export function ManualDisbursementPage() {
  const { user } = useAuth()
  const monthOptions = useMemo(() => buildPaymentMonthOptions(), [])

  const { data: pensionerOptions, isLoading: loadingOptions } = useQuery({
    queryKey: ['pensioner-options'],
    queryFn: fetchPensionerOptions,
  })

  const form = useForm<ManualDisbursementFormValues>({
    resolver: zodResolver(manualDisbursementSchema),
    defaultValues: {
      pensionerId: '',
      paymentMonth: monthOptions[0] ?? '',
      grossPension: 0,
      recoveryAmount: 0,
      deductions: 0,
      netPension: 0,
      utrReference: '',
      creditDate: new Date().toISOString().split('T')[0],
      status: 'paid',
      remarks: '',
    },
  })

  const pensionerId = form.watch('pensionerId')
  const paymentMonth = form.watch('paymentMonth')
  const grossPension = form.watch('grossPension')
  const recoveryAmount = form.watch('recoveryAmount')
  const deductions = form.watch('deductions')
  const netPension = form.watch('netPension')
  const utrReference = form.watch('utrReference')
  const creditDate = form.watch('creditDate')
  const status = form.watch('status')

  const { data: selectedPensioner } = useQuery({
    queryKey: ['admin-pensioner-for-disbursement', pensionerId],
    queryFn: () => fetchPensionerById(pensionerId),
    enabled: !!pensionerId,
  })

  useEffect(() => {
    if (!selectedPensioner) return
    const gross = selectedPensioner.pension.grossPension
    const recovery = selectedPensioner.pension.recoveryDeduction
    const tax = selectedPensioner.pension.taxDeduction
    form.setValue('grossPension', gross)
    form.setValue('recoveryAmount', recovery)
    form.setValue('deductions', tax)
    form.setValue('netPension', gross - recovery - tax)
  }, [selectedPensioner, form])

  useEffect(() => {
    const gross = Number(grossPension) || 0
    const recovery = Number(recoveryAmount) || 0
    const tax = Number(deductions) || 0
    form.setValue('netPension', Math.max(0, gross - recovery - tax))
  }, [grossPension, recoveryAmount, deductions, form])

  const currentStep = useMemo(() => {
    if (!pensionerId) return 1
    if (!utrReference.trim()) return 2
    if (!creditDate) return 3
    return 4
  }, [pensionerId, utrReference, creditDate])

  const mutation = useMutation({
    mutationFn: createManualDisbursement,
    onSuccess: (result) => {
      toast.success('Monthly payment posted', {
        description: `Net credit of ${formatCurrency(result.netPension)} recorded successfully.`,
      })
      form.reset({
        pensionerId: '',
        paymentMonth: monthOptions[0] ?? '',
        grossPension: 0,
        recoveryAmount: 0,
        deductions: 0,
        netPension: 0,
        utrReference: '',
        creditDate: new Date().toISOString().split('T')[0],
        status: 'paid',
        remarks: '',
      })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      ...values,
      recordedBy: user?.name ?? 'Pension Administrator',
    })
  })

  if (loadingOptions) return <PageLoadingSkeleton />

  const maskedAccount = selectedPensioner
    ? `•••• ${selectedPensioner.bank.accountNumber.slice(-4)}`
    : null

  return (
    <AdminPageShell>
      <AdminDetailHero
        title="Manual Payment Entry"
        subtitle="Post a monthly pension credit for a single pensioner"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-full" asChild>
              <Link to="/admin/disbursements/bulk">
                <Upload className="size-4" /> Bulk Upload
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/admin/dashboard">
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
          </div>
        }
      />

      <AdminProcessStepper steps={MANUAL_PAYMENT_STEPS} currentStep={currentStep} />

      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminDetailCard title="Pensioner & Period" icon={User} tone="blue">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="pensionerId"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Pensioner</FormLabel>
                      <FormControl>
                        <PensionerSearchCombobox
                          options={pensionerOptions ?? []}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>Search by name, PPO number, or mobile</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Month</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {monthOptions.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <AnimatePresence>
                {selectedPensioner && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 flex items-start gap-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                      <PensionerAvatar
                        name={pensionerFullName(selectedPensioner.personal)}
                        ppo={selectedPensioner.service.ppoNumber}
                        gender={selectedPensioner.personal.gender}
                        className="size-12 sm:size-14"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{pensionerFullName(selectedPensioner.personal)}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {selectedPensioner.service.ppoNumber}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedPensioner.service.department}
                          </Badge>
                          <Badge variant="outline" className="capitalize text-xs">
                            {selectedPensioner.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </AdminDetailCard>

            <AdminDetailCard
              title="Payment Amounts"
              icon={Banknote}
              tone="green"
            >
              <p className="text-sm text-muted-foreground">
                Amounts pre-fill from the pensioner profile — adjust if needed for this month.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="grossPension"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gross Pension</FormLabel>
                      <FormControl>
                        <AmountInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recoveryAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery</FormLabel>
                      <FormControl>
                        <AmountInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deductions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deductions</FormLabel>
                      <FormControl>
                        <AmountInput value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netPension"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Pension</FormLabel>
                      <FormControl>
                        <AmountInput
                          value={field.value}
                          onChange={field.onChange}
                          className="border-primary/30 bg-primary/5 font-semibold"
                        />
                      </FormControl>
                      <FormDescription>Auto-calculated: gross − recovery − deductions</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:hidden">
                <PaymentBreakdown
                  gross={Number(grossPension) || 0}
                  recovery={Number(recoveryAmount) || 0}
                  deductions={Number(deductions) || 0}
                  net={Number(netPension) || 0}
                />
              </div>
            </AdminDetailCard>

            <AdminDetailCard title="Bank Credit Details" icon={Building2} tone="violet">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="utrReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UTR / NEFT Reference</FormLabel>
                      <FormControl>
                        <Input placeholder="NEFT20260701001" className="rounded-lg font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="creditDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="rounded-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Status</FormLabel>
                    <FormControl>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {STATUS_OPTIONS.map((option) => {
                          const Icon = option.icon
                          const isSelected = field.value === option.value
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.onChange(option.value)}
                              className={cn(
                                'flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200',
                                isSelected
                                  ? cn(option.tone, 'ring-2 ring-primary/20')
                                  : 'border-border/60 bg-card hover:border-primary/25 hover:bg-muted/30',
                              )}
                            >
                              <Icon className={cn('size-5', isSelected ? '' : 'text-muted-foreground')} />
                              <div>
                                <p className="text-sm font-semibold">{option.label}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Arrears adjustment included in gross amount"
                        className="min-h-[88px] rounded-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AdminDetailCard>

            <div className="flex justify-end gap-3 lg:hidden">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => form.reset()}>
                Clear
              </Button>
              <Button type="submit" className="rounded-full" disabled={mutation.isPending}>
                <IndianRupee className="size-4" />
                {mutation.isPending ? 'Posting...' : 'Post Payment'}
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="admin-card rounded-2xl border border-border/60 bg-card p-5"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <PenLine className="size-4" />
                  </div>
                  <h3 className="font-semibold">Payment Summary</h3>
                </div>

                {selectedPensioner ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <PensionerAvatar
                        name={pensionerFullName(selectedPensioner.personal)}
                        ppo={selectedPensioner.service.ppoNumber}
                        gender={selectedPensioner.personal.gender}
                        className="size-10"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {pensionerFullName(selectedPensioner.personal)}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {selectedPensioner.service.ppoNumber}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <PaymentBreakdown
                      gross={Number(grossPension) || 0}
                      recovery={Number(recoveryAmount) || 0}
                      deductions={Number(deductions) || 0}
                      net={Number(netPension) || 0}
                    />

                    <Separator />

                    <div className="space-y-2">
                      <AdminDetailRow label="Payment Month" value={paymentMonth} />
                      <AdminDetailRow
                        label="Credit Date"
                        value={
                          creditDate
                            ? new Date(creditDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'
                        }
                      />
                      <AdminDetailRow
                        label="UTR Reference"
                        value={utrReference || '—'}
                        mono
                      />
                      <AdminDetailRow
                        label="Status"
                        value={
                          <Badge variant="outline" className="capitalize">
                            {status}
                          </Badge>
                        }
                      />
                      {maskedAccount && (
                        <AdminDetailRow
                          label="Bank Account"
                          value={`${selectedPensioner.bank.bankName} ${maskedAccount}`}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col items-center py-6 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                      <User className="size-7 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm font-medium">No pensioner selected</p>
                    <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
                      Choose a pensioner to see payment breakdown and bank details
                    </p>
                  </div>
                )}
              </motion.div>

              <div className="admin-card rounded-2xl border border-border/60 bg-card p-4">
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Before you post</p>
                    <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Minus className="mt-0.5 size-3 shrink-0" />
                        Verify amounts match the monthly disbursement register
                      </li>
                      <li className="flex items-start gap-2">
                        <Minus className="mt-0.5 size-3 shrink-0" />
                        Confirm UTR matches the bank NEFT statement
                      </li>
                      <li className="flex items-start gap-2">
                        <Minus className="mt-0.5 size-3 shrink-0" />
                        Duplicate month entries will be flagged in reports
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full rounded-full" disabled={mutation.isPending}>
                  <IndianRupee className="size-4" />
                  {mutation.isPending ? 'Posting...' : 'Post Payment'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full"
                  onClick={() => form.reset()}
                >
                  Clear Form
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </AdminPageShell>
  )
}
