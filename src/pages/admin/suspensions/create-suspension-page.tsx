import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FileText, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { fetchPensioners } from '@/data/admin-api'
import { createAdminSuspensionCase } from '@/data/suspension-api'
import {
  createSuspensionSchema,
  type CreateSuspensionFormValues,
} from '@/lib/suspension-schema'
import { getDefaultSuspensionReason, TRIGGER_TYPE_LABELS } from '@/lib/suspension'
import { useAuth } from '@/providers/auth-provider'
import type { SuspensionDocument, SuspensionTriggerType } from '@/types/suspension'

export function CreateSuspensionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [documents, setDocuments] = useState<SuspensionDocument[]>([])

  const { data: pensioners, isLoading } = useQuery({
    queryKey: ['admin-pensioners-list'],
    queryFn: () => fetchPensioners({ status: 'active' }),
  })

  const form = useForm<CreateSuspensionFormValues>({
    resolver: zodResolver(createSuspensionSchema),
    defaultValues: {
      pensionerId: '',
      triggerType: 'administrative_hold',
      suspensionReason: getDefaultSuspensionReason('administrative_hold'),
      suspensionDate: new Date().toISOString().split('T')[0],
      remarks: '',
    },
  })

  const mutation = useMutation({
    mutationFn: createAdminSuspensionCase,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['admin-suspension-cases'] })
      queryClient.invalidateQueries({ queryKey: ['suspension-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-pensioners'] })
      toast.success(`Suspension case ${created.id} created`)
      navigate({ to: '/admin/suspensions/$id', params: { id: created.id } })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleTriggerChange = (value: SuspensionTriggerType) => {
    form.setValue('triggerType', value)
    form.setValue('suspensionReason', getDefaultSuspensionReason(value))
  }

  const handleFileAdd = () => {
    const name = `Document ${documents.length + 1}`
    setDocuments((prev) => [
      ...prev,
      { name, fileName: `supporting_doc_${Date.now()}.pdf` },
    ])
  }

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      ...values,
      documents,
      createdBy: user?.name ?? 'Pension Administrator',
      source: 'manual',
    })
  })

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <PageHeader
        variant="admin"
        title="Create Suspension Case"
        description="Manually suspend a pensioner's account with supporting documentation"
        action={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/suspensions">
              <ArrowLeft className="mr-1.5 size-4" /> Back to Suspensions
            </Link>
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">Pensioner Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pensionerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PPO Number / Pensioner</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select pensioner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {pensioners?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.ppoNumber} — {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="text-base">Suspension Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="triggerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => handleTriggerChange(v as SuspensionTriggerType)}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {(Object.keys(TRIGGER_TYPE_LABELS) as SuspensionTriggerType[]).map((key) => (
                          <SelectItem key={key} value={key}>
                            {TRIGGER_TYPE_LABELS[key]}
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
                name="suspensionReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suspension Reason</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-xl min-h-[80px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="suspensionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suspension Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-xl" />
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
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-xl min-h-[80px]" placeholder="Internal remarks for audit trail..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="admin-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Supporting Documents</CardTitle>
              <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={handleFileAdd}>
                <Upload className="mr-1 size-3.5" /> Upload
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents attached. Click Upload to add supporting files.</p>
              ) : (
                documents.map((doc, i) => (
                  <div key={doc.fileName} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-full"
                      onClick={() => setDocuments((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-full" asChild>
              <Link to="/admin/suspensions">Cancel</Link>
            </Button>
            <Button type="submit" className="rounded-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Suspension Case'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
