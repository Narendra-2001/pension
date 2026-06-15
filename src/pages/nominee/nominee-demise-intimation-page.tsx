import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  History,
  PenLine,
  Upload,
  User,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { DemiseStatusBadge } from '@/components/demise/demise-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useIsMobile } from '@/hooks/use-mobile'
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
import { Textarea } from '@/components/ui/textarea'
import { fetchDemiseIntimationsByPpo, submitDemiseIntimationApi } from '@/data/demise-api'
import { NOMINEE_RELATIONSHIP_OPTIONS } from '@/lib/demise'
import { invalidateDemiseWorkflowQueries } from '@/lib/demise-queries'
import { demiseIntimationSchema } from '@/lib/demise-schema'
import type { DemiseIntimationFormValues } from '@/lib/demise-schema'
import { getNomineeSession } from '@/lib/nominee-auth'
import { cn } from '@/lib/utils'
import type { DemiseIntimation } from '@/types/demise'

type ActiveTab = 'form' | 'history'

const PROCESS_STEPS = [
  { icon: PenLine, label: 'Submit', desc: 'Fill intimation form' },
  { icon: Clock, label: 'Verify', desc: 'Admin review' },
  { icon: CheckCircle2, label: 'Process', desc: 'Family pension' },
]

function FormSection({
  number,
  title,
  description,
  icon: Icon,
  children,
  delay = 0,
}: {
  number: number
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group rounded-2xl border border-border/60 bg-muted/20 p-4 transition-all duration-300 hover:border-icy-blue-200/60 hover:bg-icy-blue-50/30 hover:shadow-sm dark:hover:border-icy-blue-900/40 dark:hover:bg-icy-blue-950/20 sm:p-5"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-icy-blue-500 to-icy-blue-600 text-sm font-bold text-white shadow-sm shadow-icy-blue-500/25 transition-transform duration-300 group-hover:scale-105">
          {number}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-icy-blue-500" />
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  )
}

export function NomineeDemiseIntimationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = getNomineeSession()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState<ActiveTab>('form')
  const [justSubmitted, setJustSubmitted] = useState(false)

  useEffect(() => {
    if (!session) navigate({ to: '/nominee/login' })
  }, [session, navigate])

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['nominee-demise', session?.ppoNumber],
    queryFn: () => fetchDemiseIntimationsByPpo(session!.ppoNumber),
    enabled: !!session?.ppoNumber,
  })

  const form = useForm<DemiseIntimationFormValues>({
    resolver: zodResolver(demiseIntimationSchema),
    defaultValues: {
      ppoNumber: session?.ppoNumber ?? '',
      nomineeName: session?.nomineeName ?? '',
      nomineeRelationship: 'Son',
      nomineeMobile: session?.nomineeMobile ?? '',
      dateOfDeath: '',
      placeOfDeath: '',
      causeOfDeath: '',
      remarks: '',
      declarationAccepted: false,
    },
  })

  const submitMutation = useMutation({
    mutationFn: submitDemiseIntimationApi,
    onSuccess: (result) => {
      invalidateDemiseWorkflowQueries(queryClient)
      queryClient.invalidateQueries({ queryKey: ['nominee-demise'] })
      toast.success('Demise intimation submitted', {
        description: `${result.id} is pending verification. Pension remains active until approved.`,
      })
      form.reset({
        ppoNumber: session?.ppoNumber ?? '',
        nomineeName: session?.nomineeName ?? '',
        nomineeRelationship: 'Son',
        nomineeMobile: session?.nomineeMobile ?? '',
        dateOfDeath: '',
        placeOfDeath: '',
        causeOfDeath: '',
        remarks: '',
        declarationAccepted: false,
      })
      setJustSubmitted(true)
      setActiveTab('history')
      setTimeout(() => setJustSubmitted(false), 4000)
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!session) return
    submitMutation.mutate({
      pensionerId: session.pensionerId,
      ppoNumber: values.ppoNumber,
      pensionerName: session.pensionerName,
      nominee: {
        nomineeName: values.nomineeName,
        relationship: values.nomineeRelationship,
        mobileNumber: values.nomineeMobile,
        priority: 'primary',
      },
      dateOfDeath: values.dateOfDeath,
      placeOfDeath: values.placeOfDeath,
      causeOfDeath: values.causeOfDeath,
      remarks: values.remarks ?? '',
      declarationAccepted: values.declarationAccepted,
      documents: [
        {
          type: 'death_certificate',
          name: 'Death Certificate',
          fileName: 'death_certificate_upload.pdf',
          mandatory: true,
        },
      ],
      submittedBy: 'nominee',
    })
  })

  const historyColumns = useMemo<ColumnDef<DemiseIntimation>[]>(
    () => [
      { accessorKey: 'id', header: 'Intimation ID' },
      { accessorKey: 'dateOfDeath', header: 'Date of Death' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <DemiseStatusBadge status={row.original.status} />,
      },
      { accessorKey: 'submittedAt', header: 'Submitted' },
    ],
    [],
  )

  if (!session) return null

  const pendingCount = history?.filter((h) => h.status === 'under_verification' || h.status === 'submitted').length ?? 0

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="nominee-frame nominee-glow relative overflow-hidden rounded-3xl bg-gradient-to-br from-icy-blue-50/90 via-card/80 to-card/80 p-5 backdrop-blur-xl dark:from-icy-blue-950/40 dark:via-card/60 dark:to-card/60 sm:p-7 lg:p-8"
      >
        {/* decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-icy-blue-300/20 blur-3xl dark:bg-icy-blue-700/15" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Verified Nominee
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Demise Intimation
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Reporting for{' '}
              <strong className="text-foreground">{session.pensionerName}</strong>
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:w-auto lg:min-w-[20rem]">
            <div className="nominee-frame rounded-2xl bg-card/70 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">PPO Number</p>
              <p className="mt-0.5 truncate font-mono text-sm font-semibold">{session.ppoNumber}</p>
            </div>
            <div className="nominee-frame rounded-2xl bg-card/70 px-4 py-3 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nominee</p>
              <p className="mt-0.5 truncate text-sm font-semibold">{session.nomineeName}</p>
            </div>
          </div>
        </div>

        {/* Process timeline */}
        <div className="relative mt-7">
          {/* connector line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-4 hidden h-0.5 bg-gradient-to-r from-icy-blue-400/40 via-icy-blue-300/30 to-transparent sm:block" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {PROCESS_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.12 }}
                className="relative flex items-center gap-3 rounded-2xl border border-border/40 bg-background/70 px-3 py-3 backdrop-blur-sm sm:flex-col sm:items-start sm:px-4 sm:py-4"
              >
                <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-icy-blue-500 to-icy-blue-600 text-white shadow-sm shadow-icy-blue-500/25">
                  <step.icon className="size-4" />
                </div>
                <div className="min-w-0 sm:mt-2">
                  <p className="text-xs font-semibold sm:text-sm">{step.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground sm:text-xs">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Warning banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="nominee-section-enter-delay-1"
      >
        <Card className="border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium">Important — Pension payments continue</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700/90 dark:text-amber-300/90">
                Submitting this form does <strong>not</strong> stop pension payments. Every demise
                report is verified by Pension Admin before any status changes occur.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success flash after submit */}
      <AnimatePresence>
        {justSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl border border-emerald-200/60 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Intimation submitted successfully! Track its status in the History tab.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab switcher */}
      <div className="nominee-section-enter-delay-2 flex gap-1 rounded-2xl border border-border/60 bg-muted/30 p-1.5 backdrop-blur-sm">
        {([
          { id: 'form' as const, label: 'New Intimation', icon: PenLine },
          { id: 'history' as const, label: 'Submission History', icon: History, badge: history?.length },
        ]).map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 sm:gap-2 sm:px-4',
                isActive ? 'text-icy-blue-700 dark:text-icy-blue-300' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nominee-tab-pill"
                  className="absolute inset-0 rounded-xl bg-background shadow-sm ring-1 ring-icy-blue-200/60 dark:ring-icy-blue-900/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-1.5 sm:gap-2">
                <tab.icon className="size-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
                {tab.badge != null && tab.badge > 0 && (
                  <span className="rounded-full bg-icy-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-icy-blue-600 dark:bg-icy-blue-950/50 dark:text-icy-blue-400">
                    {tab.badge}
                  </span>
                )}
              </span>
              {tab.id === 'history' && pendingCount > 0 && !isActive && (
                <span className="absolute right-1 top-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-background" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="nominee-frame nominee-glow w-full min-w-0 overflow-hidden rounded-3xl border-0 bg-card/80 backdrop-blur-xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <Form {...form}>
                  <form onSubmit={onSubmit} className="space-y-5 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 xl:gap-8">
                    <div className="space-y-5 lg:col-span-1">
                    <FormSection
                      number={1}
                      title="Nominee Details"
                      description="Your identity as registered nominee"
                      icon={User}
                      delay={0}
                    >
                      <FormField
                        control={form.control}
                        name="ppoNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PPO Number</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly className="rounded-xl bg-muted/60" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="nomineeName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nominee Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nomineeRelationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-xl">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {NOMINEE_RELATIONSHIP_OPTIONS.map((r) => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="nomineeMobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nominee Mobile</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-xl" maxLength={10} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </FormSection>

                    <FormSection
                      number={2}
                      title="Death Details"
                      description="Date, place and cause of demise"
                      icon={Calendar}
                      delay={0.05}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="dateOfDeath"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Death</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="placeOfDeath"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Place of Death</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="City, State" className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="causeOfDeath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cause of Death (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} className="rounded-xl" placeholder="If known" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </FormSection>
                    </div>

                    <div className="space-y-5 lg:col-span-1">
                    <FormSection
                      number={3}
                      title="Documents & Remarks"
                      description="Upload supporting documents"
                      icon={Upload}
                      delay={0.1}
                    >
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          Death Certificate
                          <span className="rounded bg-icy-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-icy-blue-600 dark:bg-icy-blue-950/50 dark:text-icy-blue-400">
                            Mandatory
                          </span>
                        </FormLabel>
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            className="rounded-xl file:mr-3 file:rounded-lg file:border-0 file:bg-icy-blue-100 file:px-3 file:py-1 file:text-xs file:font-medium file:text-icy-blue-600 dark:file:bg-icy-blue-950/50 dark:file:text-icy-blue-400"
                          />
                        </div>
                      </FormItem>
                      <FormItem>
                        <FormLabel>Supporting Documents (Optional)</FormLabel>
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.png"
                          multiple
                          className="rounded-xl file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium"
                        />
                      </FormItem>
                      <FormField
                        control={form.control}
                        name="remarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                className="rounded-xl"
                                placeholder="Any additional information you'd like to provide..."
                                rows={3}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </FormSection>

                    <FormSection
                      number={4}
                      title="Legal Declaration"
                      description="Confirm accuracy of information"
                      icon={FileText}
                      delay={0.15}
                    >
                      <FormField
                        control={form.control}
                        name="declarationAccepted"
                        render={({ field }) => (
                          <FormItem className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="mt-0.5"
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="font-normal leading-snug">
                                I hereby declare that the information provided is true and correct.
                                I understand that false reporting is a punishable offence under
                                applicable laws.
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </FormSection>
                    </div>

                    <motion.div
                      className="lg:col-span-2"
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <Button
                        type="submit"
                        className="nominee-cta w-full rounded-xl bg-gradient-to-r from-icy-blue-500 to-indigo-600 py-5 text-base font-semibold shadow-lg shadow-icy-blue-500/25 hover:from-icy-blue-600 hover:to-indigo-700 disabled:shadow-none"
                        disabled={submitMutation.isPending}
                      >
                        {submitMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              className="size-4 rounded-full border-2 border-white/30 border-t-white"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                            Submitting...
                          </span>
                        ) : (
                          'Submit Demise Intimation'
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="nominee-frame nominee-glow w-full min-w-0 overflow-hidden rounded-3xl border-0 bg-card/80 backdrop-blur-xl">
              <div className="border-b border-border/40 p-4 sm:p-6 lg:p-8 lg:pb-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-semibold">Your Submissions</h2>
                    <p className="text-xs text-muted-foreground">
                      Track the status of all demise intimations for this PPO
                    </p>
                  </div>
                  {pendingCount > 0 && (
                    <span className="w-fit shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      {pendingCount} pending review
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full min-w-0">
                {historyLoading ? (
                  <div className="space-y-3 p-4 sm:p-6 lg:p-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse rounded-xl bg-muted/60"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                ) : history?.length ? (
                  <div className="w-full min-w-0 px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
                    <DataListView
                      className="w-full min-w-0"
                      columns={historyColumns}
                      data={history}
                      pageSize={5}
                      viewMode={isMobile ? 'card' : 'table'}
                      showViewToggle={false}
                      renderCard={(item, serialNo) => (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: serialNo * 0.05 }}
                        >
                          <ListRecordCard
                            serialNo={serialNo}
                            title={item.id}
                            subtitle={item.dateOfDeath}
                            badges={<DemiseStatusBadge status={item.status} />}
                            fields={[
                              { label: 'Submitted', value: item.submittedAt },
                              { label: 'Place', value: item.placeOfDeath },
                            ]}
                          />
                        </motion.div>
                      )}
                    />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mx-4 mb-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 text-center sm:mx-6 sm:mb-6 lg:mx-8 lg:mb-8"
                  >
                    <History className="mb-3 size-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">No submissions yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submit your first demise intimation using the form tab
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-full"
                      onClick={() => setActiveTab('form')}
                    >
                      <PenLine className="mr-1.5 size-3.5" />
                      Go to Form
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
