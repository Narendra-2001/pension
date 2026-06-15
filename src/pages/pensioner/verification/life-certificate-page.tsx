import { useListViewMode } from '@/hooks/use-list-view-mode'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import {
  adminStaggerItem,
  AdminSectionHeading,
} from '@/components/admin/shared/admin-analytics-ui'
import { AdminListPageHeader } from '@/components/admin/shared/admin-list-page-header'
import { DataListView } from '@/components/admin/shared/data-list-view'
import { ListFiltersPopover } from '@/components/admin/shared/list-filters-popover'
import { ListRecordCard } from '@/components/admin/shared/list-record-card'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import {
  HeroHighlight,
  PensionerPageShell,
  PensionerStatCard,
} from '@/components/pensioner/shared/pensioner-page-ui'
import { getVerificationStatusVariant, StatusPill } from '@/components/pensioner/shared/status-pill'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchVerificationData } from '@/data/pensioner-api'
import {
  getLifeCertDisplayLabel,
  isPendingAdminReview,
  shouldShowResubmitAction,
} from '@/lib/life-cert-status'
import { matchesListSearch } from '@/lib/list-search'
import { useAuth } from '@/providers/auth-provider'
import type { LifeCertStatus, VerificationHistoryEntry } from '@/types/pensioner-portal'

export function LifeCertificatePage() {
  const { user } = useAuth()
  const pensionerId = user?.pensionerId ?? ''
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LifeCertStatus>('all')
  const [viewMode, setViewMode] = useListViewMode()

  const { data, isLoading } = useQuery({
    queryKey: ['pensioner-verification', pensionerId],
    queryFn: () => fetchVerificationData(pensionerId),
    enabled: !!pensionerId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })

  const history = useMemo(() => data?.history ?? [], [data?.history])

  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false
      return matchesListSearch(search, [entry.submittedAt, entry.method, entry.status, entry.remarks])
    })
  }, [history, search, statusFilter])

  const historyColumns = useMemo<ColumnDef<VerificationHistoryEntry>[]>(
    () => [
      { accessorKey: 'submittedAt', header: 'Date' },
      { accessorKey: 'method', header: 'Method' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusPill
            label={getLifeCertDisplayLabel(row.original.status)}
            variant={getVerificationStatusVariant(row.original.status)}
          />
        ),
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.remarks ?? '—'}</span>,
      },
    ],
    [],
  )

  const activeFilterCount = statusFilter !== 'all' ? 1 : 0

  if (isLoading || !data) return <PageLoadingSkeleton />

  const status = data.status
  const statusLabel = getLifeCertDisplayLabel(status)
  const isRejected = status === 'rejected' || !!data.rejectionReason
  const pendingReview = isPendingAdminReview(status)
  const showStartButton = shouldShowResubmitAction(status, false, data.rejectionReason)
  const startButtonLabel =
    isRejected || data.rejectionReason ? 'Resubmit Life Certificate' : 'Start Verification'
  const startSearch = isRejected || data.rejectionReason
    ? ({ mode: 'resubmit' as const })
    : ({} as const)

  return (
    <PensionerPageShell>
      <motion.div variants={adminStaggerItem}>
        <PageHeader
          variant="admin"
          title="Life Certificate / Verification"
          description="View your verification status, due dates, and submission history"
          action={
            showStartButton ? (
              <Button className="rounded-full shadow-sm" asChild>
                <Link to="/pensioner/verification/start" search={startSearch}>
                  <Shield className="mr-1.5 size-4" />
                  {startButtonLabel}
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            ) : null
          }
        />
      </motion.div>

      <AnimatePresence mode="popLayout">
        {isRejected && data.rejectionReason && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="rounded-2xl border-destructive/40 shadow-sm">
              <XCircle />
              <AlertTitle>Action Required — Life Certificate Rejected</AlertTitle>
              <AlertDescription>
                <p>Your submission was not approved. Please review the reason below and resubmit.</p>
                <p className="mt-2 rounded-xl bg-destructive/10 px-3 py-2 text-foreground">
                  <span className="font-medium">Reason: </span>
                  {data.rejectionReason}
                </p>
                {data.rejectedAt && (
                  <p className="mt-2 text-xs">Rejected on {data.rejectedAt}</p>
                )}
                <Button className="mt-3 rounded-xl" size="sm" asChild>
                  <Link to="/pensioner/verification/start" search={{ mode: 'resubmit' }}>
                    Resubmit now
                    <ArrowRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {pendingReview && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <Alert className="rounded-2xl border-amber-500/30 bg-amber-500/5 shadow-sm">
              <Clock />
              <AlertTitle>In Progress — Awaiting Admin Review</AlertTitle>
              <AlertDescription>
                Your life certificate has been submitted and is under review by the pension administrator.
                You will be notified once it is approved or rejected.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-6"
          >
            <Alert className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 shadow-sm">
              <CheckCircle2 />
              <AlertTitle>Life Certificate Approved</AlertTitle>
              <AlertDescription>
                Your annual life certificate has been approved.
                {data.nextVerificationDueDate && (
                  <span> Next verification is due by {data.nextVerificationDueDate}.</span>
                )}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={adminStaggerItem} className="mb-6">
        <HeroHighlight
          label="Verification Status"
          value={statusLabel}
          hint={
            data.nextVerificationDueDate
              ? `Next due: ${data.nextVerificationDueDate}`
              : 'Complete verification to continue receiving pension'
          }
          icon={ShieldCheck}
          tone={status === 'approved' ? 'emerald' : isRejected ? 'amber' : 'blue'}
        />
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.lastVerificationDate && (
          <PensionerStatCard
            label="Last Verification"
            value={data.lastVerificationDate}
            icon={CheckCircle2}
            tone="green"
            delay={0.08}
          />
        )}
        {data.nextVerificationDueDate && (
          <PensionerStatCard
            label="Next Verification Due"
            value={data.nextVerificationDueDate}
            icon={Calendar}
            tone="amber"
            delay={0.12}
          />
        )}
        <PensionerStatCard
          label="Current Status"
          value={<StatusPill label={statusLabel} variant={getVerificationStatusVariant(status)} />}
          icon={Shield}
          tone="violet"
          delay={0.16}
        />
      </div>

      <motion.div variants={adminStaggerItem}>
        <AdminSectionHeading
          title="Verification History"
          description="Past life certificate submissions and their status"
        />
      </motion.div>

      <motion.div variants={adminStaggerItem}>
        <AdminListPageHeader
          title=""
          count={filteredHistory.length}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search history..."
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={
            <ListFiltersPopover
              activeCount={activeFilterCount}
              title="Filter history"
              onClear={() => setStatusFilter('all')}
            >
              <div className="space-y-2">
                <Label htmlFor="verification-status-filter">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as 'all' | LifeCertStatus)}
                >
                  <SelectTrigger id="verification-status-filter" className="w-full rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="submitted">In progress</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="in_progress">In progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </ListFiltersPopover>
          }
        />
      </motion.div>

      <motion.div variants={adminStaggerItem}>
        <DataListView
          columns={historyColumns}
          data={filteredHistory}
          pageSize={8}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={false}
          renderCard={(entry, serialNo) => (
            <ListRecordCard
              serialNo={serialNo}
              title={entry.submittedAt}
              subtitle={entry.method}
              badges={
                <StatusPill
                  label={getLifeCertDisplayLabel(entry.status)}
                  variant={getVerificationStatusVariant(entry.status)}
                />
              }
              fields={[{ label: 'Remarks', value: entry.remarks ?? '—' }]}
            />
          )}
        />
      </motion.div>
    </PensionerPageShell>
  )
}
