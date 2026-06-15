import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  FileUp,
  Headphones,
  MessageSquare,
  Phone,
  Send,
  Shield,
  Upload,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  adminStaggerItem,
  AdminSectionHeading,
} from '@/components/admin/shared/admin-analytics-ui'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import {
  PensionerPageShell,
  PensionerStatCard,
} from '@/components/pensioner/shared/pensioner-page-ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { createGrievanceTicketApi } from '@/data/grievance-api'
import { fetchPensionerProfile } from '@/data/pensioner-api'
import { GRIEVANCE_CATEGORIES, GRIEVANCE_PRIORITIES } from '@/lib/grievance'
import { createGrievanceSchema, type CreateGrievanceFormValues } from '@/lib/grievance-schema'
import { useAuth } from '@/providers/auth-provider'
import type { GrievanceCategory } from '@/types/grievance'
import { cn } from '@/lib/utils'

const priorityColors = {
  low: 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40',
  medium: 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30',
  high: 'border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/30',
  critical: 'border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30',
} as const

export function RaiseTicketPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const pensionerId = user?.pensionerId ?? ''
  const [attachmentNames, setAttachmentNames] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['pensioner-profile', pensionerId],
    queryFn: () => fetchPensionerProfile(pensionerId),
    enabled: !!pensionerId,
  })

  const form = useForm<CreateGrievanceFormValues>({
    resolver: zodResolver(createGrievanceSchema),
    defaultValues: {
      category: '',
      priority: 'medium',
      subject: '',
      description: '',
      contactNumber: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: createGrievanceTicketApi,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['pensioner-grievances'] })
      toast.success(`Ticket ${ticket.id} raised successfully`)
      navigate({ href: `/pensioner/grievance/${ticket.id}` })
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setAttachmentNames(files.map((f) => f.name))
  }

  const onSubmit = form.handleSubmit((values) => {
    if (!profile || !user) return
    createMutation.mutate({
      pensionerId,
      ppoNumber: profile.service.ppoNumber,
      pensionerName: user.name,
      contactNumber: values.contactNumber,
      category: values.category as GrievanceCategory,
      priority: values.priority,
      subject: values.subject,
      description: values.description,
      attachmentNames,
    })
  })

  const selectedPriority = form.watch('priority')

  if (isLoading || !profile) return <PageLoadingSkeleton />

  return (
    <PensionerPageShell>
      <motion.div variants={adminStaggerItem}>
        <PageHeader
          title="Raise Ticket"
          description="Submit a complaint or support request — our helpdesk team will respond promptly"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <motion.div variants={adminStaggerItem}>
            <Card className="admin-card overflow-hidden border-primary/10">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"
                  >
                    <Headphones className="size-5" />
                  </motion.div>
                  <div>
                    <p className="font-semibold">Helpdesk Support</p>
                    <p className="text-xs text-muted-foreground">Average response within 2 business days</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {[
                    'Describe your issue clearly with relevant details',
                    'Attach supporting documents if available',
                    'Keep your contact number updated for callbacks',
                    'Track ticket status from My Tickets section',
                  ].map((tip, i) => (
                    <motion.div
                      key={tip}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.06 }}
                      className="flex items-start gap-2"
                    >
                      <Shield className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      <span>{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <PensionerStatCard
            label="PPO Number"
            value={profile.service.ppoNumber}
            icon={MessageSquare}
            tone="blue"
            delay={0.1}
          />
          <PensionerStatCard
            label="Pensioner Name"
            value={user?.name ?? '—'}
            icon={User}
            tone="violet"
            delay={0.14}
          />
          <PensionerStatCard
            label="Ticket ID"
            value="Auto-generated on submit"
            icon={AlertCircle}
            tone="teal"
            delay={0.18}
          />
        </div>

        <motion.div variants={adminStaggerItem} className="lg:col-span-3">
          <Card className="admin-card overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <AdminSectionHeading
                title="New Grievance Ticket"
                description="Fill in the details below to raise your support request"
              />

              <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select issue type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRIEVANCE_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  'rounded-xl transition-colors',
                                  priorityColors[field.value as keyof typeof priorityColors],
                                )}
                              >
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRIEVANCE_PRIORITIES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  {p.label}
                                </SelectItem>
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
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Brief summary of your issue"
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Describe your issue in detail — include dates, amounts, or reference numbers if applicable..."
                            className="min-h-[140px] rounded-xl resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Attachments (Supporting Documents)</FormLabel>
                    <motion.div
                      animate={{
                        borderColor: dragOver ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: dragOver ? 'rgba(59,130,246,0.04)' : 'transparent',
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDragOver(true)
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setDragOver(false)
                        const files = Array.from(e.dataTransfer.files)
                        setAttachmentNames(files.map((f) => f.name))
                      }}
                      className="rounded-2xl border-2 border-dashed p-6 text-center transition-colors"
                    >
                      <Upload className="mx-auto mb-2 size-8 text-muted-foreground/60" />
                      <p className="text-sm font-medium">Drop files here or browse</p>
                      <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG up to 5 MB each</p>
                      <Input
                        type="file"
                        multiple
                        className="mt-3 rounded-xl"
                        onChange={handleFileChange}
                      />
                      <AnimatePresence>
                        {attachmentNames.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 flex flex-wrap justify-center gap-2"
                          >
                            {attachmentNames.map((name) => (
                              <motion.span
                                key={name}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                              >
                                <FileUp className="size-3" />
                                {name}
                              </motion.span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </FormItem>

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Phone className="size-3.5" />
                          Contact Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Mobile number for updates"
                            className="rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      type="submit"
                      className="w-full rounded-xl py-5 text-base font-semibold shadow-md"
                      disabled={createMutation.isPending}
                    >
                      <Send className="mr-2 size-4" />
                      {createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                      {selectedPriority === 'critical' && !createMutation.isPending && (
                        <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">Critical</span>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PensionerPageShell>
  )
}
