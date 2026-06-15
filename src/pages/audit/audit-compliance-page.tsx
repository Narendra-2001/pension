import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  Shield,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { PageHeader } from '@/components/admin/shared/page-header'
import { AuditWorkflowSummaryStrip } from '@/components/audit/audit-workflow-pipeline'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const complianceChecks = [
  {
    title: 'Immutable Audit Trail',
    status: 'pass' as const,
    description: 'All user actions are logged with timestamps and cannot be modified after creation.',
  },
  {
    title: 'Old/New Value Capture',
    status: 'pass' as const,
    description: 'Status changes and field updates record both previous and new values.',
  },
  {
    title: 'User Attribution',
    status: 'pass' as const,
    description: 'Every log entry includes user name, role, department, and IP address where applicable.',
  },
  {
    title: 'Cross-Module Coverage',
    status: 'pass' as const,
    description: 'Audit logs span pensioners, recovery, suspensions, documents, communication, and verification.',
  },
  {
    title: 'Retention Policy',
    status: 'pass' as const,
    description: 'Audit logs retained for 7 years per government IT security guidelines.',
  },
  {
    title: 'Anomaly Detection',
    status: 'warn' as const,
    description: '2 bulk operations detected outside business hours in the last 30 days — review recommended.',
  },
]

const responsibilities = [
  'All pension-related changes have proper authorization trails',
  'Recovery case approvals follow multi-level sign-off policy',
  'Profile updates capture verified old and new values',
  'Suspension and restoration actions are properly documented',
  'Document verification decisions are traceable to an officer',
]

export function AuditCompliancePage() {
  const navigate = useNavigate()
  const passCount = complianceChecks.filter((c) => c.status === 'pass').length
  const warnCount = complianceChecks.filter((c) => c.status === 'warn').length
  const scorePercent = Math.round((passCount / complianceChecks.length) * 100)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Compliance Review"
        description="System integrity checks and audit trail compliance status"
        action={
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() => navigate({ to: '/audit/logs' })}
          >
            <FileSearch className="mr-1.5 size-4" />
            Review logs
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        <Card className="admin-card overflow-hidden">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="relative flex size-20 shrink-0 items-center justify-center">
              <svg className="size-20 -rotate-90" viewBox="0 0 36 36" aria-hidden>
                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-emerald-500"
                  strokeWidth="3"
                  strokeDasharray={`${scorePercent} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-lg font-bold tabular-nums">{scorePercent}%</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Overall compliance score</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {passCount} of {complianceChecks.length} checks passing
                {warnCount > 0 && ` · ${warnCount} item${warnCount > 1 ? 's' : ''} need review`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill icon={CheckCircle2} label={`${passCount} compliant`} tone="success" />
                {warnCount > 0 && (
                  <StatusPill icon={AlertTriangle} label={`${warnCount} review`} tone="warning" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <AuditWorkflowSummaryStrip />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {complianceChecks.map((check, i) => (
          <motion.div
            key={check.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card
              className={cn(
                'admin-card h-full transition-shadow hover:shadow-sm',
                check.status === 'warn' && 'border-amber-200/80 dark:border-amber-900/50',
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-lg',
                      check.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                    )}
                  >
                    {check.status === 'pass' ? (
                      <CheckCircle2 className="size-4" strokeWidth={2} />
                    ) : (
                      <Shield className="size-4" strokeWidth={2} />
                    )}
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      check.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                    )}
                  >
                    {check.status === 'pass' ? 'Compliant' : 'Review required'}
                  </span>
                </div>
                <CardTitle className="mt-3 text-sm font-semibold leading-snug">{check.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{check.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="admin-card mt-6">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="size-4" />
            </div>
            <CardTitle className="text-base">Audit officer responsibilities</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <p className="mb-4 text-sm text-muted-foreground">
            As Audit Officer, you are responsible for reviewing system audit logs to ensure:
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {responsibilities.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-sm"
              >
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StatusPill({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof CheckCircle2
  label: string
  tone: 'success' | 'warning'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        tone === 'success'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}
