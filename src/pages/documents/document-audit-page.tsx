import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { DocumentAuditTimeline } from '@/components/documents/document-audit-timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchDocumentAuditLog } from '@/data/documents-api'

export function DocumentAuditPage() {
  const { data: auditLog, isLoading } = useQuery({
    queryKey: ['document-audit-all'],
    queryFn: () => fetchDocumentAuditLog(),
  })

  if (isLoading) return <PageLoadingSkeleton />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader
        variant="admin"
        title="Document Audit Trail"
        description="Complete audit log of document uploads, verifications, rejections, and version changes"
      />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">All Document Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentAuditTimeline entries={auditLog ?? []} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
