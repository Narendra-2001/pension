import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Activity, ScrollText } from 'lucide-react'
import { useMemo, useState } from 'react'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { AuditLogDetailDialog } from '@/components/audit/audit-log-detail-dialog'
import { AuditLogTimeline } from '@/components/audit/audit-log-timeline'
import { CommunicationAuditTimeline } from '@/components/communication/communication-audit-timeline'
import { DocumentAuditTimeline } from '@/components/documents/document-audit-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { fetchCommunicationAuditLog } from '@/data/communication-api'
import { fetchDocumentAuditLog } from '@/data/documents-api'
import { fetchSystemAuditLogs } from '@/data/audit-api'
import type { SystemAuditEntry } from '@/types/audit'

type ModuleTrail = 'recovery' | 'communication' | 'documents'

interface AuditModuleTrailPageProps {
  module: ModuleTrail
}

const titles: Record<ModuleTrail, { title: string; description: string }> = {
  recovery: {
    title: 'Recovery Audit Trail',
    description: 'Audit logs for recovery case creation, approvals, payments, and closures',
  },
  communication: {
    title: 'Communication Audit Trail',
    description: 'Notice generation, delivery, downloads, and notification events',
  },
  documents: {
    title: 'Document Audit Trail',
    description: 'Document uploads, verifications, rejections, and version changes',
  },
}

export function AuditModuleTrailPage({ module }: AuditModuleTrailPageProps) {
  const [search, setSearch] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<SystemAuditEntry | null>(null)

  const { data: recoveryLogs, isLoading: recoveryLoading } = useQuery({
    queryKey: ['audit-module-recovery'],
    queryFn: () => fetchSystemAuditLogs({ module: 'recovery' }),
    enabled: module === 'recovery',
  })

  const { data: commLogs, isLoading: commLoading } = useQuery({
    queryKey: ['communication-audit'],
    queryFn: fetchCommunicationAuditLog,
    enabled: module === 'communication',
  })

  const { data: docLogs, isLoading: docLoading } = useQuery({
    queryKey: ['document-audit-all'],
    queryFn: () => fetchDocumentAuditLog(),
    enabled: module === 'documents',
  })

  const isLoading =
    (module === 'recovery' && recoveryLoading) ||
    (module === 'communication' && commLoading) ||
    (module === 'documents' && docLoading)

  const meta = titles[module]

  const filteredRecoveryLogs = useMemo(() => {
    if (!recoveryLogs || !search.trim()) return recoveryLogs ?? []
    const q = search.toLowerCase()
    return recoveryLogs.filter(
      (e) =>
        e.entityLabel?.toLowerCase().includes(q) ||
        e.user.toLowerCase().includes(q) ||
        e.remarks?.toLowerCase().includes(q),
    )
  }, [recoveryLogs, search])

  const entryCount =
    module === 'recovery'
      ? filteredRecoveryLogs.length
      : module === 'communication'
        ? (commLogs?.length ?? 0)
        : (docLogs?.length ?? 0)

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader variant="admin" title={meta.title} description={meta.description} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <StatCard icon={ScrollText} label="Total events" value={entryCount} />
        <StatCard
          icon={Activity}
          label="Module"
          value={meta.title.replace(' Audit Trail', '')}
          isText
        />
      </div>

      <Card className="admin-card">
        <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Activity log</CardTitle>
          {module === 'recovery' && (
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs rounded-lg"
            />
          )}
        </CardHeader>
        <CardContent className="pt-5">
          {module === 'recovery' && (
            <AuditLogTimeline
              entries={filteredRecoveryLogs}
              onSelect={setSelectedEntry}
            />
          )}
          {module === 'communication' && <CommunicationAuditTimeline entries={commLogs ?? []} />}
          {module === 'documents' && <DocumentAuditTimeline entries={docLogs ?? []} />}
        </CardContent>
      </Card>

      <AuditLogDetailDialog
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => !open && setSelectedEntry(null)}
      />
    </motion.div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  isText,
}: {
  icon: typeof ScrollText
  label: string
  value: number | string
  isText?: boolean
}) {
  return (
    <Card className="admin-card">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={isText ? 'text-sm font-semibold' : 'text-xl font-bold tabular-nums'}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
