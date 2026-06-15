import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { AlertTriangle, FileText, RotateCcw } from 'lucide-react'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { SuspensionStatusBadge } from '@/components/suspension/suspension-status-badge'
import { TriggerTypeBadge } from '@/components/suspension/trigger-type-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchPensionerActiveSuspension } from '@/data/suspension-api'
import { TRIGGER_TYPE_LABELS } from '@/lib/suspension'
import { useAuth } from '@/providers/auth-provider'

export function SuspensionStatusPage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''

  const { data: suspensionCase, isLoading } = useQuery({
    queryKey: ['pensioner-active-suspension', pensionerId],
    queryFn: () => fetchPensionerActiveSuspension(pensionerId),
    enabled: !!pensionerId,
  })

  if (isLoading) return <PageLoadingSkeleton />

  const isSuspended = !!suspensionCase && suspensionCase.status !== 'restored'
  const canSubmitRestoration =
    suspensionCase &&
    (suspensionCase.status === 'suspended' || suspensionCase.status === 'rejected')

  return (
    <div>
      <PageHeader
        title="Pension Suspension"
        description="View your suspension status and submit restoration requests"
      />

      {isSuspended && suspensionCase ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card mb-6 overflow-hidden border-destructive/30 bg-destructive/5"
          >
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                    <AlertTriangle className="size-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-destructive">Your pension has been suspended.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pension payments are stopped until your case is reviewed and restored.
                    </p>
                  </div>
                </div>
                {canSubmitRestoration && (
                  <Button className="shrink-0 rounded-full" asChild>
                    <Link to="/pensioner/suspension/restoration">Submit Restoration Request</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="text-base">Suspension Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <SuspensionStatusBadge status={suspensionCase.status} />
                  <TriggerTypeBadge triggerType={suspensionCase.triggerType} />
                </div>
                <div>
                  <p className="text-muted-foreground">Suspension ID</p>
                  <p className="font-mono font-medium">{suspensionCase.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Suspension Reason</p>
                  <p className="font-medium">{suspensionCase.suspensionReason}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trigger Type</p>
                  <p>{TRIGGER_TYPE_LABELS[suspensionCase.triggerType]}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Suspension Date</p>
                  <p>{suspensionCase.suspensionDate}</p>
                </div>
                {suspensionCase.rejectionReason && (
                  <div>
                    <p className="text-muted-foreground">Last Rejection Reason</p>
                    <p className="text-destructive">{suspensionCase.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="text-base">What You Can Do</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  If you believe this suspension was applied in error or you have resolved the underlying issue,
                  submit a restoration request with supporting documents.
                </p>
                <div className="flex flex-col gap-2">
                  {canSubmitRestoration && (
                    <Button className="rounded-full justify-start" asChild>
                      <Link to="/pensioner/suspension/restoration">
                        <RotateCcw className="mr-2 size-4" /> Submit Restoration Request
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" className="rounded-full justify-start" asChild>
                    <Link to="/pensioner/suspension/requests">
                      <FileText className="mr-2 size-4" /> My Restoration Requests
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="admin-card">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <RotateCcw className="size-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold">No Active Suspension</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your pension account is active. No suspension cases are linked to your profile.
            </p>
            <Button variant="outline" className="mt-6 rounded-full" asChild>
              <Link to="/pensioner/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
