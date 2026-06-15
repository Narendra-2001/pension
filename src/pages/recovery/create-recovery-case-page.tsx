import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, FileText, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { useRecoveryPortal } from '@/components/recovery/recovery-portal-context'
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
import { createRecoveryCaseApi, fetchApprovedExcessCases } from '@/data/recovery-api'
import {
  createRecoveryCaseSchema,
  type CreateRecoveryFormValues,
} from '@/lib/recovery-schema'
import {
  formatRecoveryCurrency,
  RECOVERY_REASON_LABELS,
  RECOVERY_TYPE_LABELS,
} from '@/lib/recovery'
import { useAuth } from '@/providers/auth-provider'
import type { RecoveryDocument } from '@/types/recovery'

export function CreateRecoveryCasePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { basePath } = useRecoveryPortal()
  const [documents, setDocuments] = useState<RecoveryDocument[]>([])

  const { data: excessCases, isLoading } = useQuery({
    queryKey: ['approved-excess-cases'],
    queryFn: fetchApprovedExcessCases,
  })

  const form = useForm<CreateRecoveryFormValues>({
    resolver: zodResolver(createRecoveryCaseSchema),
    defaultValues: {
      excessCaseId: '',
      recoveryReason: 'pay_revision_adjustment',
      recoveryType: 'installment_recovery',
      arrearAdjustment: 0,
      recoveryStartDate: new Date().toISOString().split('T')[0],
      remarks: '',
    },
  })

  const selectedExcessId = form.watch('excessCaseId')
  const selectedExcess = excessCases?.find((e) => e.id === selectedExcessId)

  const mutation = useMutation({
    mutationFn: createRecoveryCaseApi,
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['recovery-cases'] })
      queryClient.invalidateQueries({ queryKey: ['recovery-dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['approved-excess-cases'] })
      toast.success(`Recovery case ${created.id} created`)
      navigate({ href: `${basePath}/cases/${created.id}` })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleFileAdd = () => {
    const name = `Supporting Document ${documents.length + 1}`
    setDocuments((prev) => [
      ...prev,
      { name, fileName: `recovery_doc_${Date.now()}.pdf` },
    ])
  }

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate({
      ...values,
      documents,
      createdBy: user?.name ?? 'Recovery Officer',
    })
  })

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <div>
      <PageHeader
        variant="admin"
        title="Create Recovery Case"
        description="Initiate recovery from an approved excess pension case"
        action={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/cases` })}>
            <ArrowLeft className="mr-1.5 size-4" /> Back
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="text-base">Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="excessCaseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linked Excess Case ID *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select approved excess case" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl">
                          {excessCases?.map((excess) => (
                            <SelectItem key={excess.id} value={excess.id}>
                              {excess.id} — {excess.pensionerName} ({formatRecoveryCurrency(excess.excessAmount)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedExcess && (
                  <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">PPO Number</p>
                      <p className="text-sm font-medium">{selectedExcess.ppoNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pensioner</p>
                      <p className="text-sm font-medium">{selectedExcess.pensionerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{selectedExcess.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Excess Amount</p>
                      <p className="text-sm font-semibold">{formatRecoveryCurrency(selectedExcess.excessAmount)}</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="recoveryReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recovery Reason</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {Object.entries(RECOVERY_REASON_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recoveryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recovery Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl">
                            {Object.entries(RECOVERY_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="arrearAdjustment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrear Adjustment (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
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
                    control={form.control}
                    name="recoveryStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recovery Start Date</FormLabel>
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
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-24 rounded-lg" placeholder="Recovery case remarks..." {...field} />
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
                  <Upload className="mr-1 size-3.5" /> Add Document
                </Button>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents attached yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {documents.map((doc, i) => (
                      <li key={doc.fileName} className="flex items-center justify-between rounded-lg border px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-muted-foreground" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setDocuments((prev) => prev.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="text-base">Calculation Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Excess</span>
                  <span className="font-medium">{formatRecoveryCurrency(selectedExcess?.excessAmount ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arrear Adjustment</span>
                  <span className="font-medium">{formatRecoveryCurrency(form.watch('arrearAdjustment') || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>Remaining Amount</span>
                  <span>
                    {formatRecoveryCurrency(
                      Math.max(0, (selectedExcess?.excessAmount ?? 0) - (form.watch('arrearAdjustment') || 0)),
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full rounded-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Recovery Case'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
