import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Banknote,
  Building2,
  Calculator,
  Home,
  MapPin,
  Pencil,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import { useEffect } from 'react'

import {
  AdminDetailCard,
  AdminDetailGrid,
  AdminDetailHero,
  AdminDetailRow,
  AdminPageShell,
  PensionerAvatar,
} from '@/components/admin/shared/admin-detail-ui'
import { PensionStructureOverview } from '@/components/admin/pensioners/pension-structure-overview'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { StatusBadge, VerificationBadge } from '@/components/admin/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { fetchPensionerById } from '@/data/admin-api'
import { fetchPensionStructure } from '@/data/pension-structure-api'
import { PENSION_TYPE_LABELS } from '@/lib/pension-structure'
import { getPensionerFullName } from '@/types/pensioner'

interface ViewPensionerPageProps {
  pensionerId: string
}

export function ViewPensionerPage({ pensionerId }: ViewPensionerPageProps) {
  const navigate = useNavigate()

  const { data: pensioner, isLoading } = useQuery({
    queryKey: ['pensioner', pensionerId],
    queryFn: () => fetchPensionerById(pensionerId),
  })

  const { data: structure } = useQuery({
    queryKey: ['pension-structure', pensionerId],
    queryFn: () => fetchPensionStructure(pensionerId),
    enabled: !!pensionerId,
  })

  useEffect(() => {
    if (!pensioner) return
    const ppo = pensioner.service.ppoNumber
    if (pensionerId.toLowerCase() !== ppo.toLowerCase()) {
      navigate({
        to: '/admin/pensioners/$id',
        params: { id: ppo },
        replace: true,
      })
    }
  }, [pensioner, pensionerId, navigate])

  if (isLoading) return <PageLoadingSkeleton />
  if (!pensioner) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Pensioner not found</p>
        <Button variant="link" asChild>
          <Link to="/admin/pensioners">Back to list</Link>
        </Button>
      </div>
    )
  }

  const { personal, service, address, bank, pension, nominee } = pensioner
  const ppoRouteRef = service.ppoNumber
  const fullName = getPensionerFullName(personal)

  return (
    <AdminPageShell>
      <AdminDetailHero
        avatar={
          <PensionerAvatar
            name={fullName}
            ppo={service.ppoNumber}
            gender={personal.gender}
            photoUrl={personal.photoUrl}
          />
        }
        title={fullName}
        subtitle={service.ppoNumber}
        badges={
          <>
            <StatusBadge status={pensioner.status} />
            <VerificationBadge status={pensioner.verificationStatus} />
          </>
        }
        actions={
          <>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/admin/pensioners">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            <Button className="rounded-full" asChild>
              <Link to="/admin/pensioners/$id/pension" params={{ id: ppoRouteRef }}>
                <Calculator className="size-4" />
                Pension Structure
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/admin/pensioners/$id/edit" params={{ id: ppoRouteRef }}>
                <Pencil className="size-4" />
                Edit Profile
              </Link>
            </Button>
          </>
        }
      />

      <AdminDetailGrid>
        <AdminDetailCard title="Personal Details" icon={User} tone="blue">
          <AdminDetailRow label="Full Name" value={fullName} />
          <AdminDetailRow label="Gender" value={personal.gender} />
          <AdminDetailRow label="Date of Birth" value={personal.dateOfBirth} />
          <AdminDetailRow label="Aadhaar" value={personal.aadhaarNumber} mono />
          <AdminDetailRow label="PAN" value={personal.panNumber} mono />
          <AdminDetailRow label="Mobile" value={personal.mobileNumber} />
          <AdminDetailRow label="Email" value={personal.emailAddress} />
        </AdminDetailCard>

        <AdminDetailCard title="Service Details" icon={Building2} tone="violet">
          <AdminDetailRow label="Employee ID" value={service.employeeId} mono />
          <AdminDetailRow label="Department" value={service.department} />
          <AdminDetailRow label="Designation" value={service.designation} />
          <AdminDetailRow label="Office" value={service.officeName} />
          <AdminDetailRow label="Retirement Date" value={service.retirementDate} />
          <AdminDetailRow label="PPO Number" value={service.ppoNumber} mono />
          <AdminDetailRow label="Pension Type" value={service.pensionType.replace(/_/g, ' ')} />
        </AdminDetailCard>

        <AdminDetailCard title="Address" icon={MapPin} tone="amber">
          <AdminDetailRow label="House No." value={address.houseNumber} />
          <AdminDetailRow label="Street" value={address.street} />
          <AdminDetailRow label="City" value={address.villageCity} />
          <AdminDetailRow label="District" value={address.district} />
          <AdminDetailRow label="State" value={address.state} />
          <AdminDetailRow label="Pincode" value={address.pincode} />
        </AdminDetailCard>

        <AdminDetailCard title="Bank Details" icon={Wallet} tone="green">
          <AdminDetailRow label="Account Holder" value={bank.accountHolderName} />
          <AdminDetailRow label="Bank" value={bank.bankName} />
          <AdminDetailRow label="Branch" value={bank.branchName} />
          <AdminDetailRow label="Account No." value={bank.accountNumber} mono />
          <AdminDetailRow label="IFSC" value={bank.ifscCode} mono />
        </AdminDetailCard>

        <AdminDetailCard title="Pension Summary" icon={Banknote} tone="rose">
          <AdminDetailRow label="Basic Pension" value={`₹${pension.basicPension.toLocaleString('en-IN')}`} />
          <AdminDetailRow label="Dearness Relief" value={`₹${pension.dearnessRelief.toLocaleString('en-IN')}`} />
          <AdminDetailRow label="Medical Allowance" value={`₹${pension.medicalAllowance.toLocaleString('en-IN')}`} />
          <Separator className="my-1" />
          <AdminDetailRow label="Gross Pension" value={`₹${pension.grossPension.toLocaleString('en-IN')}`} />
          <AdminDetailRow label="Net Pension" value={`₹${pension.netPension.toLocaleString('en-IN')}`} />
        </AdminDetailCard>

        <AdminDetailCard title="Nominee Details" icon={Users} tone="slate">
          <AdminDetailRow label="Name" value={nominee.nomineeName} />
          <AdminDetailRow label="Relationship" value={nominee.relationship} />
          <AdminDetailRow label="Mobile" value={nominee.mobileNumber} />
          <AdminDetailRow label="Share" value={`${nominee.percentageShare}%`} />
        </AdminDetailCard>
      </AdminDetailGrid>

      {structure && (
        <PensionStructureOverview
          components={structure.components}
          ppoRouteRef={ppoRouteRef}
        />
      )}

      <AdminDetailGrid>
        <AdminDetailCard title="Pension Master" icon={Home} tone="violet">
          {structure ? (
            <>
              <AdminDetailRow label="PPO Number" value={structure.master.ppoNumber} mono />
              <AdminDetailRow label="Pension Type" value={PENSION_TYPE_LABELS[structure.master.pensionType]} />
              <AdminDetailRow label="Pension Start Date" value={structure.master.pensionStartDate} />
              <AdminDetailRow label="Sanction Date" value={structure.master.sanctionDate} />
              <AdminDetailRow label="Sanction Authority" value={structure.master.sanctionAuthority} />
              <AdminDetailRow
                label="Pension Status"
                value={structure.master.pensionStatus.replace('_', ' ')}
              />
            </>
          ) : (
            <AdminDetailRow label="PPO Number" value={service.ppoNumber} mono />
          )}
        </AdminDetailCard>
      </AdminDetailGrid>
    </AdminPageShell>
  )
}
