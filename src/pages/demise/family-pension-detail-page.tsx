import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DemiseDocumentPreview } from '@/components/demise/demise-document-preview'
import { useDemisePortal } from '@/components/demise/demise-portal-context'
import { DemiseTimeline } from '@/components/demise/demise-timeline'
import { FamilyPensionStatusBadge } from '@/components/demise/family-pension-status-badge'
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
import { Textarea } from '@/components/ui/textarea'
import { fetchFamilyPensionApplication, reviewFamilyPensionApi } from '@/data/demise-api'
import { demiseVerificationSchema } from '@/lib/demise-schema'
import { useAuth } from '@/providers/auth-provider'

interface FamilyPensionDetailPageProps {
  applicationId: string
}

export function FamilyPensionDetailPage({ applicationId }: FamilyPensionDetailPageProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { basePath, permissions } = useDemisePortal()
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const { data: application, isLoading } = useQuery({
    queryKey: ['family-pension', applicationId],
    queryFn: () => fetchFamilyPensionApplication(applicationId),
  })

  const reviewForm = useForm({
    resolver: zodResolver(demiseVerificationSchema),
    defaultValues: { remarks: '' },
  })

  const reviewMutation = useMutation({
    mutationFn: (action: 'approve' | 'reject') =>
      reviewFamilyPensionApi({
        applicationId,
        action,
        remarks: reviewForm.getValues('remarks'),
        actor: user?.name ?? 'Pension Administrator',
      }),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['family-pension', applicationId] })
      queryClient.invalidateQueries({ queryKey: ['family-pension-applications'] })
      queryClient.invalidateQueries({ queryKey: ['deceased-profiles'] })
      setReviewAction(null)
      reviewForm.reset()
      toast.success(action === 'approve' ? 'Family pension activated' : 'Application rejected')
    },
  })

  if (isLoading) return <PageLoadingSkeleton />

  if (!application) {
    return (
      <div>
        <Button variant="outline" className="mb-6 rounded-full" onClick={() => navigate({ href: `${basePath}/family-pension` })}>
          <ArrowLeft className="mr-1.5 size-4" /> Back
        </Button>
        <EmptyState title="Application not found" />
      </div>
    )
  }

  const canReview =
    permissions.canReviewFamilyPension &&
    ['submitted', 'under_review', 'eligibility_check'].includes(application.status)

  return (
    <div>
      <PageHeader
        variant="admin"
        title={application.id}
        description={`Family Pension for ${application.nomineeName} · ${application.ppoNumber}`}
        action={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/family-pension` })}>
            <ArrowLeft className="mr-1.5 size-4" /> Back
          </Button>
        }
      />

      <div className="mb-4">
        <FamilyPensionStatusBadge status={application.status} />
      </div>

      {canReview && (
        <Card className="admin-card mb-6">
          <CardContent className="flex flex-wrap gap-2 p-4">
            <Button className="rounded-full" onClick={() => setReviewAction('approve')}>
              <CheckCircle2 className="mr-1.5 size-4" /> Approve & Activate
            </Button>
            <Button variant="destructive" className="rounded-full" onClick={() => setReviewAction('reject')}>
              <XCircle className="mr-1.5 size-4" /> Reject
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Nominee Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div><p className="text-muted-foreground">Name</p><p className="font-medium">{application.nomineeName}</p></div>
            <div><p className="text-muted-foreground">Relationship</p><p className="font-medium">{application.relationship}</p></div>
            <div><p className="text-muted-foreground">Mobile</p><p className="font-medium">{application.mobileNumber}</p></div>
            <div className="sm:col-span-2"><p className="text-muted-foreground">Address</p><p>{application.address}</p></div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Deceased Pensioner</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div><p className="text-muted-foreground">Name</p><p className="font-medium">{application.pensionerName}</p></div>
            <div><p className="text-muted-foreground">PPO</p><p className="font-medium">{application.ppoNumber}</p></div>
            <div><p className="text-muted-foreground">Demise Intimation</p>
              <Button
                variant="link"
                className="h-auto p-0 font-mono text-sm"
                onClick={() => navigate({ href: `${basePath}/requests/${application.demiseIntimationId}` })}
              >
                {application.demiseIntimationId}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Bank Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <div><p className="text-muted-foreground">Account Holder</p><p className="font-medium">{application.bankDetails.accountHolderName}</p></div>
            <div><p className="text-muted-foreground">Bank</p><p className="font-medium">{application.bankDetails.bankName}</p></div>
            <div><p className="text-muted-foreground">Branch</p><p className="font-medium">{application.bankDetails.branchName}</p></div>
            <div><p className="text-muted-foreground">Account Number</p><p className="font-medium">{application.bankDetails.accountNumber}</p></div>
            <div><p className="text-muted-foreground">IFSC</p><p className="font-mono font-medium">{application.bankDetails.ifscCode}</p></div>
          </CardContent>
        </Card>

        <Card className="admin-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
          <CardContent>
            <DemiseDocumentPreview documents={application.documents} />
          </CardContent>
        </Card>

        <Card className="admin-card lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Application Timeline</CardTitle></CardHeader>
          <CardContent>
            <DemiseTimeline events={application.timeline} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!reviewAction} onOpenChange={() => setReviewAction(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Family Pension' : 'Reject Application'}
            </DialogTitle>
          </DialogHeader>
          <Form {...reviewForm}>
            <form
              onSubmit={reviewForm.handleSubmit(() => {
                if (reviewAction) reviewMutation.mutate(reviewAction)
              })}
              className="space-y-4"
            >
              <FormField
                control={reviewForm.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setReviewAction(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="rounded-full" disabled={reviewMutation.isPending}>
                  Confirm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
