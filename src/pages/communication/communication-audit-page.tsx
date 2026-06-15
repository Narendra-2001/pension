import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { CommunicationAuditTimeline } from '@/components/communication/communication-audit-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchCommunicationAuditLog } from '@/data/communication-api'

export function CommunicationAuditPage() {
  const { data: auditLog, isLoading } = useQuery({
    queryKey: ['communication-audit'],
    queryFn: fetchCommunicationAuditLog,
  })

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Communication Audit Trail"
        description="Immutable log of notice generation, delivery, downloads, and notification events"
      />

      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <CommunicationAuditTimeline entries={auditLog ?? []} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
