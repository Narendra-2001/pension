import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

import { adminStaggerContainer, adminStaggerItem } from '@/components/admin/shared/admin-analytics-ui'
import { PageHeader } from '@/components/admin/shared/page-header'
import { PageLoadingSkeleton } from '@/components/admin/shared/empty-state'
import { ProfileSubNav } from '@/components/pensioner/profile/profile-sub-nav'
import { ProfileUpdateStatusBadge } from '@/components/profile-update/request-status-badge'
import { RequestTimeline } from '@/components/profile-update/request-timeline'
import { UploadedDocumentsGallery } from '@/components/shared/uploaded-documents-gallery'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchProfileUpdateRequest } from '@/data/profile-update-api'
import { REQUEST_TYPE_LABELS } from '@/lib/profile-update'

interface PensionerRequestDetailPageProps {
  requestId: string
}

export function PensionerRequestDetailPage({ requestId }: PensionerRequestDetailPageProps) {
  const { data: request, isLoading } = useQuery({
    queryKey: ['profile-update-request', requestId],
    queryFn: () => fetchProfileUpdateRequest(requestId),
  })

  if (isLoading || !request) return <PageLoadingSkeleton />

  const galleryDocuments = request.documents.map((doc, index) => ({
    id: `${request.id}-doc-${index}`,
    name: doc.name,
    fileName: doc.fileName,
    fileSize: doc.fileSize,
    mimeType: doc.mimeType,
    uploadedAt: request.submittedAt,
  }))

  return (
    <motion.div variants={adminStaggerContainer} initial="hidden" animate="show">
      <motion.div variants={adminStaggerItem}>
        <PageHeader
          variant="admin"
          title={request.id}
          description={REQUEST_TYPE_LABELS[request.requestType]}
          action={
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/pensioner/profile/requests">
                <ArrowLeft className="mr-1.5 size-4" /> Back to Requests
              </Link>
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={adminStaggerItem}>
        <ProfileSubNav activePath="/pensioner/profile/requests" />
      </motion.div>

      <motion.div variants={adminStaggerItem} className="mb-4">
        <ProfileUpdateStatusBadge status={request.status} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div variants={adminStaggerItem}>
            <Card className="admin-card">
              <CardHeader><CardTitle className="text-base">Request Information</CardTitle></CardHeader>
              <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
                <div><p className="text-muted-foreground">PPO Number</p><p className="font-medium">{request.ppoNumber}</p></div>
                <div><p className="text-muted-foreground">Pensioner</p><p className="font-medium">{request.pensionerName}</p></div>
                <div><p className="text-muted-foreground">Submitted</p><p className="font-medium">{request.submittedAt}</p></div>
                <div><p className="text-muted-foreground">Last Updated</p><p className="font-medium">{request.updatedAt}</p></div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={adminStaggerItem} className="grid gap-4 sm:grid-cols-2">
            <Card className="admin-card">
              <CardHeader><CardTitle className="text-base">Current Value</CardTitle></CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">{request.currentValue}</pre>
              </CardContent>
            </Card>
            <Card className="admin-card border-primary/20">
              <CardHeader><CardTitle className="text-base">Requested New Value</CardTitle></CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-sans text-sm font-medium">{request.newValue}</pre>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={adminStaggerItem}>
            <Card className="admin-card">
              <CardHeader><CardTitle className="text-base">Reason</CardTitle></CardHeader>
              <CardContent><p className="text-sm">{request.reason}</p></CardContent>
            </Card>
          </motion.div>

          {request.adminRemarks && (
            <motion.div variants={adminStaggerItem}>
              <Card className="admin-card">
                <CardHeader><CardTitle className="text-base">Admin Remarks</CardTitle></CardHeader>
                <CardContent><p className="text-sm">{request.adminRemarks}</p></CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={adminStaggerItem}>
            <Card className="admin-card overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">Uploaded Documents</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {request.documents.length
                    ? `${request.documents.length} document${request.documents.length > 1 ? 's' : ''} attached to this request`
                    : 'No supporting documents were attached'}
                </p>
              </CardHeader>
              <CardContent>
                <UploadedDocumentsGallery
                  documents={galleryDocuments}
                  emptyTitle="No documents attached"
                  emptyDescription="If you uploaded documents with this request, they will appear here for review and download."
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={adminStaggerItem}>
          <Card className="admin-card h-fit">
            <CardHeader><CardTitle className="text-base">Request Timeline</CardTitle></CardHeader>
            <CardContent>
              <RequestTimeline events={request.timeline} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
