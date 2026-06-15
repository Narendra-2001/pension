import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Heart, IndianRupee } from 'lucide-react'

import { PageHeader } from '@/components/admin/shared/page-header'
import { EmptyState, PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { useDemisePortal } from '@/components/demise/demise-portal-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchDeceasedProfile, fetchDemiseIntimation } from '@/data/demise-api'
import { formatDemiseCurrency } from '@/lib/demise'

interface DeceasedPensionerDetailPageProps {
  profileId: string
}

export function DeceasedPensionerDetailPage({ profileId }: DeceasedPensionerDetailPageProps) {
  const navigate = useNavigate()
  const { basePath } = useDemisePortal()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['deceased-profile', profileId],
    queryFn: () => fetchDeceasedProfile(profileId),
  })

  const { data: intimation } = useQuery({
    queryKey: ['demise-intimation', profile?.demiseIntimationId],
    queryFn: () => fetchDemiseIntimation(profile!.demiseIntimationId),
    enabled: !!profile?.demiseIntimationId,
  })

  if (isLoading) return <PageLoadingSkeleton />

  if (!profile) {
    return (
      <div>
        <Button variant="outline" className="mb-6 rounded-full" onClick={() => navigate({ href: `${basePath}/deceased` })}>
          <ArrowLeft className="mr-1.5 size-4" /> Back
        </Button>
        <EmptyState title="Profile not found" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        variant="admin"
        title={profile.pensionerName}
        description={`Deceased Pensioner · ${profile.ppoNumber}`}
        action={
          <Button variant="outline" className="rounded-full" onClick={() => navigate({ href: `${basePath}/deceased` })}>
            <ArrowLeft className="mr-1.5 size-4" /> Back
          </Button>
        }
      />

      <div className="mb-4 rounded-xl border border-deceased/30 bg-deceased/5 px-4 py-3 text-sm">
        This is a read-only deceased pensioner profile. Pension payments have been stopped.
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Pensioner Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div><p className="text-muted-foreground">PPO Number</p><p className="font-medium">{profile.ppoNumber}</p></div>
            <div><p className="text-muted-foreground">Department</p><p className="font-medium">{profile.department}</p></div>
            <div><p className="text-muted-foreground">Pension Type</p><p className="font-medium capitalize">{profile.pensionType.replace(/_/g, ' ')}</p></div>
            <div><p className="text-muted-foreground">Monthly Pension</p><p className="font-medium">{formatDemiseCurrency(profile.monthlyPension)}</p></div>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader><CardTitle className="text-base">Demise Information</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div><p className="text-muted-foreground">Date of Death</p><p className="font-medium">{profile.dateOfDeath}</p></div>
            <div><p className="text-muted-foreground">Demise Approval Date</p><p className="font-medium">{profile.demiseApprovalDate}</p></div>
            <div><p className="text-muted-foreground">Intimation ID</p>
              <Button
                variant="link"
                className="h-auto p-0 font-mono text-sm"
                onClick={() => navigate({ href: `${basePath}/requests/${profile.demiseIntimationId}` })}
              >
                {profile.demiseIntimationId}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card border-rose-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IndianRupee className="size-4 text-rose-600" />
              Excess Pension
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-2xl font-bold text-rose-600">{formatDemiseCurrency(profile.excessPensionAmount)}</p>
            <p className="text-muted-foreground">Recovery Status: {profile.recoveryStatus}</p>
            {profile.recoveryCaseId && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => navigate({ href: `/admin/recovery/cases/${profile.recoveryCaseId}` })}
              >
                View Recovery Case
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="size-4 text-pink-600" />
              Family Pension Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">{profile.familyPensionStatus}</p>
            {profile.familyPensionId && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => navigate({ href: `${basePath}/family-pension/${profile.familyPensionId}` })}
              >
                View Family Pension Application
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {intimation?.nominee && (
        <Card className="admin-card mt-4">
          <CardHeader><CardTitle className="text-base">Nominee on Record</CardTitle></CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <div><p className="text-muted-foreground">Name</p><p className="font-medium">{intimation.nominee.nomineeName}</p></div>
            <div><p className="text-muted-foreground">Relationship</p><p className="font-medium">{intimation.nominee.relationship}</p></div>
            <div><p className="text-muted-foreground">Mobile</p><p className="font-medium">{intimation.nominee.mobileNumber}</p></div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
