import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  User,
  Users,
} from 'lucide-react'

import {
  adminStaggerContainer,
  adminStaggerItem,
  AdminSectionHeading,
} from '@/components/admin/shared/admin-analytics-ui'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ProfileSubNav } from '@/components/pensioner/profile/profile-sub-nav'
import { InfoSection } from '@/components/pensioner/shared/info-section'
import { PensionerProfileBanner } from '@/components/pensioner/shared/pensioner-profile-banner'
import { Button } from '@/components/ui/button'
import { fetchPensionerProfile } from '@/data/pensioner-api'
import { getPensionerVerificationSchedule } from '@/data/pensioner-mock-data'
import { useAuth } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'
import { getPensionerFullName } from '@/types/pensioner'

function formatStatus(status: string) {
  if (status === 'active') return 'Active'
  return status.replace(/_/g, ' ')
}

export function ProfilePage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''

  const { data: record, isLoading } = useQuery({
    queryKey: ['pensioner-profile', pensionerId],
    queryFn: () => fetchPensionerProfile(pensionerId),
    enabled: !!pensionerId,
  })

  if (isLoading || !record) return <PageLoadingSkeleton />

  const fullName = getPensionerFullName(record.personal)
  const verificationSchedule = getPensionerVerificationSchedule(pensionerId)

  const contactChips = [
    {
      label: 'Mobile',
      value: record.personal.mobileNumber,
      icon: Phone,
      tone: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-100 dark:bg-sky-950/50',
    },
    {
      label: 'Email',
      value: record.personal.emailAddress,
      icon: Mail,
      tone: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-950/50',
    },
    {
      label: 'District',
      value: `${record.address.district}, ${record.address.state}`,
      icon: MapPin,
      tone: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-950/50',
    },
  ]

  return (
    <motion.div
      className="admin-dashboard-page"
      variants={adminStaggerContainer}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={adminStaggerItem}>
        <PageHeader
          variant="admin"
          title="My Profile"
          description="Your registered pensioner information at a glance"
          actions={
            <Button className="rounded-full shadow-sm" asChild>
              <Link to="/pensioner/profile/request">
                <Pencil className="size-4" />
                Request Update
              </Link>
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={adminStaggerItem}>
        <ProfileSubNav activePath="/pensioner/profile" />
      </motion.div>

      <PensionerProfileBanner
        user={user}
        name={fullName}
        summary={{
          ppoNumber: record.service.ppoNumber,
          pensionType: record.service.pensionType,
          status: formatStatus(record.status),
          department: record.service.department,
          designation: record.service.designation,
          officeName: record.service.officeName,
          nextVerificationDueDate: verificationSchedule?.nextVerificationDueDate,
        }}
        delay={0.06}
      />

      <motion.div
        variants={adminStaggerItem}
        className="group relative mb-8 overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50/90 via-amber-50/30 to-transparent dark:border-amber-900/30 dark:from-amber-950/30 dark:via-amber-950/10"
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-amber-200/30 blur-2xl transition-transform duration-700 group-hover:scale-110 dark:bg-amber-800/20"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <motion.div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 shadow-sm dark:bg-amber-950/60"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Lock className="size-5 text-amber-600 dark:text-amber-400" />
          </motion.div>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold text-amber-950 dark:text-amber-100">
              Sensitive fields are read-only
            </p>
            <p className="mt-1 leading-relaxed text-amber-900/80 dark:text-amber-200/80">
              Bank, nominee, Aadhaar, PAN, and pension details cannot be edited directly. Submit a
              profile update request for admin review.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 rounded-full border-amber-300/60 bg-white/60 text-amber-900 hover:bg-white dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
              asChild
            >
              <Link to="/pensioner/profile/request">
                Raise update request
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={adminStaggerItem} className="mb-8 grid gap-3 sm:grid-cols-3">
        {contactChips.map((chip, index) => (
          <motion.div
            key={chip.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            className="admin-card flex items-center gap-3 rounded-xl border-border/60 p-4 transition-shadow duration-300 hover:shadow-md"
          >
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl',
                chip.bg,
                chip.tone,
              )}
            >
              <chip.icon className="size-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {chip.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{chip.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={adminStaggerItem}>
        <AdminSectionHeading
          title="Registered information"
          description="All details linked to your pension account"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoSection
          animated
          delay={0.14}
          icon={User}
          tone="blue"
          title="Personal Details"
          rows={[
            { label: 'Name', value: fullName },
            { label: 'Date of Birth', value: record.personal.dateOfBirth },
            { label: 'Gender', value: record.personal.gender },
            { label: 'Aadhaar', value: record.personal.aadhaarNumber },
            { label: 'PAN', value: record.personal.panNumber },
            { label: 'Mobile', value: record.personal.mobileNumber },
            { label: 'Email', value: record.personal.emailAddress },
          ]}
        />

        <InfoSection
          animated
          delay={0.18}
          icon={Building2}
          tone="violet"
          title="Service Details"
          rows={[
            { label: 'Employee ID', value: record.service.employeeId },
            { label: 'Department', value: record.service.department },
            { label: 'Designation', value: record.service.designation },
            { label: 'Retirement Date', value: record.service.retirementDate },
            { label: 'PPO Number', value: record.service.ppoNumber },
          ]}
        />

        <InfoSection
          animated
          delay={0.22}
          icon={MapPin}
          tone="green"
          title="Address Details"
          rows={[
            { label: 'House No.', value: record.address.houseNumber },
            { label: 'Street', value: record.address.street },
            { label: 'City', value: record.address.villageCity },
            { label: 'District', value: record.address.district },
            { label: 'State', value: record.address.state },
            { label: 'Pincode', value: record.address.pincode },
          ]}
        />

        <InfoSection
          animated
          delay={0.26}
          icon={CreditCard}
          tone="amber"
          locked
          title="Bank Details"
          rows={[
            { label: 'Account Holder', value: record.bank.accountHolderName },
            { label: 'Bank Name', value: record.bank.bankName },
            { label: 'Branch', value: record.bank.branchName },
            { label: 'Account Number', value: record.bank.accountNumber },
            { label: 'IFSC Code', value: record.bank.ifscCode },
          ]}
        />

        <InfoSection
          animated
          delay={0.3}
          icon={Users}
          tone="rose"
          locked
          className="lg:col-span-2"
          title="Nominee Details"
          rows={[
            { label: 'Nominee Name', value: record.nominee.nomineeName },
            { label: 'Relationship', value: record.nominee.relationship },
            { label: 'Date of Birth', value: record.nominee.dateOfBirth },
            { label: 'Aadhaar', value: record.nominee.aadhaarNumber },
            { label: 'Mobile', value: record.nominee.mobileNumber },
            { label: 'Share', value: `${record.nominee.percentageShare}%` },
          ]}
        />
      </div>

      <motion.div
        variants={adminStaggerItem}
        whileHover={{ scale: 1.005 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="admin-hero-metric mt-8 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">Need to update any information?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit a request and track its status from the My Requests tab.
          </p>
        </div>
        <Button className="rounded-full shadow-sm" asChild>
          <Link to="/pensioner/profile/request">
            Request Profile Update
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}
