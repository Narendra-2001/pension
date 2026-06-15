import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { Edit, Eye, Play } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { DataListView } from '@/components/admin/shared/data-list-view'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ChannelBadge } from '@/components/communication/channel-badge'
import { useCommunicationPortal } from '@/components/communication/communication-portal-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
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
import { Textarea } from '@/components/ui/textarea'
import {
  activateTemplateApi,
  fetchTemplates,
  updateTemplateApi,
} from '@/data/communication-api'
import { templateFormSchema, type TemplateFormValues } from '@/lib/communication-schema'
import {
  CHANNEL_LABELS,
  NOTICE_TYPE_LABELS,
  NOTIFICATION_EVENT_LABELS,
  TEMPLATE_STATUS_LABELS,
} from '@/lib/communication'
import { useAuth } from '@/providers/auth-provider'
import type { CommunicationTemplate } from '@/types/communication'
import { cn } from '@/lib/utils'

interface TemplateManagementPageProps {
  templateType: 'notice' | 'notification'
}

export function TemplateManagementPage({ templateType }: TemplateManagementPageProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { permissions } = useCommunicationPortal()
  const [preview, setPreview] = useState<CommunicationTemplate | null>(null)
  const [editing, setEditing] = useState<CommunicationTemplate | null>(null)

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', templateType],
    queryFn: () => fetchTemplates(templateType),
  })

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      templateType,
      channel: templateType === 'notice' ? 'pdf' : 'sms',
      messageContent: '',
      status: 'active',
    },
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateTemplateApi(id, user?.name ?? 'Admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', templateType] })
      toast.success('Template activated')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: TemplateFormValues) =>
      updateTemplateApi(editing!.id, values, user?.name ?? 'Admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates', templateType] })
      setEditing(null)
      toast.success('Template updated')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const openEdit = (template: CommunicationTemplate) => {
    setEditing(template)
    form.reset({
      name: template.name,
      templateType: template.templateType,
      channel: template.channel,
      noticeType: template.noticeType,
      eventType: template.eventType,
      subject: template.subject,
      messageContent: template.messageContent,
      status: template.status,
    })
  }

  const columns = useMemo<ColumnDef<CommunicationTemplate>[]>(
    () => [
      { accessorKey: 'name', header: 'Template Name', cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
      {
        accessorKey: 'channel',
        header: 'Channel',
        cell: ({ row }) =>
          row.original.channel === 'pdf' ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">PDF</span>
          ) : (
            <ChannelBadge channel={row.original.channel as 'sms' | 'email' | 'in_app'} />
          ),
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.noticeType
              ? NOTICE_TYPE_LABELS[row.original.noticeType]
              : row.original.eventType
                ? NOTIFICATION_EVENT_LABELS[row.original.eventType]
                : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
              row.original.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-700'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {TEMPLATE_STATUS_LABELS[row.original.status]}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => format(new Date(row.original.updatedAt), 'dd MMM yyyy'),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setPreview(row.original)}>
              <Eye className="mr-1 size-3.5" /> Preview
            </Button>
            {permissions.canManageTemplates && (
              <>
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => openEdit(row.original)}>
                  <Edit className="mr-1 size-3.5" /> Edit
                </Button>
                {row.original.status !== 'active' && (
                  <Button variant="ghost" size="sm" className="rounded-full" onClick={() => activateMutation.mutate(row.original.id)}>
                    <Play className="mr-1 size-3.5" /> Activate
                  </Button>
                )}
              </>
            )}
          </div>
        ),
      },
    ],
    [activateMutation, permissions.canManageTemplates],
  )

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title={templateType === 'notice' ? 'Notice Templates' : 'Notification Templates'}
        description={
          templateType === 'notice'
            ? 'Manage PDF notice templates for official pension communications'
            : 'Manage SMS, email, and in-app notification templates'
        }
      />

      <Card className="admin-card mb-6">
        <CardHeader>
          <CardTitle className="text-base">Template Variables</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-xs">
          {['{PensionerName}', '{PPONumber}', '{DueDate}', '{Amount}', '{Remarks}', '{Department}'].map((v) => (
            <code key={v} className="rounded-lg bg-muted px-2 py-1 font-mono">{v}</code>
          ))}
        </CardContent>
      </Card>

      <DataListView
        columns={columns}
        data={templates ?? []}
        pageSize={10}
        viewMode="table"
        showViewToggle={false}
        renderCard={(template) => (
          <div className="rounded-2xl border p-4 text-sm">{template.name}</div>
        )}
      />

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview?.subject && (
            <div className="text-sm">
              <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Subject</p>
              <p>{preview.subject}</p>
            </div>
          )}
          <div className="text-sm">
            <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Message</p>
            <p className="whitespace-pre-wrap rounded-xl bg-muted/50 p-3">{preview?.messageContent}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Channel: {preview?.channel === 'pdf' ? 'PDF Notice' : CHANNEL_LABELS[preview?.channel as keyof typeof CHANNEL_LABELS]}
          </p>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl><Input className="rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {templateType === 'notification' && (
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject (Email)</FormLabel>
                    <FormControl><Input className="rounded-xl" {...field} /></FormControl>
                  </FormItem>
                )} />
              )}
              <FormField control={form.control} name="messageContent" render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Content</FormLabel>
                  <FormControl><Textarea className="rounded-xl" rows={6} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <Button type="submit" className="w-full rounded-full" disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
