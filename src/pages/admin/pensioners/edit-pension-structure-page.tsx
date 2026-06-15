import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Calculator, History, Pencil, Save, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

import { PensionCalculationPreview } from '@/components/admin/pensioners/pension-calculation-preview'
import { PensionComponentHistoryTimeline } from '@/components/admin/pensioners/pension-component-history-timeline'
import { PensionComponentTable } from '@/components/admin/pensioners/pension-component-table'
import {
  AdminDetailCard,
  AdminDetailHero,
  AdminDetailRow,
  AdminPageShell,
  AdminProcessStepper,
  PensionerAvatar,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { fetchPensionerById } from '@/data/admin-api'
import {
  fetchPensionComponentHistory,
  fetchPensionStructure,
  updatePensionComponentApi,
} from '@/data/pension-structure-api'
import { pensionComponentUpdateSchema, type PensionComponentUpdateFormValues } from '@/lib/pension-structure-schema'
import { PENSION_TYPE_LABELS } from '@/lib/pension-structure'
import type { PensionComponent } from '@/types/pension-structure'
import { getPensionerFullName } from '@/types/pensioner'

const REVISION_STEPS = [
  { id: '1', label: 'Update', description: 'Edit component' },
  { id: '2', label: 'Recalculate', description: 'Auto compute' },
  { id: '3', label: 'History', description: 'Audit stored' },
  { id: '4', label: 'Complete', description: 'Changes saved' },
]

interface EditPensionStructurePageProps {
  pensionerId: string
}

export function EditPensionStructurePage({ pensionerId }: EditPensionStructurePageProps) {
  const queryClient = useQueryClient()
  const [editingComponent, setEditingComponent] = useState<PensionComponent | null>(null)

  const { data: pensioner, isLoading: pensionerLoading } = useQuery({
    queryKey: ['pensioner', pensionerId],
    queryFn: () => fetchPensionerById(pensionerId),
  })

  const { data: structure, isLoading: structureLoading } = useQuery({
    queryKey: ['pension-structure', pensionerId],
    queryFn: () => fetchPensionStructure(pensionerId),
    enabled: !!pensionerId,
  })

  const { data: history = [] } = useQuery({
    queryKey: ['pension-component-history', pensionerId],
    queryFn: () => fetchPensionComponentHistory(pensionerId),
    enabled: !!pensionerId,
  })

  const form = useForm<PensionComponentUpdateFormValues>({
    resolver: zodResolver(pensionComponentUpdateSchema) as Resolver<PensionComponentUpdateFormValues>,
    defaultValues: { amount: 0, effectiveDate: '', reason: '' },
  })

  const updateMutation = useMutation({
    mutationFn: updatePensionComponentApi,
    onSuccess: () => {
      toast.success('Pension component updated', {
        description: 'Gross and net pension recalculated. History and audit records created.',
      })
      queryClient.invalidateQueries({ queryKey: ['pension-structure', pensionerId] })
      queryClient.invalidateQueries({ queryKey: ['pension-component-history', pensionerId] })
      queryClient.invalidateQueries({ queryKey: ['pensioner', pensionerId] })
      setEditingComponent(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const openEdit = (component: PensionComponent) => {
    setEditingComponent(component)
    form.reset({
      amount: component.amount,
      effectiveDate: component.effectiveDate,
      reason: '',
    })
  }

  const handleSubmit = (values: PensionComponentUpdateFormValues) => {
    if (!editingComponent || !pensioner) return
    updateMutation.mutate({
      pensionerId: pensioner.id,
      componentId: editingComponent.id,
      amount: Number(values.amount),
      effectiveDate: values.effectiveDate,
      reason: values.reason,
      changedBy: 'Pension Administrator',
      changedByRole: 'Pension Admin',
    })
  }

  if (pensionerLoading || structureLoading || !pensioner || !structure) {
    return <PageLoadingSkeleton />
  }

  const master = structure.master
  const ppoRouteRef = pensioner.service.ppoNumber
  const fullName = getPensionerFullName(pensioner.personal)

  return (
    <AdminPageShell>
      <AdminDetailHero
        avatar={
          <PensionerAvatar
            name={fullName}
            ppo={master.ppoNumber}
            gender={pensioner.personal.gender}
          />
        }
        title="Pension Structure & Calculation"
        subtitle={`${fullName} · ${master.ppoNumber}`}
        actions={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/pensioners/$id" params={{ id: ppoRouteRef }}>
              <ArrowLeft className="size-4" /> Back to Profile
            </Link>
          </Button>
        }
      />

      <AdminProcessStepper steps={REVISION_STEPS} currentStep={1} />

      <AdminDetailCard title="Pension Master Information" icon={Calculator} tone="blue">
        <AdminDetailRow label="PPO Number" value={master.ppoNumber} mono />
        <AdminDetailRow label="Pension Type" value={PENSION_TYPE_LABELS[master.pensionType]} />
        <AdminDetailRow label="Pension Start Date" value={master.pensionStartDate} />
        <AdminDetailRow label="Sanction Date" value={master.sanctionDate} />
        <AdminDetailRow label="Retirement Date" value={master.retirementDate} />
        <AdminDetailRow label="Last Pay Drawn" value={`₹${master.lastPayDrawn.toLocaleString('en-IN')}`} />
        <AdminDetailRow label="Sanction Authority" value={master.sanctionAuthority} />
        <AdminDetailRow label="Pension Status" value={master.pensionStatus.replace('_', ' ')} />
      </AdminDetailCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="components">
            <TabsList className="rounded-full">
              <TabsTrigger value="components" className="rounded-full">
                Pension Components
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-full">
                <History className="mr-1.5 size-3.5" />
                Component History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="components" className="mt-4">
              <AdminDetailCard title="Pension Component Table" icon={Wallet} tone="violet">
                <PensionComponentTable components={structure.components} onEdit={openEdit} />
              </AdminDetailCard>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <AdminDetailCard title="Pension Component History" icon={History} tone="amber">
                <PensionComponentHistoryTimeline entries={history} />
              </AdminDetailCard>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <PensionCalculationPreview components={structure.components} />
          <Card className="admin-card border-dashed">
            <CardContent className="p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Revision Workflow</p>
              <ol className="mt-2 list-inside list-decimal space-y-1">
                <li>Update component amount</li>
                <li>System recalculates pension</li>
                <li>History record stored</li>
                <li>Audit entry created</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!editingComponent} onOpenChange={(open) => !open && setEditingComponent(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="size-4" />
              Update {editingComponent?.name}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-xl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Change</FormLabel>
                    <FormControl>
                      <Textarea
                        className="rounded-xl"
                        placeholder="e.g. Government DR Revision"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setEditingComponent(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full" disabled={updateMutation.isPending}>
                  <Save className="size-4" /> Save & Recalculate
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  )
}
