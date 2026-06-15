import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { ArrowLeft, Mail, MessageSquare, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

import {
  AdminActionBar,
  AdminDetailCard,
  AdminDetailGrid,
  AdminDetailHero,
  AdminDetailRow,
  AdminIllustrationPanel,
  AdminPageShell,
  AdminProcessStepper,
  PensionerAvatar,
} from '@/components/admin/shared/admin-detail-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { TaskTypeBadge } from '@/components/admin/tasks/task-type-badge'
import { Button } from '@/components/ui/button'
import featurePensionerManagement from '@/assets/features/feature-pensioner-management.png'
import {
  activateManually,
  fetchPensionerById,
  resendActivationEmail,
  resendActivationSms,
} from '@/data/admin-api'
import type { ActivationStatus } from '@/types/pensioner'
import { getPensionerFullName } from '@/types/pensioner'

const ACTIVATION_STEPS = [
  { id: 'onboarded', label: 'Onboarded', description: 'Record created' },
  { id: 'sms', label: 'SMS Sent', description: 'Portal link delivered' },
  { id: 'email', label: 'Email Sent', description: 'Activation email' },
  { id: 'activated', label: 'Activated', description: 'Portal access live' },
]

function activationStepIndex(status: ActivationStatus): number {
  switch (status) {
    case 'pending':
      return 1
    case 'sms_sent':
      return 2
    case 'email_sent':
      return 3
    case 'activated':
      return 4
    default:
      return 1
  }
}

interface ActivationTaskPageProps {
  pensionerId: string
}

export function ActivationTaskPage({ pensionerId }: ActivationTaskPageProps) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: record, isLoading } = useQuery({
    queryKey: ['pensioner', pensionerId],
    queryFn: () => fetchPensionerById(pensionerId),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })
    queryClient.invalidateQueries({ queryKey: ['admin-task-counts'] })
    queryClient.invalidateQueries({ queryKey: ['pending-admin-task-count'] })
    queryClient.invalidateQueries({ queryKey: ['pending-activations'] })
  }

  const smsMutation = useMutation({
    mutationFn: () => resendActivationSms(pensionerId),
    onSuccess: () => {
      invalidate()
      toast.success('Activation SMS sent')
    },
  })

  const emailMutation = useMutation({
    mutationFn: () => resendActivationEmail(pensionerId),
    onSuccess: () => {
      invalidate()
      toast.success('Activation email sent')
    },
  })

  const activateMutation = useMutation({
    mutationFn: () => activateManually(pensionerId),
    onSuccess: () => {
      invalidate()
      toast.success('Pensioner activated manually')
      navigate({ to: '/admin/pensioners/pending-activations' })
    },
  })

  if (isLoading || !record) return <PageLoadingSkeleton />

  const fullName = getPensionerFullName(record.personal)
  const currentStep = activationStepIndex(record.activationStatus)

  return (
    <AdminPageShell>
      <AdminDetailHero
        avatar={
          <PensionerAvatar
            name={fullName}
            ppo={record.service.ppoNumber}
            gender={record.personal.gender}
          />
        }
        title={`ACT-${record.id.toUpperCase()}`}
        subtitle={`${fullName} · ${record.service.ppoNumber}`}
        badges={<TaskTypeBadge type="activation" />}
        actions={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/pensioners/pending-activations">
              <ArrowLeft className="size-4" /> Back to Pending Activations
            </Link>
          </Button>
        }
      />

      <AdminProcessStepper steps={ACTIVATION_STEPS} currentStep={currentStep} />

      <AdminActionBar>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => smsMutation.mutate()}
          disabled={smsMutation.isPending}
        >
          <MessageSquare className="size-4" /> Resend SMS
        </Button>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => emailMutation.mutate()}
          disabled={emailMutation.isPending}
        >
          <Mail className="size-4" /> Resend Email
        </Button>
        <Button
          className="rounded-full"
          onClick={() => activateMutation.mutate()}
          disabled={activateMutation.isPending}
        >
          <UserCheck className="size-4" /> Activate Manually
        </Button>
      </AdminActionBar>

      <AdminDetailGrid columns={3}>
        <div className="space-y-5 lg:col-span-2">
          <AdminDetailCard title="Activation Details" icon={UserCheck} tone="blue">
            <AdminDetailRow label="PPO" value={record.service.ppoNumber} mono />
            <AdminDetailRow label="Mobile" value={record.personal.mobileNumber} />
            <AdminDetailRow label="Email" value={record.personal.emailAddress} />
            <AdminDetailRow
              label="Activation Status"
              value={record.activationStatus.replace(/_/g, ' ')}
            />
            <AdminDetailRow
              label="Onboarded"
              value={format(parseISO(record.createdAt), 'dd MMM yyyy')}
            />
          </AdminDetailCard>

          <AdminIllustrationPanel
            imageSrc={featurePensionerManagement}
            alt="Pensioner onboarding"
            title="Portal activation pending"
            description="The pensioner must complete SMS or email activation before accessing the self-service portal. Use resend options or activate manually for verified cases."
          />
        </div>

        <AdminDetailCard title="Quick Summary" icon={MessageSquare} tone="amber" className="h-fit">
          <AdminDetailRow label="Task ID" value={`ACT-${record.id.toUpperCase()}`} mono />
          <AdminDetailRow label="Department" value={record.service.department} />
          <AdminDetailRow label="Designation" value={record.service.designation} />
          <AdminDetailRow label="Current Step" value={ACTIVATION_STEPS[currentStep - 1]?.label} />
        </AdminDetailCard>
      </AdminDetailGrid>
    </AdminPageShell>
  )
}
