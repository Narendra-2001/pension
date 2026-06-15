import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Hash,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'

import { adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import {
  PensionerPageShell,
  PensionerStatCard,
} from '@/components/pensioner/shared/pensioner-page-ui'
import { RestorationDocumentsGallery } from '@/components/suspension/restoration-documents-gallery'
import { RestorationStatusBadge } from '@/components/suspension/restoration-status-badge'
import { SuspensionTimeline } from '@/components/suspension/suspension-timeline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchRestorationRequest } from '@/data/suspension-api'
import {
  getRestorationStatusSteps,
  getRestorationStatusTone,
  RESTORATION_STATUS_LABELS,
} from '@/lib/suspension'
import { cn } from '@/lib/utils'
import type { RestorationRequest, RestorationRequestStatus } from '@/types/suspension'

interface RestorationRequestDetailPageProps {
  requestId: string
}

function RestorationStatusTrack({ status }: { status: RestorationRequestStatus }) {
  const steps = getRestorationStatusSteps(status)

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[520px] items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.key} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
                  step.state === 'complete' && 'border-emerald-500 bg-emerald-500 text-white',
                  step.state === 'current' && 'border-primary bg-primary/10 text-primary',
                  step.state === 'upcoming' && 'border-border bg-muted/40 text-muted-foreground',
                )}
              >
                {step.state === 'complete' ? <CheckCircle2 className="size-4" /> : index + 1}
              </div>
              <p
                className={cn(
                  'text-center text-[11px] font-semibold',
                  step.state === 'current' ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mb-5 h-0.5 flex-1 rounded-full',
                  step.state === 'complete' ? 'bg-emerald-400' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RequestSummaryHero({ request }: { request: RestorationRequest }) {
  const tone = getRestorationStatusTone(request.status)

  return (
    <motion.div
      variants={adminStaggerItem}
      className={cn(
        'relative mb-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.06)] sm:p-6',
        tone.hero,
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-2xl border',
                tone.badge,
              )}
            >
              <RotateCcw className="size-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                  {request.id}
                </Badge>
                <RestorationStatusBadge status={request.status} />
              </div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Restoration Request</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {RESTORATION_STATUS_LABELS[request.status]} · Suspension {request.suspensionCaseId}
              </p>
            </div>
          </div>

          <Button variant="outline" className="shrink-0 rounded-full" asChild>
            <Link to="/pensioner/suspension/requests">
              <ArrowLeft className="mr-1.5 size-4" /> All Requests
            </Link>
          </Button>
        </div>

        <RestorationStatusTrack status={request.status} />
      </div>
    </motion.div>
  )
}

export function RestorationRequestDetailPage({ requestId }: RestorationRequestDetailPageProps) {
  const { data: request, isLoading } = useQuery({
    queryKey: ['pensioner-restoration-request', requestId],
    queryFn: () => fetchRestorationRequest(requestId),
  })

  if (isLoading || !request) return <PageLoadingSkeleton />

  return (
    <PensionerPageShell>
      <RequestSummaryHero request={request} />

      <div className="grid gap-6 lg:grid-cols-5">
        <aside className="space-y-4 lg:col-span-2">
          <PensionerStatCard
            label="PPO Number"
            value={request.ppoNumber}
            icon={FileText}
            tone="blue"
          />
          <PensionerStatCard
            label="Suspension Case"
            value={<span className="font-mono">{request.suspensionCaseId}</span>}
            icon={Hash}
            tone="rose"
          />
          <PensionerStatCard
            label="Submitted On"
            value={format(parseISO(request.requestDate), 'dd MMM yyyy')}
            icon={CalendarDays}
            tone="amber"
          />
          <PensionerStatCard
            label="Last Updated"
            value={format(parseISO(request.updatedAt), 'dd MMM yyyy')}
            icon={Clock3}
            tone="violet"
          />

          <Card className="admin-card overflow-hidden">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <ShieldAlert className="size-4" />
                </div>
                <p className="text-sm font-semibold">Suspension Reason</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{request.suspensionReason}</p>
              {request.reviewedBy && (
                <p className="mt-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                  Reviewed by {request.reviewedBy}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="admin-card h-fit">
            <CardContent className="p-5">
              <p className="mb-4 text-sm font-semibold">Request Timeline</p>
              <SuspensionTimeline events={request.timeline} />
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6 lg:col-span-3">
          <motion.div variants={adminStaggerItem}>
            <Card className="admin-card overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageSquare className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Reason for Restoration</p>
                    <p className="text-xs text-muted-foreground">Your submitted explanation</p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed">
                  {request.reasonForRestoration}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {request.remarks && (
            <motion.div variants={adminStaggerItem}>
              <Card className="admin-card overflow-hidden">
                <CardContent className="p-5 sm:p-6">
                  <p className="mb-3 text-sm font-semibold">Additional Remarks</p>
                  <p className="whitespace-pre-wrap rounded-2xl border border-border/50 bg-muted/20 p-4 text-sm leading-relaxed text-muted-foreground">
                    {request.remarks}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {request.rejectionReason && (
            <motion.div variants={adminStaggerItem}>
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                <p className="font-semibold text-destructive">Rejection Reason</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {request.rejectionReason}
                </p>
              </div>
            </motion.div>
          )}

          {request.adminRemarks && (
            <motion.div variants={adminStaggerItem}>
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200">Admin Remarks</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{request.adminRemarks}</p>
              </div>
            </motion.div>
          )}

          <motion.div variants={adminStaggerItem}>
            <Card className="admin-card overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">Uploaded Documents</p>
                    <p className="text-xs text-muted-foreground">
                      {request.documents.length} file{request.documents.length === 1 ? '' : 's'} attached
                      with official layout previews
                    </p>
                  </div>
                  <Badge variant="secondary" className="w-fit rounded-full font-normal">
                    {request.documents.length} document{request.documents.length === 1 ? '' : 's'}
                  </Badge>
                </div>
                <RestorationDocumentsGallery request={request} documents={request.documents} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PensionerPageShell>
  )
}
