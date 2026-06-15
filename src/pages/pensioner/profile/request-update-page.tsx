import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  FileUp,
  Fingerprint,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Send,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import {
  adminStaggerContainer,
  adminStaggerItem,
  AdminSectionHeading,
} from '@/components/admin/shared/admin-analytics-ui'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ProfileSubNav } from '@/components/pensioner/profile/profile-sub-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { fetchPensionerProfile } from '@/data/pensioner-api'
import { submitProfileUpdateRequest } from '@/data/profile-update-api'
import { formatFileSize } from '@/lib/documents'
import { isImageFile, isPdfFile } from '@/lib/file-utils'
import {
  getCurrentValueForType,
  REQUEST_TYPE_LABELS,
  REQUEST_TYPE_OPTIONS,
} from '@/lib/profile-update'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/auth-provider'
import type { ProfileUpdateRequestType } from '@/types/profile-update-request'

const baseSchema = z.object({
  requestType: z.string().min(1, 'Select request type'),
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
})

type FormValues = z.infer<typeof baseSchema> & Record<string, string>

type RequestTone = 'blue' | 'green' | 'amber' | 'rose' | 'violet' | 'teal'

const REQUEST_TYPE_META: Record<
  ProfileUpdateRequestType,
  { icon: LucideIcon; tone: RequestTone; description: string }
> = {
  personal_details: {
    icon: User,
    tone: 'blue',
    description: 'Mobile, email, or alternate contact',
  },
  address: {
    icon: MapPin,
    tone: 'green',
    description: 'Residential address change',
  },
  bank_details: {
    icon: CreditCard,
    tone: 'amber',
    description: 'Pension credit account details',
  },
  nominee_details: {
    icon: Users,
    tone: 'rose',
    description: 'Nominee name and relationship',
  },
  aadhaar: {
    icon: Fingerprint,
    tone: 'violet',
    description: 'Aadhaar number correction',
  },
  pan: {
    icon: FileText,
    tone: 'teal',
    description: 'PAN number correction',
  },
}

const TONE_STYLES: Record<
  RequestTone,
  { card: string; icon: string; ring: string; sheet: SheetToneStyles }
> = {
  blue: {
    card: 'hover:border-sky-200/70 hover:bg-sky-50/50 dark:hover:border-sky-900/50 dark:hover:bg-sky-950/20',
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    ring: 'ring-sky-500/40 border-sky-300/70 bg-sky-50/60 dark:border-sky-800/60 dark:bg-sky-950/30',
    sheet: {
      border: 'border-l-sky-500',
      header: 'from-sky-500/12 via-sky-500/5 to-background',
      glow: 'bg-sky-400/20 dark:bg-sky-600/10',
      badge: 'border-sky-200/60 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300',
      section: 'border-sky-200/50 bg-gradient-to-br from-sky-50/80 via-card to-card dark:border-sky-900/40 dark:from-sky-950/20',
      sectionMuted: 'border-amber-200/50 bg-gradient-to-br from-amber-50/70 via-card to-card dark:border-amber-900/40 dark:from-amber-950/20',
    },
  },
  green: {
    card: 'hover:border-emerald-200/70 hover:bg-emerald-50/50 dark:hover:border-emerald-900/50 dark:hover:bg-emerald-950/20',
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    ring: 'ring-emerald-500/40 border-emerald-300/70 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/30',
    sheet: {
      border: 'border-l-emerald-500',
      header: 'from-emerald-500/12 via-emerald-500/5 to-background',
      glow: 'bg-emerald-400/20 dark:bg-emerald-600/10',
      badge: 'border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300',
      section: 'border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 via-card to-card dark:border-emerald-900/40 dark:from-emerald-950/20',
      sectionMuted: 'border-amber-200/50 bg-gradient-to-br from-amber-50/70 via-card to-card dark:border-amber-900/40 dark:from-amber-950/20',
    },
  },
  amber: {
    card: 'hover:border-amber-200/70 hover:bg-amber-50/50 dark:hover:border-amber-900/50 dark:hover:bg-amber-950/20',
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    ring: 'ring-amber-500/40 border-amber-300/70 bg-amber-50/60 dark:border-amber-800/60 dark:bg-amber-950/30',
    sheet: {
      border: 'border-l-amber-500',
      header: 'from-amber-500/12 via-amber-500/5 to-background',
      glow: 'bg-amber-400/20 dark:bg-amber-600/10',
      badge: 'border-amber-200/60 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300',
      section: 'border-amber-200/50 bg-gradient-to-br from-amber-50/80 via-card to-card dark:border-amber-900/40 dark:from-amber-950/20',
      sectionMuted: 'border-amber-200/50 bg-gradient-to-br from-amber-50/70 via-card to-card dark:border-amber-900/40 dark:from-amber-950/20',
    },
  },
  rose: {
    card: 'hover:border-rose-200/70 hover:bg-rose-50/50 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/20',
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    ring: 'ring-rose-500/40 border-rose-300/70 bg-rose-50/60 dark:border-rose-800/60 dark:bg-rose-950/30',
    sheet: {
      border: 'border-l-rose-500',
      header: 'from-rose-500/12 via-rose-500/5 to-background',
      glow: 'bg-rose-400/20 dark:bg-rose-600/10',
      badge: 'border-rose-200/60 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300',
      section: 'border-rose-200/50 bg-gradient-to-br from-rose-50/80 via-card to-card dark:border-rose-900/40 dark:from-rose-950/20',
      sectionMuted: 'border-amber-200/50 bg-gradient-to-br from-amber-50/70 via-card to-card dark:border-amber-900/40 dark:from-amber-950/20',
    },
  },
  violet: {
    card: 'hover:border-violet-200/70 hover:bg-violet-50/50 dark:hover:border-violet-900/50 dark:hover:bg-violet-950/20',
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400',
    ring: 'ring-violet-500/40 border-violet-300/70 bg-violet-50/60 dark:border-violet-800/60 dark:bg-violet-950/30',
    sheet: {
      border: 'border-l-violet-500',
      header: 'from-violet-500/12 via-violet-500/5 to-background',
      glow: 'bg-violet-400/20 dark:bg-violet-600/10',
      badge: 'border-violet-200/60 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300',
      section: 'border-violet-200/50 bg-gradient-to-br from-violet-50/80 via-card to-card dark:border-violet-900/40 dark:from-violet-950/20',
      sectionMuted: 'border-amber-200/50 bg-gradient-to-br from-amber-50/70 via-card to-card dark:border-amber-900/40 dark:from-amber-950/20',
    },
  },
  teal: {
    card: 'hover:border-teal-200/70 hover:bg-teal-50/50 dark:hover:border-teal-900/50 dark:hover:bg-teal-950/20',
    icon: 'bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
    ring: 'ring-teal-500/40 border-teal-300/70 bg-teal-50/60 dark:border-teal-800/60 dark:bg-teal-950/30',
    sheet: {
      border: 'border-l-teal-500',
      header: 'from-teal-500/12 via-teal-500/5 to-background',
      glow: 'bg-teal-400/20 dark:bg-teal-600/10',
      badge: 'border-teal-200/60 bg-teal-50 text-teal-700 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-300',
      section: 'border-teal-200/50 bg-gradient-to-br from-teal-50/80 via-card to-card dark:border-teal-900/40 dark:from-teal-950/20',
      sectionMuted: 'border-amber-200/50 bg-gradient-to-br from-amber-50/70 via-card to-card dark:border-amber-900/40 dark:from-amber-950/20',
    },
  },
}

interface SheetToneStyles {
  border: string
  header: string
  glow: string
  badge: string
  section: string
  sectionMuted: string
}

const ADDRESS_FIELDS = [
  { name: 'houseNumber', label: 'House No.' },
  { name: 'street', label: 'Street' },
  { name: 'villageCity', label: 'City / Village' },
  { name: 'district', label: 'District' },
  { name: 'state', label: 'State' },
  { name: 'pincode', label: 'Pincode' },
] as const

const BANK_FIELDS = [
  { name: 'bankName', label: 'Bank Name' },
  { name: 'branchName', label: 'Branch Name' },
  { name: 'accountNumber', label: 'Account Number' },
  { name: 'ifscCode', label: 'IFSC Code' },
  { name: 'accountHolderName', label: 'Account Holder' },
] as const

const PROCESS_STEPS = [
  { step: 1, label: 'Choose update type', icon: FileText },
  { step: 2, label: 'Enter new details', icon: Pencil },
  { step: 3, label: 'Admin review', icon: ShieldCheck },
]

function buildPayload(type: ProfileUpdateRequestType, values: FormValues): Record<string, string> {
  switch (type) {
    case 'personal_details':
      return {
        mobileNumber: values.mobileNumber ?? '',
        emailAddress: values.emailAddress ?? '',
        alternateMobile: values.alternateMobile ?? '',
      }
    case 'address':
      return {
        houseNumber: values.houseNumber ?? '',
        street: values.street ?? '',
        villageCity: values.villageCity ?? '',
        district: values.district ?? '',
        state: values.state ?? '',
        pincode: values.pincode ?? '',
      }
    case 'bank_details':
      return {
        bankName: values.bankName ?? '',
        branchName: values.branchName ?? '',
        accountNumber: values.accountNumber ?? '',
        ifscCode: values.ifscCode ?? '',
        accountHolderName: values.accountHolderName ?? '',
      }
    case 'nominee_details':
      return {
        nomineeName: values.nomineeName ?? '',
        relationship: values.relationship ?? '',
        mobileNumber: values.nomineeMobile ?? '',
        aadhaarNumber: values.nomineeAadhaar ?? '',
        percentageShare: values.percentageShare ?? '100',
      }
    case 'aadhaar':
      return { aadhaarNumber: values.aadhaarNumber ?? '' }
    case 'pan':
      return { panNumber: values.panNumber ?? '' }
    default:
      return {}
  }
}

function FormFieldGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>
}

function AnimatedFormSection({
  requestType,
  children,
}: {
  requestType: ProfileUpdateRequestType | ''
  children: ReactNode
}) {
  if (!requestType) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={requestType}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

function SheetFormSection({
  step,
  title,
  description,
  icon: Icon,
  iconClassName,
  className,
  children,
}: {
  step: string
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/40 bg-card/90 px-4 py-3.5 backdrop-blur-sm">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/40 font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
          {step}
        </span>
        <div
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm',
            iconClassName,
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function CurrentValuePanel({ value }: { value: string }) {
  const lines = value.split('\n').filter(Boolean)

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        const separatorIndex = line.indexOf(':')
        const hasLabel = separatorIndex > 0
        const label = hasLabel ? line.slice(0, separatorIndex).trim() : `Field ${index + 1}`
        const content = hasLabel ? line.slice(separatorIndex + 1).trim() : line

        return (
          <div
            key={`${label}-${index}`}
            className="rounded-xl border border-dashed border-border/50 bg-background/70 px-3.5 py-2.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 font-mono text-sm font-medium text-foreground">{content}</p>
          </div>
        )
      })}
    </div>
  )
}

const sheetInputClassName =
  'rounded-xl border-border/60 bg-background/80 shadow-sm transition-shadow focus-visible:shadow-md'

type UploadedSupportingFile = {
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  previewUrl?: string
}

export function RequestUpdatePage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [currentValue, setCurrentValue] = useState('')
  const [uploadedFile, setUploadedFile] = useState<UploadedSupportingFile | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data: record, isLoading } = useQuery({
    queryKey: ['pensioner-profile', pensionerId],
    queryFn: () => fetchPensionerProfile(pensionerId),
    enabled: !!pensionerId,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { requestType: '', reason: '' },
  })

  const requestType = form.watch('requestType') as ProfileUpdateRequestType | ''
  const reasonValue = form.watch('reason') ?? ''
  const selectedMeta = requestType ? REQUEST_TYPE_META[requestType] : null

  useEffect(() => {
    if (record && requestType) {
      setCurrentValue(getCurrentValueForType(record, requestType as ProfileUpdateRequestType))
    }
  }, [record, requestType])

  useEffect(() => {
    return () => {
      if (uploadedFile?.previewUrl) URL.revokeObjectURL(uploadedFile.previewUrl)
    }
  }, [uploadedFile?.previewUrl])

  const mutation = useMutation({
    mutationFn: submitProfileUpdateRequest,
    onSuccess: (req) => {
      queryClient.invalidateQueries({ queryKey: ['pensioner-profile-requests'] })
      toast.success('Profile update request submitted', {
        description: `Request ID: ${req.id}. Status: Pending Review`,
      })
      navigate({ to: '/pensioner/profile/requests' })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!record || !values.requestType) return
    const type = values.requestType as ProfileUpdateRequestType
    const payload = buildPayload(type, values)
    mutation.mutate({
      pensionerId,
      requestType: type,
      updatePayload: payload,
      reason: values.reason,
      documents: uploadedFile
        ? [
            {
              name: uploadedFile.name,
              fileName: uploadedFile.fileName,
              fileSize: uploadedFile.fileSize,
              mimeType: uploadedFile.mimeType,
            },
          ]
        : [],
    })
  })

  const handleSelectType = (type: ProfileUpdateRequestType) => {
    form.setValue('requestType', type, { shouldValidate: true })
    setSheetOpen(true)
  }

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open)
  }

  const handleFileChange = (file: File | undefined) => {
    if (!file) return

    if (uploadedFile?.previewUrl) URL.revokeObjectURL(uploadedFile.previewUrl)

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    setUploadedFile({
      name: 'Supporting Document',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
      previewUrl,
    })
  }

  const clearUploadedFile = () => {
    if (uploadedFile?.previewUrl) URL.revokeObjectURL(uploadedFile.previewUrl)
    setUploadedFile(null)
  }

  if (isLoading || !record) return <PageLoadingSkeleton />

  return (
    <motion.div
      className="admin-dashboard-page"
      variants={adminStaggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={adminStaggerItem}>
        <PageHeader
          variant="admin"
          title="Request Profile Update"
          description="Submit a change request for admin verification and approval"
          actions={
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/pensioner/profile/requests">
                <ClipboardList className="size-4" />
                My Requests
              </Link>
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={adminStaggerItem}>
        <ProfileSubNav activePath="/pensioner/profile/request" />
      </motion.div>

      <motion.div
        variants={adminStaggerItem}
        className="admin-hero-metric mb-8 overflow-hidden p-0"
      >
        <div className="grid gap-0 sm:grid-cols-3">
          {PROCESS_STEPS.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + index * 0.06, duration: 0.35 }}
              className={cn(
                'relative flex items-center gap-3 border-b border-border/50 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0',
                requestType && item.step <= 2 && 'bg-primary/[0.03]',
                sheetOpen && item.step === 2 && 'bg-primary/[0.06]',
              )}
            >
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                  requestType && item.step <= 2
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted/60 text-muted-foreground',
                )}
              >
                <item.icon className="size-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Step {item.step}
                </p>
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
              </div>
              {requestType && item.step === 1 && (
                <CheckCircle2 className="ml-auto size-4 text-emerald-500" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Form {...form}>
        <form id="profile-update-form" onSubmit={onSubmit}>
          <motion.div variants={adminStaggerItem} className="mb-8">
            <AdminSectionHeading
              title="What would you like to update?"
              description="Select a category to open the update form in the side panel"
            />
            <FormField
              control={form.control}
              name="requestType"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {REQUEST_TYPE_OPTIONS.map((opt, index) => {
                      const meta = REQUEST_TYPE_META[opt.value]
                      const styles = TONE_STYLES[meta.tone]
                      const isSelected = field.value === opt.value
                      const Icon = meta.icon

                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.04, duration: 0.35 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectType(opt.value)}
                          className={cn(
                            'admin-card group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200',
                            styles.card,
                            isSelected && cn('ring-2', styles.ring),
                          )}
                        >
                          <div
                            className={cn(
                              'flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105',
                              styles.icon,
                            )}
                          >
                            <Icon className="size-4" strokeWidth={1.75} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                              {meta.description}
                            </p>
                          </div>
                          {isSelected && (
                            <motion.span
                              layoutId="request-type-selected"
                              className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                            >
                              <CheckCircle2 className="size-3" />
                            </motion.span>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                  <FormMessage className="mt-3" />
                </FormItem>
              )}
            />
          </motion.div>

          <Sheet open={sheetOpen && !!requestType} onOpenChange={handleSheetOpenChange}>
            <SheetContent
              side="right"
              className={cn(
                'flex w-full flex-col gap-0 overflow-hidden border-l-4 p-0 shadow-2xl sm:max-w-xl md:max-w-2xl',
                selectedMeta && TONE_STYLES[selectedMeta.tone].sheet.border,
              )}
            >
              {requestType && selectedMeta && (
                <>
                  <SheetHeader
                    className={cn(
                      'relative shrink-0 overflow-hidden border-b border-border/50 px-6 py-6 text-left',
                      `bg-gradient-to-br ${TONE_STYLES[selectedMeta.tone].sheet.header}`,
                    )}
                  >
                    <div
                      className={cn(
                        'pointer-events-none absolute -right-10 -top-10 size-40 rounded-full blur-3xl',
                        TONE_STYLES[selectedMeta.tone].sheet.glow,
                      )}
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
                      aria-hidden
                    />
                    <div className="relative flex items-start gap-4 pr-10">
                      <div
                        className={cn(
                          'flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/40 shadow-md',
                          TONE_STYLES[selectedMeta.tone].icon,
                        )}
                      >
                        <selectedMeta.icon className="size-5" strokeWidth={1.75} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              TONE_STYLES[selectedMeta.tone].sheet.badge,
                            )}
                          >
                            Step 2 of 3
                          </Badge>
                          <Badge variant="secondary" className="rounded-full text-[10px] font-medium">
                            Admin review required
                          </Badge>
                        </div>
                        <SheetTitle className="text-xl font-bold tracking-tight">
                          {REQUEST_TYPE_LABELS[requestType]}
                        </SheetTitle>
                        <SheetDescription className="mt-1 text-sm leading-relaxed">
                          {selectedMeta.description}. Your current record is shown below for reference.
                        </SheetDescription>
                      </div>
                    </div>
                  </SheetHeader>

                  <div className="relative min-h-0 flex-1 overflow-y-auto bg-muted/15 px-6 py-6">
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/80 to-transparent"
                      aria-hidden
                    />
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={requestType}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="relative space-y-5"
                      >
                        <SheetFormSection
                          step="01"
                          title="Current on record"
                          description="Read-only snapshot from your pension profile"
                          icon={Lock}
                          iconClassName="bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          className={TONE_STYLES[selectedMeta.tone].sheet.sectionMuted}
                        >
                          <CurrentValuePanel value={currentValue} />
                        </SheetFormSection>

                        <SheetFormSection
                          step="02"
                          title="New details"
                          description="Enter the updated information you want on record"
                          icon={selectedMeta.icon}
                          iconClassName={TONE_STYLES[selectedMeta.tone].icon}
                          className={TONE_STYLES[selectedMeta.tone].sheet.section}
                        >
                          <AnimatedFormSection requestType={requestType}>
                            {requestType === 'personal_details' && (
                              <FormFieldGrid>
                                <FormField
                                  control={form.control}
                                  name="mobileNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>New Mobile</FormLabel>
                                      <FormControl>
                                        <Input {...field} className={sheetInputClassName} placeholder="10-digit mobile" />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="emailAddress"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>New Email</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="email" className={sheetInputClassName} placeholder="you@email.com" />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="alternateMobile"
                                  render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                      <FormLabel>Alternate Mobile (optional)</FormLabel>
                                      <FormControl>
                                        <Input {...field} className={sheetInputClassName} placeholder="Alternate contact number" />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </FormFieldGrid>
                            )}

                            {requestType === 'address' && (
                              <FormFieldGrid>
                                {ADDRESS_FIELDS.map((f) => (
                                  <FormField
                                    key={f.name}
                                    control={form.control}
                                    name={f.name}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{f.label}</FormLabel>
                                        <FormControl>
                                          <Input {...field} className={sheetInputClassName} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </FormFieldGrid>
                            )}

                            {requestType === 'bank_details' && (
                              <FormFieldGrid>
                                {BANK_FIELDS.map((f) => (
                                  <FormField
                                    key={f.name}
                                    control={form.control}
                                    name={f.name}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>{f.label}</FormLabel>
                                        <FormControl>
                                          <Input {...field} className={sheetInputClassName} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </FormFieldGrid>
                            )}

                            {requestType === 'nominee_details' && (
                              <FormFieldGrid>
                                <FormField
                                  control={form.control}
                                  name="nomineeName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Nominee Name</FormLabel>
                                      <FormControl>
                                        <Input {...field} className={sheetInputClassName} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="relationship"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Relationship</FormLabel>
                                      <FormControl>
                                        <Input {...field} className={sheetInputClassName} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="nomineeMobile"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Mobile</FormLabel>
                                      <FormControl>
                                        <Input {...field} className={sheetInputClassName} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="nomineeAadhaar"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Aadhaar</FormLabel>
                                      <FormControl>
                                        <Input {...field} className={sheetInputClassName} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </FormFieldGrid>
                            )}

                            {requestType === 'aadhaar' && (
                              <FormField
                                control={form.control}
                                name="aadhaarNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Aadhaar Number</FormLabel>
                                    <FormControl>
                                      <Input {...field} className={cn(sheetInputClassName, 'font-mono')} placeholder="XXXX XXXX XXXX" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )}

                            {requestType === 'pan' && (
                              <FormField
                                control={form.control}
                                name="panNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New PAN Number</FormLabel>
                                    <FormControl>
                                      <Input {...field} className={cn(sheetInputClassName, 'font-mono uppercase')} placeholder="ABCDE1234F" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            )}
                          </AnimatedFormSection>
                        </SheetFormSection>

                        <SheetFormSection
                          step="03"
                          title="Justification & documents"
                          description="Explain the change and attach proof if available"
                          icon={FileUp}
                          iconClassName="bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
                          className="border-border/60 bg-gradient-to-br from-card via-card to-muted/20"
                        >
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="reason"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between gap-2">
                                    <FormLabel>Reason for change</FormLabel>
                                    <span
                                      className={cn(
                                        'rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums',
                                        reasonValue.length >= 20
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                          : 'bg-muted text-muted-foreground',
                                      )}
                                    >
                                      {reasonValue.length}/20 min
                                    </span>
                                  </div>
                                  <FormControl>
                                    <Textarea
                                      {...field}
                                      className={cn(sheetInputClassName, 'min-h-[110px] resize-none')}
                                      placeholder="Explain why this change is required — include reference numbers if applicable..."
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormItem>
                              <FormLabel>Supporting documents</FormLabel>
                              <label
                                className={cn(
                                  'group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed px-4 py-5 transition-all duration-300',
                                  'border-border/60 bg-background/70 hover:border-primary/30 hover:bg-primary/[0.03]',
                                  uploadedFile &&
                                    'border-emerald-300/70 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20',
                                )}
                              >
                                <div
                                  className={cn(
                                    'flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105',
                                    uploadedFile
                                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                      : 'bg-muted/70 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary',
                                  )}
                                >
                                  {uploadedFile ? (
                                    <CheckCircle2 className="size-5" />
                                  ) : (
                                    <FileUp className="size-5" strokeWidth={1.75} />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                  <p className="text-sm font-semibold text-foreground">
                                    {uploadedFile ? 'Document attached' : 'Upload supporting document'}
                                  </p>
                                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                    {uploadedFile
                                      ? `${uploadedFile.fileName} · ${formatFileSize(uploadedFile.fileSize)}`
                                      : 'PDF, JPG, or PNG — optional but recommended'}
                                  </p>
                                </div>
                                <Input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="sr-only"
                                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                                />
                              </label>

                              <AnimatePresence>
                                {uploadedFile && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                          {uploadedFile.previewUrl && isImageFile(uploadedFile.fileName, uploadedFile.mimeType) ? (
                                            <img
                                              src={uploadedFile.previewUrl}
                                              alt={uploadedFile.fileName}
                                              className="mb-3 max-h-36 w-full rounded-xl border border-border/50 object-contain"
                                            />
                                          ) : isPdfFile(uploadedFile.fileName, uploadedFile.mimeType) ? (
                                            <div className="mb-3 flex items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-4">
                                              <FileText className="size-8 text-red-600" />
                                              <div>
                                                <p className="text-sm font-medium">PDF attached</p>
                                                <p className="text-xs text-muted-foreground">Visible in request after submit</p>
                                              </div>
                                            </div>
                                          ) : null}
                                          <p className="text-xs text-muted-foreground">
                                            This document will be visible in your request details after submission.
                                          </p>
                                        </div>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="shrink-0 rounded-full"
                                          onClick={clearUploadedFile}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </FormItem>

                            <div className="flex items-start gap-3 rounded-xl border border-emerald-200/50 bg-emerald-50/40 px-3.5 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <p className="text-xs leading-relaxed text-emerald-900/80 dark:text-emerald-200/80">
                                Changes are applied only after admin verification and approval. You can track status under My Requests.
                              </p>
                            </div>
                          </div>
                        </SheetFormSection>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <SheetFooter className="shrink-0 border-t border-border/50 bg-card/95 px-6 py-4 backdrop-blur-md">
                    <div className="grid w-full gap-2 sm:grid-cols-[1fr_1.4fr]">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl"
                        onClick={() => setSheetOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        form="profile-update-form"
                        className="h-11 rounded-xl shadow-sm"
                        size="lg"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            Submit Request
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </SheetFooter>
                </>
              )}
            </SheetContent>
          </Sheet>
        </form>
      </Form>
    </motion.div>
  )
}
