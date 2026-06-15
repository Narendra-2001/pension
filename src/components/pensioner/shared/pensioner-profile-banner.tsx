import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Building2, CalendarClock, FileText, Shield, User } from 'lucide-react'

import { adminStaggerItem, AdminIcon3D } from '@/components/admin/shared/admin-analytics-ui'
import { UserAvatar } from '@/components/admin/shared/user-avatar'
import { getVerificationStatusVariant, StatusPill } from '@/components/pensioner/shared/status-pill'
import type { AppUser } from '@/types/auth'
import { cn } from '@/lib/utils'

interface PensionerProfileSummary {
  ppoNumber?: string
  pensionType?: string
  status?: string
  department?: string
  designation?: string
  officeName?: string
  lastVerificationDate?: string
  nextVerificationDueDate?: string
}

interface PensionerProfileBannerProps {
  user?: AppUser | null
  name: string
  summary?: PensionerProfileSummary
  className?: string
  delay?: number
}

function ProfileField({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string
  value?: string
  icon: LucideIcon
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col justify-center bg-card p-4 sm:p-5', className)}>
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 truncate text-sm font-semibold capitalize text-foreground">{value ?? '—'}</p>
    </div>
  )
}

export function PensionerProfileBanner({
  user,
  name,
  summary,
  className,
  delay = 0.05,
}: PensionerProfileBannerProps) {
  const pensionType = summary?.pensionType?.replace(/_/g, ' ') ?? '—'
  const status = summary?.status ?? 'Active'

  return (
    <motion.div
      variants={adminStaggerItem}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={cn(
        'admin-hero-metric mb-6 overflow-hidden p-0 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col xl:flex-row">
        <div className="relative flex flex-1 items-start gap-4 border-b border-border/60 p-5 sm:items-center sm:p-6 xl:border-b-0 xl:border-r">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50/80 via-transparent to-transparent dark:from-sky-950/20"
            aria-hidden
          />
          <UserAvatar
            user={user}
            name={name}
            className="relative size-14 shrink-0 border-2 border-background shadow-sm sm:size-16"
            fallbackClassName="bg-sky-100 text-base font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
          />
          <div className="relative min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pensioner profile
              </p>
              <StatusPill
                label={status}
                variant={getVerificationStatusVariant(status)}
              />
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-[1.35rem]">
              {name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="size-3.5 shrink-0" />
                <span className="font-mono text-xs font-medium text-foreground">{summary?.ppoNumber ?? '—'}</span>
              </span>
              <span className="hidden text-border sm:inline" aria-hidden>
                |
              </span>
              <span className="capitalize">{pensionType}</span>
              {summary?.department && (
                <>
                  <span className="hidden text-border sm:inline" aria-hidden>
                    |
                  </span>
                  <span>{summary.department}</span>
                </>
              )}
            </div>
          </div>
          <div className="relative hidden shrink-0 lg:block">
            <AdminIcon3D icon={User} tone="blue" size="lg" />
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 bg-border/50 sm:grid-cols-3 xl:max-w-[52%]">
          <ProfileField
            label="Department"
            value={summary?.department}
            icon={Building2}
            className="border-b border-border/50 sm:border-b-0 sm:border-r"
          />
          <ProfileField
            label="Designation"
            value={summary?.designation}
            icon={Shield}
            className="border-b border-border/50 sm:border-b-0 sm:border-r"
          />
          <ProfileField
            label="Next verification due"
            value={summary?.nextVerificationDueDate}
            icon={CalendarClock}
          />
        </div>
      </div>
    </motion.div>
  )
}
