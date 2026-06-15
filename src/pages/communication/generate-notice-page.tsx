import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FileText, Send, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
  AdminDetailCard,
  AdminDetailHero,
  AdminDetailRow,
  AdminIllustrationPanel,
  AdminPageShell,
  AdminProcessStepper,
  PensionerAvatar,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { useCommunicationPortal } from '@/components/communication/communication-portal-context'
import { PensionerSearchCombobox } from '@/components/communication/pensioner-search-combobox'
import featureNotifications from '@/assets/features/feature-notifications.png'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  createNoticeApi,
  fetchPensionerOptions,
  fetchTemplates,
} from '@/data/communication-api'
import { generateNoticeSchema, type GenerateNoticeFormValues } from '@/lib/communication-schema'
import { NOTICE_TYPE_LABELS } from '@/lib/communication'
import { useAuth } from '@/providers/auth-provider'
import type { NoticeAttachment, NoticeType } from '@/types/communication'

const NOTICE_STEPS = [
  { id: 'details', label: 'Notice Details', description: 'Type & pensioner' },
  { id: 'attachments', label: 'Attachments', description: 'Add files' },
  { id: 'generate', label: 'Generate', description: 'Review & send' },
]

function noticeFormStep(pensionerId: string, documentsCount: number): number {
  if (pensionerId && documentsCount > 0) return 3
  if (pensionerId) return 2
  return 1
}

export function GenerateNoticePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { basePath } = useCommunicationPortal()
  const [documents, setDocuments] = useState<NoticeAttachment[]>([])

  const { data: pensioners, isLoading: pensionersLoading } = useQuery({
    queryKey: ['pensioner-options'],
    queryFn: fetchPensionerOptions,
  })

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['notice-templates'],
    queryFn: () => fetchTemplates('notice'),
  })

  const form = useForm<GenerateNoticeFormValues>({
    resolver: zodResolver(generateNoticeSchema),
    defaultValues: {
      noticeType: 'life_certificate_reminder',
      templateId: '',
      pensionerId: '',
      amount: undefined,
      dueDate: '',
      remarks: '',
    },
  })

  const noticeType = form.watch('noticeType')
  const selectedPensionerId = form.watch('pensionerId')
  const selectedPensioner = pensioners?.find((p) => p.id === selectedPensionerId)

  const filteredTemplates = templates?.filter((t) => t.noticeType === noticeType) ?? []

  useEffect(() => {
    if (filteredTemplates.length && !form.getValues('templateId')) {
      form.setValue('templateId', filteredTemplates[0].id)
    }
  }, [noticeType, filteredTemplates, form])

  const createMutation = useMutation({
    mutationFn: (saveAsDraft: boolean) =>
      createNoticeApi({
        ...form.getValues(),
        attachments: documents,
        generatedBy: user?.name ?? 'Admin',
        saveAsDraft,
      }),
    onSuccess: (notice, saveAsDraft) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      queryClient.invalidateQueries({ queryKey: ['notice-dashboard-stats'] })
      toast.success(saveAsDraft ? 'Notice saved as draft' : 'Notice generated')
      navigate({ href: `${basePath}/notices/${notice.id}` })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleFileAdd = () => {
    const name = `Attachment ${documents.length + 1}`
    setDocuments((prev) => [...prev, { name, fileName: `notice_att_${Date.now()}.pdf` }])
  }

  const onSubmit = form.handleSubmit(() => {
    createMutation.mutate(false)
  })

  const onSaveDraft = () => {
    createMutation.mutate(true)
  }

  if (pensionersLoading || templatesLoading) return <PageLoadingSkeleton />

  return (
    <AdminPageShell>
      <AdminDetailHero
        title="Generate Notice"
        subtitle="Create an official notice for pension-related events"
        actions={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/notices` })}>
            <ArrowLeft className="size-4" /> Back
          </Button>
        }
      />

      <AdminProcessStepper
        steps={NOTICE_STEPS}
        currentStep={noticeFormStep(selectedPensionerId, documents.length)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AdminDetailCard title="Notice Details" icon={FileText} tone="blue">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="noticeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(v) => {
                          field.onChange(v)
                          form.setValue('templateId', '')
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {(Object.keys(NOTICE_TYPE_LABELS) as NoticeType[]).map((type) => (
                            <SelectItem key={type} value={type}>
                              {NOTICE_TYPE_LABELS[type]}
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
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {filteredTemplates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
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
                  name="pensionerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pensioner</FormLabel>
                      <FormControl>
                        <PensionerSearchCombobox
                          options={pensioners ?? []}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Search by name or PPO — includes demo accounts like Ramesh Kumar Sharma (PPO123456) and Geeta Verma (PPO555001).
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="rounded-xl"
                            placeholder="0"
                            value={field.value ?? ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" className="rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          className="rounded-xl"
                          rows={3}
                          placeholder="Additional remarks..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AdminDetailCard>

            <AdminDetailCard
              title="Attachments"
              icon={Upload}
              tone="amber"
              headerAction={
                <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={handleFileAdd}>
                  <Upload className="size-3.5" /> Add File
                </Button>
              }
            >
              {!documents.length ? (
                <div className="admin-upload-zone flex flex-col items-center justify-center rounded-xl py-10 text-center">
                  <Upload className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No attachments added</p>
                  <Button type="button" variant="link" size="sm" className="mt-1" onClick={handleFileAdd}>
                    Add your first file
                  </Button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc, i) => (
                    <li
                      key={doc.fileName}
                      className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-sm transition-colors hover:border-primary/20 hover:bg-muted/30"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        {doc.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDocuments((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </AdminDetailCard>

            <AdminIllustrationPanel
              imageSrc={featureNotifications}
              alt="Official notice generation"
              title="Official government notice"
              description="Generated notices are delivered via SMS, email, and the pensioner portal with a full audit trail."
            />
          </div>

          <div className="space-y-6">
            <AdminDetailCard title="Summary" icon={Send} tone="violet" className="h-fit">
              <AdminDetailRow label="Notice ID" value="Auto-generated" mono />
              <AdminDetailRow label="Generated By" value={user?.name ?? 'Admin'} />
              <AdminDetailRow label="Generated Date" value={new Date().toLocaleDateString('en-IN')} />
              {selectedPensioner && (
                <div className="mt-3 flex items-center gap-3 border-t border-border/40 pt-3">
                  <PensionerAvatar name={selectedPensioner.name} ppo={selectedPensioner.ppoNumber} className="size-12" />
                  <div>
                    <p className="text-sm font-semibold">{selectedPensioner.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPensioner.ppoNumber}</p>
                    <p className="text-xs text-muted-foreground">{selectedPensioner.department}</p>
                  </div>
                </div>
              )}
            </AdminDetailCard>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="rounded-full" disabled={createMutation.isPending}>
                <Send className="size-4" /> Generate Notice
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={createMutation.isPending}
                onClick={onSaveDraft}
              >
                Save Draft
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </AdminPageShell>
  )
}
